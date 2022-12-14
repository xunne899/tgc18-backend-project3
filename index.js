
const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const helpers = require("handlebars-helpers")({
  handlebars: hbs.handlebars,
});
const cors = require("cors");
const session = require("express-session");
const flash = require("connect-flash");
const FileStore = require("session-file-store")(session);
const csrf = require("csurf");
require("dotenv").config();

const app = express();

app.set("view engine", "hbs");

app.use(express.static("public"));

wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(
  session({
    store: new FileStore(),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());

app.use(function (req, res, next) {
  res.locals.success_messages = req.flash("success_messages");
  res.locals.error_messages = req.flash("error_messages");
  next();
});

const csrfInstance = csrf();
app.use(function (req, res, next) {
  if (req.url === "/checkout/process_payment" || req.url.slice(0, 5) == "/api/") {
    next();
  } else {
    csrfInstance(req, res, next);
  }
});

app.use(function (err, req, res, next) {
  if (err && err.code === "EBADCSRFTOKEN") {
    req.flash("error_messages", "The form has expired. Please try again");

    res.redirect("back");
  } else {
    next();
  }
});

app.use(function (req, res, next) {
  if (req.csrfToken) {
    res.locals.csrfToken = req.csrfToken();
  }
  next();
});

app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  next();
});

app.use(function (req, res, next) {
  res.locals.cloudinaryName = process.env.CLOUDINARY_NAME;
  res.locals.cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
  res.locals.cloudinaryPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  next();
});

const mainpagePathRoutes = require("./routes/landing");
const productPathRoutes = require("./routes/products");
const userPathRoutes = require("./routes/users");
const cloudinaryPathRoutes = require("./routes/cloudinary");
const loginPathRoutes = require("./routes/login");
const orderPathRoutes = require("./routes/orders");

// const cartAPIPathRoutes = require("./routes/carts");
// const checkoutAPIPathRoutes = require("./routes/api/checkout");
// const productAPIPathRoutes = require("./routes/api/products");
// const orderAPIPathRoutes = require("./routes/api/orders");

const api = {
  customers: require("./routes/api/customers"),
  carts: require("./routes/api/carts"),
  products: require("./routes/api/products"),
  orders: require("./routes/api/orders"),
  checkout: require("./routes/api/checkout"),
};
// const customerRoutes =  require("./routes/api/customers");

const { checkIfAuthenticated, checkIfAuthenticatedJWT } = require("./middlewares");
const { getCart } = require("./dal/carts");

app.use("/", mainpagePathRoutes);

app.use("/products", [checkIfAuthenticated], productPathRoutes);
app.use("/users", userPathRoutes);
app.use("/login", loginPathRoutes);
app.use("/cloudinary", cloudinaryPathRoutes);
app.use("/orders", [checkIfAuthenticated], orderPathRoutes);

// app.use("/checkout", checkoutAPIPathRoutes);
// app.use("/cart", [checkIfAuthenticated], cartAPIPathRoutes);

app.use("/api/carts", express.json(), checkIfAuthenticatedJWT, api.carts);
app.use("/api/customers", express.json(), api.customers);
app.use("/api/products", express.json(), api.products);
app.use("/api/orders", express.json(), checkIfAuthenticatedJWT, api.orders);
app.use("/api/checkout", api.checkout);

// app.use("/api/carts", express.json(), api.carts);

// Share the user data with hbs files
app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  next();
});

app.listen(process.env.PORT, function () {
  console.log("Server has started");
});
