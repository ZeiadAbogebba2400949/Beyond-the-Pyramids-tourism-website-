const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.post('/draft',            protect, bookingController.createDraft);
router.get('/draft/:id',         protect, bookingController.getDraft);
router.put('/draft/:id',         protect, bookingController.updateDraft);
router.put('/draft/:id/confirm', protect, bookingController.confirmBooking);
router.get('/trip-options',      protect, bookingController.getTripOptions);

router.get('/',           protect, bookingController.getMyBookings);
router.get('/:id',        protect, bookingController.getBooking);
router.put('/:id/cancel', protect, bookingController.cancelBooking);

module.exports = router;
