const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const getHashedPassword = (password) => {
  const sha256 = crypto.createHash("sha256");
  const hash = sha256.update(password).digest("base64");
  return hash;
};
// import in User Model

const { User } = require("../models");
const dataLayer = require("../dal/users");
const { createRegistrationForm, createLoginForm, createUserForm, bootstrapField } = require("../forms");

router.get("/", async (req, res) => {
  const users = await User.collection().fetch();
  res.render("users/index", {
    users: users.toJSON(),
  });
});

router.get("/register", (req, res) => {
  // display the registration form
  const registerForm = createRegistrationForm();
  res.render("users/register", {
    form: registerForm.toHTML(bootstrapField),
  });
});

router.get("/:user_id/update", async (req, res) => {
  const user = await dataLayer.getUserById(req.params.user_id);

  const userUpdateForm = createUserForm();

  userUpdateForm.fields.username.value = user.get("username");
  userUpdateForm.fields.email.value = user.get("email");

  res.render("users/update", {
    userUpdateForm: userUpdateForm.toHTML(bootstrapField),
    user: user.toJSON(),
  });
});

router.post("/:user_id/update", async (req, res) => {
  const user = await dataLayer.getUserById(req.params.user_id);
  const userUpdateForm = createUserForm();
  userUpdateForm.handle(req, {
    success: async (form) => {
      let { ...Data } = form.data;
      console.log(Data);
      user.set(Data);
      user.save();

      req.flash("success_messages", `User Successfully Updated`);
      res.redirect("/users");
    },
    // error: async (form) => {
    //   res.render("users/update", {
    //     user: user.toJSON(),
    //     userUpdateForm: form.toHTML(bootstrapField),

    //   });
    // },
  });
});

router.get("/:user_id/delete", async (req, res) => {
  const user = await dataLayer.getUserById(req.params.user_id);

  res.render("users/delete", {
    user: user.toJSON(),
  });
});

router.post("/:user_id/delete", async (req, res) => {
  const user = await dataLayer.getUserById(req.params.user_id);
  await user.destroy();
  res.redirect("/users");
});

router.post("/register", (req, res) => {
  const registerForm = createRegistrationForm();
  registerForm.handle(req, {
    success: async (form) => {
      const user = new User({
        username: form.data.username,
        password: getHashedPassword(form.data.password),
        email: form.data.email,
      });
      await user.save();
      req.flash("success_messages", "User signed up successfully!");
      res.redirect("/users/login");
    },
    error: (form) => {
      res.render("users/register", {
        form: form.toHTML(bootstrapField),
      });
    },
  });
});

router.get("/login", (req, res) => {
  const loginForm = createLoginForm();
  res.render("users/login", {
    form: loginForm.toHTML(bootstrapField),
  });
});

router.post("/login", async function (req, res) {
  const loginForm = createLoginForm();
  loginForm.handle(req, {
    success: async function (form) {
      const user = await User.where({
        email: form.data.email,
        password: getHashedPassword(form.data.password),
      }).fetch({
        require: false,
      });

      // check if the user does not exist
      if (!user) {
        req.flash("error_messages", "Invalid credentials. Please try again.");
        res.redirect("/users/login");
        // form: loginForm.toHTML(bootstrapField)
      } else {
        //check if the password matches
        if (user.get("password") === getHashedPassword(form.data.password)) {
          req.session.user = {
            id: user.get("id"),
            username: user.get("username"),
            email: user.get("email"),
          };
          req.flash("success_messages", "Welcome back, " + user.get("username"));
          res.redirect("/products");
        } else {
          req.flash("error_messages", "Invalid username or password. Please try again.");
          res.redirect("/users/login");
        }
      }
    },
    error: (form) => {
      req.flash("error_messages", "Error logging in. Please enter again");
      res.render("users/login", {
        form: form.toHTML(bootstrapField),
      });
    },
  });
});

//       else {
//         req.session.user = {
//           id: user.get("id"),
//           email: user.get("email"),
//           username: user.get("username"),
//         };
//         req.flash("success_messages", "Welcome back, " + user.get("username"));
//         res.redirect("/products");
//       }
//     },
//   });
// });

router.get("/profile", async function (req, res) {
  const user = req.session.user;
  if (!user) {
    req.flash("error_messages", "Only logged in users may view this page");
    res.redirect("/users/login");
  } else {
    res.render("users/profile", {
      user: req.session.user,
    });
  }
});

router.get("/logout", (req, res) => {
  req.session.user = null;
  req.flash("success_messages", "Logout Successfully");
  res.redirect("/users/login");
});
module.exports = router;
