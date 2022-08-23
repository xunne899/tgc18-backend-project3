const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { checkIfAuthenticatedJWT } = require("../../middlewares");
const dataLayer = require("../../dal/customers");
// const { BlacklistedToken } = require('../../models');

const { Customer, BlacklistedToken } = require("../../models");

const generateAccessToken = function (username, id, email, tokenSecret, expiry) {
  // 1st arg -- payload
  return jwt.sign(
    {
      username,
      id,
      email,
    },
    tokenSecret,
    {
      expiresIn: expiry,
    }
  );
};

const getHashedPassword = (password) => {
  const sha256 = crypto.createHash("sha256");
  // the output will be converted to hexdecimal
  const hash = sha256.update(password).digest("base64");
  return hash;
};

router.post("/login", async function (req, res) {
  const customer = await Customer.where({
    email: req.body.email,
    password: req.body.password,
  }).fetch({
    require: false,
  });
  // if the user with the provided email and password is found
  if (customer) {
    const accessToken = generateAccessToken(customer.get("username"), customer.get("id"), customer.get("email"), process.env.TOKEN_SECRET, "20min");

    const refreshToken = generateAccessToken(customer.get("username"), customer.get("id"), customer.get("email"), process.env.REFRESH_TOKEN_SECRET, "3d");
    // Access token should be in react state

    res.json({
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } else {
    // error
    res.status(401);
    res.json({
      error: "Invalid email or password",
    });
  }
});

router.post("/register", async function (req, res) {
  let fielderror = {};
  let haveError = false;
  let regex = /^[\w#][\w\.\’+#](.[\w\\’#]+)\@[a-zA-Z0-9]+(.[a-zA-Z0-9]+)*(.[a-zA-Z]{2,20})$/;

  const name = req.body.name;

  if (name.length == 0) {
    fielderror.name ? "Name must not be empty" : "";
  }

  const username = req.body.username;
  if (username.length == 0) {
    fielderror.username ? "Username must not be empty" : "";
  }

  const email = req.body.email;
  const email_length_err = email.length == 0 || email.length > 320;
  let emailHasErr = !email.match(regex) || email_length_err;
  emailHasErr ? (fielderror.email = "Please enter a valid email") : "";

  const password = req.body.password;
  if (password.length == 0) {
    fielderror.password ? "Password must not be empty" : "";
  }

  const contact_number = req.body.contact_number;
  console.log(contact_number);
  if (contact_number.length == 0) {
    fielderror.contact_number ? "Contact number must not be empty" : "";
  }

  console.log("This is field error ======>  ", fielderror);

  for (const [key, value] of Object.entries(fielderror)) {
    if (value.length > 0) {
      haveError = true;
      break;
    }
  }

  console.log("haveError ========> ", haveError);
  // try {
  // const customer = await dataLayer.createCustomer({
  //   name,
  //   username,
  //   email,
  //   password,
  //   contact_number,
  // });
  const customer = new Customer({
    name, username, email, password, contact_number, created_date: new Date()
  })
  await customer.save();
  console.log(customer);
  // res.json({
  //   status: status,
  //   data: data
  // });
  res.status(201);
  res.json(customer);
  // } catch (haveError) {
  //   console.log(fielderror);
  // res.status(500);
  // res.json({
  //   check: "checks",
  //   status: "Server error",
  // });
  // }
});

router.get("/profile", checkIfAuthenticatedJWT, function (req, res) {
  const customer = req.customer;
  res.json(customer);
});

// this route to get a new access token
router.post("/refresh", async function (req, res) {
  // get the refreshtoken from the body
  const refreshToken = req.body.refreshToken;

  if (refreshToken) {
    // check if the token is already blacklisted
    const blacklistedToken = await BlacklistedToken.where({
      token: refreshToken,
    }).fetch({
      require: false,
    });

    // if the blacklistedToken is NOT null, then it means it exist
    if (blacklistedToken) {
      res.status(400);
      res.json({
        error: "Refresh token has been blacklisted",
      });
      return;
    }

    // verify if it is legit
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, function (err, tokenData) {
      if (!err) {
        // generate a new access token and send back
        const accessToken = generateAccessToken(tokenData.userName, tokenData.id, tokenData.email, process.env.TOKEN_SECRET, "1h");
        res.json({
          accessToken,
        });
      } else {
        res.status(400);
        res.json({
          error: "Invalid refresh token",
        });
      }
    });
  } else {
    res.status(400);
    res.json({
      error: "No refresh token found",
    });
  }
});

router.post("/logout", async function (req, res) {
  const refreshToken = req.body.refreshToken;
  if (refreshToken) {
    // add the refresh token to the black list
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async function (err, tokenData) {
      if (!err) {
        // add the refresh token to the black list
        const token = new BlacklistedToken();
        token.set("token", refreshToken);
        token.set("date_created", new Date());
        await token.save();
        res.json({
          message: "Logged out",
        });
      }
    });
  } else {
    res.status(400);
    res.json({
      error: "Refresh Token not found!",
    });
  }
});

module.exports = router;