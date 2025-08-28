const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../Controller/user.js");

router
    .route("/signup")
    .get( userController.renderSignupForm)
    .post( userController.signUp);

router
    .route("/login")
    .get( wrapAsync(userController.renderLoginForm))
    .post( saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), userController.login);

router.get("/logout", userController.logout);

module.exports = router;
