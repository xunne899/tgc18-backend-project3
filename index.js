const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
var helpers = require("handlebars-helpers")({
  handlebars: hbs.handlebars,
});

const cors = require('cors');
const jwt = require('jsonwebtoken');


const session = require("express-session");
const flash = require("connect-flash");
const FileStore = require("session-file-store")(session);
const csrf = require("csurf");



const app = express();

// enable env files
require("dotenv").config();

app.use(cors());
// set up sessions
// setup sessions
app.use(
  session({
    store: new FileStore(), // we want to use files to store sessions
    secret: process.env.SESSION_SECRET, // used to generate the session id
    resave: false, // do we automatically recreate the session even if there is no change to it
    saveUninitialized: true, // if a new browser connects do we create a new session
  })
);

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


const landingRoutes = require("./routes/landing");
const productRoutes = require("./routes/products");

app.use("/", landingRoutes);
app.use("/products", productRoutes);

app.listen(3001, function () {
  console.log("Server has started");
});
