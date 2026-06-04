const Booking    = require('../models/Booking');
const Package    = require('../models/Package');
const TripOption = require('../models/TripOption');
const { AppError } = require('../app');

const createDraft = async (req, res, next) => {
  try {
    const { packageId, date, travelers, tier, totalPrice, basePrice, isCustom, packageName, packageType, location } = req.body;

    let pkgName = packageName;
    let pkgType = packageType || 'day';

    if (packageId && !isCustom) {
      const pkg = await Package.findById(packageId);
      if (!pkg) return next(new AppError('Package not found.', 404));
      pkgName = pkgName || pkg.name;
      pkgType = pkgType || pkg.type;
    }

    const draft = await Booking.create({
      userId: req.user._id,
      userEmail: req.user.email,
      packageId: isCustom ? null : packageId,
      packageName: pkgName || 'Custom Trip',
      packageType: pkgType,
      date,
      travelers,
      tier,
      totalPrice,
      basePrice: basePrice || 0,
      status: 'draft',
      paymentStatus: 'pending',
      isCustom: isCustom || false,
      location: location || '',
    });

    res.status(201).json({
      status: 'success',
      data: { booking: draft, draftId: draft._id },
    });
  } catch (err) {
    next(err);
  }
};

const getDraft = async (req, res, next) => {
  try {
    const draft = await Booking.findById(req.params.id).populate('packageId', 'name type city image');
    if (!draft) return next(new AppError('Draft booking not found.', 404));

    if (draft.userId.toString() !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to access this booking.', 403));
    }

    res.status(200).json({ status: 'success', data: { booking: draft } });
  } catch (err) {
    next(err);
  }
};

const updateDraft = async (req, res, next) => {
  try {
    const { additionalTravelers, specialRequests } = req.body;

    const draft = await Booking.findById(req.params.id);
    if (!draft) return next(new AppError('Draft booking not found.', 404));
    if (draft.userId.toString() !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to update this booking.', 403));
    }

    if (additionalTravelers) draft.additionalTravelers = additionalTravelers;
    if (specialRequests !== undefined) draft.specialRequests = specialRequests;
    await draft.save();

    res.status(200).json({ status: 'success', data: { booking: draft } });
  } catch (err) {
    next(err);
  }
};

const confirmBooking = async (req, res, next) => {
  try {
    const draft = await Booking.findById(req.params.id);
    if (!draft) return next(new AppError('Booking not found.', 404));
    if (draft.userId.toString() !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to confirm this booking.', 403));
    }
    if (draft.status !== 'draft') {
      return next(new AppError('This booking is already confirmed or cancelled.', 400));
    }

    draft.status = 'confirmed';
    draft.paymentStatus = 'paid';
    await draft.save();

    const populated = await Booking.findById(draft._id).populate('packageId', 'name type city image');

    res.status(200).json({ status: 'success', data: { booking: populated } });
  } catch (err) {
    next(err);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      userId: req.user._id,
      status: { $ne: 'draft' },
    })
      .populate('packageId', 'name type city image')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings },
    });
  } catch (err) {
    next(err);
  }
};

const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('packageId', 'name type city image');
    if (!booking) return next(new AppError('Booking not found.', 404));

    const isOwner = booking.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isAdmin) {
      return next(new AppError('You do not have permission to view this booking.', 403));
    }

    res.status(200).json({ status: 'success', data: { booking } });
  } catch (err) {
    next(err);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new AppError('Booking not found.', 404));

    const isOwner = booking.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isAdmin) {
      return next(new AppError('You do not have permission to cancel this booking.', 403));
    }

    if (booking.status === 'cancelled') {
      return next(new AppError('This booking is already cancelled.', 400));
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || '';
    await booking.save();

    res.status(200).json({ status: 'success', data: { booking } });
  } catch (err) {
    next(err);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type)   filter.packageType = req.query.type;

    const page  = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip  = (page - 1) * limit;

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email image')
      .populate('packageId', 'name type city')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      total,
      data: { bookings },
    });
  } catch (err) {
    next(err);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const validStatuses = ['confirmed', 'cancelled', 'checked-in', 'checked-out'];
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid booking status.', 400));
    }

    const update = { status };
    if (status === 'cancelled' && reason) update.cancellationReason = reason;

    const booking = await Booking.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('userId', 'name email')
      .populate('packageId', 'name type');

    if (!booking) return next(new AppError('Booking not found.', 404));

    res.status(200).json({ status: 'success', data: { booking } });
  } catch (err) {
    next(err);
  }
};

const getTripOptions = async (req, res, next) => {
  try {
    const options = await TripOption.find().sort('type');
    res.status(200).json({
      status: 'success',
      data: {
        destinations:   options.filter(o => o.type === 'destination'),
        accommodations: options.filter(o => o.type === 'accommodation'),
        rooms:          options.filter(o => o.type === 'room'),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createDraft,
  getDraft,
  updateDraft,
  confirmBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  getTripOptions,
};
