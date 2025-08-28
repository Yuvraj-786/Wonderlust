const express = require('express');
const router = express.Router({mergeParams: true});
const Review = require('../models/review');
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require('../models/listing');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware.js');
const reviewController = require("../Controller/review.js");
// REviews
// post route.
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;