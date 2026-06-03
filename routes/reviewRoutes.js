const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

const { validateReview } = require('../middleware/validate');

router.post('/', protect, validateReview, reviewController.createReview);
router.get('/package/:packageId', reviewController.getPackageReviews);
router.get('/', protect, authorize('Admin'), reviewController.getAllReviews);
router.put('/:id', protect, reviewController.updateReview);
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;
