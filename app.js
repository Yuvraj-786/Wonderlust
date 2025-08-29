
// Loading Environment Variables

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ debug: true });
}

console.log(
  "ATLASDB_URL:",
  process.env.ATLASDB_URL.replace(/:\/\/.*@/, "://<hidden>@")
);


// Imports

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError.js");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


// App Setup

const app = express();
const dbUrl = process.env.ATLASDB_URL;
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));


// Database Connection
// 
async function main() {
  try {
    await mongoose.connect(process.env.ATLASDB_URL, {
      serverSelectionTimeoutMS: 5000,
      tls: true
    });
    console.log(" Database connected successfully");


    // Session Store

    const store = MongoStore.create({
      mongoUrl: dbUrl,
      crypto: { secret: process.env.SECRET, },
      touchAfter: 24 * 3600, // Reduce frequent session writes
    });

    store.on("error", (err) => {
      console.error("Error in Mongo session store:", err);
    });

    const sessionOptions = {
      store,
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      },
    };

    app.use(session(sessionOptions));
    app.use(flash());


    // Passport Authentication

    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());


    // Middleware for Flash 

    app.use((req, res, next) => {
      res.locals.success = req.flash("success");
      res.locals.error = req.flash("error");
      res.locals.currUser = req.user;
      next();
    });

    app.get("/", (req, res) => {
      res.redirect("/listings");   
    });

    // Routes

    app.use("/listings", listingRouter);
    app.use("/listings/:id/reviews", reviewRouter);
    app.use("/", userRouter);

    // Error Handler

    app.use((err, req, res, next) => {
      let { statusCode = 500, message = "Something went wrong" } = err;
      console.error("Error:", statusCode, message);
      res.status(statusCode).render("error", { err });
    });

    // Start Server

    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(" Database connection failed:", err);
    process.exit(1);
  }
}

main();
