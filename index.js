const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
var helpers = require("handlebars-helpers")({
  handlebars: hbs.handlebars,
});

const cors = require("cors");
const jwt = require("jsonwebtoken");

const session = require("express-session");
const flash = require("connect-flash");
const FileStore = require("session-file-store")(session);
const csrf = require("csurf");

const app = express();

// enable env files
require("dotenv").config();

const csrfInstance = csrf();
app.use(function (req, res, next) {
  // console.log("Checking for csrf exclusion");
  if (req.url === "/checkout/process_payment" || req.url.slice(0, 5) == "/api/") {
    next();
  } else {
    csrfInstance(req, res, next);
  }
});

// app.use(csrf());
// Share CSRF with hbs files
// Share CSRF with hbs files
app.use(function (req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use(function (err, req, res, next) {
  if (err && err.code == "EBADCSRFTOKEN") {
    req.flash("error_messages", "The form has expired. Please try again");
    res.redirect("back");
  } else {
    next();
  }
});
app.use(cors());
// // set up sessions
// // setup sessions
app.use(
  session({
    store: new FileStore(), // we want to use files to store sessions
    secret: process.env.SESSION_SECRET, // used to generate the session id
    resave: false, // do we automatically recreate the session even if there is no change to it
    saveUninitialized: true, // if a new browser connects do we create a new session
  })
);

// setup a middleware to share data across all hbs files
app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  next();
});

app.use(flash());

// Register Flash middleware
app.use(function (req, res, next) {
  res.locals.success_messages = req.flash("success_messages");
  res.locals.error_messages = req.flash("error_messages");
  next();
});

app.use(
  express.urlencoded({
    extended: false,
  })
);

app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

const mainpagePathRoutes = require("./routes/landing");
const productPathRoutes = require("./routes/products");
const userPathRoutes = require("./routes/users");
const cloudinaryPathRoutes = require("./routes/cloudinary.js");
const loginPathRoutes = require("./routes/login");

const cartPathRoutes = require("./routes/api/carts");
const checkoutPathRoutes = require("./routes/api/checkout");
const orderPathRoutes = require("./routes/orders");

const api = {
  customers: require("./routes/api/customers"),
  // carts: require("./routes/api/carts"),
};
// const customerRoutes =  require("./routes/api/customers");

const { checkIfAuthenticated, checkIfAuthenticatedJWT } = require("./middlewares");
const { getCart } = require("./dal/carts");

app.use("/cart", [checkIfAuthenticated], cartPathRoutes);
app.use("/",mainpagePathRoutes);

app.use("/products", [checkIfAuthenticated], productPathRoutes);
app.use("/users", userPathRoutes);
app.use("/login", loginPathRoutes);
app.use("/cloudinary", cloudinaryPathRoutes);
app.use("/checkout", checkoutPathRoutes);

app.use("/api/customers", express.json(), api.customers);
// app.use("/api/carts", express.json(), api.carts);
app.use("/orders", orderPathRoutes);

// Share the user data with hbs files
app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  next();
});

app.listen(3001, function () {
  console.log("Server has started");
});
