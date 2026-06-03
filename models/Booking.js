const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    userEmail: {
      type: String,
      required: [true, 'User email is required'],
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
    },
    packageName: {
      type: String,
      required: [true, 'Package name is required'],
    },
    packageType: {
      type: String,
      enum: ['day', 'week', 'single', 'custom'],
      default: 'day',
    },
    date: {
      type: String,
      default: '',
    },
    startDate: { type: Date },
    endDate:   { type: Date },
    travelers: {
      type: Number,
      required: [true, 'Number of travelers is required'],
      min: [1, 'At least 1 traveler is required'],
      max: [15, 'Maximum 15 travelers allowed'],
    },
    tier: {
      type: String,
      enum: ['standard', 'deluxe', 'full', 'Architect Custom', ''],
      default: 'standard',
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
    },
    basePrice: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'confirmed', 'cancelled', 'checked-in', 'checked-out'],
      default: 'draft',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      default: '',
    },
    additionalTravelers: [
      {
        firstName:   { type: String },
        lastName:    { type: String },
        dob:         { type: String },
        nationality: { type: String },
        phone:       { type: String },
      },
    ],
    specialRequests: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

bookingSchema.pre('save', async function (next) {
  if (!this.bookingNumber) {
    const year   = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    this.bookingNumber = `EG-${year}-${random}`;
  }
  next();
});

bookingSchema.index({ userId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingNumber: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
