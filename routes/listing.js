const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../Controller/listing.js");
const multer = require("multer");
const {storage} = require('../cloudConfig.js');
const upload = multer({storage });
const Listing = require("../models/listing.js");
router 
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn, 
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.createListing));
    
router.get('/search', isLoggedIn, wrapAsync(listingController.searchResults));

// add new listing page.
router.get("/new", isLoggedIn, listingController.newForm);

router
    .route("/:id")
    .get(wrapAsync(listingController.showListing)) // show route
    .put(
        isLoggedIn, 
        isOwner, 
        upload.single('listing[image]'), 
        validateListing, 
        wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));


// edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));


module.exports = router