const express = require("express");
const router = express.Router();
const crypto = require('crypto');

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}
// import in User Model

const { User } = require("../models");
const { createRegistrationForm,createLoginForm, bootstrapField } = require("../forms");


router.get('/', async (req, res) => {
  const users = await userDataLayer.getAllUsers()
  const employees = users.toJSON().filter(user => {
      return user.userType.user_type !== 'Customer'
  })
  const customers = users.toJSON().filter(user => {
      return user.userType.user_type === 'Customer'
  })
  res.render('users', {
      employees,
      customers
  })
})

router.get("/register", (req, res) => {
  // display the registration form
  const registerForm = createRegistrationForm();
  res.render("users/register", {
    form: registerForm.toHTML(bootstrapField),
  });
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


router.get('/login', (req,res)=>{
    const loginForm = createLoginForm();
    res.render('users/login',{
        'form': loginForm.toHTML(bootstrapField)
    })
})

router.post('/login', async function(req,res){
    const loginForm = createLoginForm();
    loginForm.handle(req,{
        'success':async function(form){
            const user = await User.where({
                'email': form.data.email,
                'password': getHashedPassword(form.data.password)
            }).fetch({
                require:false
            })
            
            // check if the user does not exist
            if (!user) {
                req.flash('error_messages', "Invalid credentials");
                res.redirect("/users/login");
            } else {
                req.session.user = {
                    id: user.get('id'),
                    email: user.get('email'),
                    username: user.get('username')
                }
                req.flash('success_messages', 'Welcome back, ' + user.get('username'));
                res.redirect('/products');
            }
        }
    })
})


router.get('/profile', async function(req,res){
    const user = req.session.user;
    if (!user) {
        req.flash('error_messages', 'Only logged in users may view this page');
        res.redirect('/users/login')
    } else {
        res.render('users/profile',{
            user: req.session.user
        })
    }
})

router.get('/logout', (req, res) => {
    req.session.user = null;
    req.flash('success_messages', "Logout Successfully");
    res.redirect('/users/login');
})
module.exports = router;
