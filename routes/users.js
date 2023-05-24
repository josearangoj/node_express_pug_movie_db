const express = require("express");
const router = express.Router()
const { check, validationResult } = require("express-validator");
let User = require("../models/user");
const bcrypt = require("bcryptjs");
const passport = require("passport");

 router
   .route("/register")
   .get((req, res) => {
     res.render("register");
   })
 
   .post(async function (req, res) {
     await check("name", "Name is required").notEmpty().run(req);
     await check("email", "Email is required").isEmail().notEmpty().run(req);
     await check("email", "Email is required").notEmpty().run(req);
     await check("password", "Password is required").notEmpty().run(req);
     await check("confirm_password", "Confirm Password is required").notEmpty().run(req);
     await check("confirm_password", "Confirm Password does NOT match password").equals(req.body.password).run(req);
 
     const errors = validationResult(req);
 
     if (errors.isEmpty()) {
       let newUser = new User()

       newUser.name = req.body.name
       newUser.email = req.body.email
       
       bcrypt.genSalt(10, function (err, salt) {
         bcrypt.hash(req.body.password, salt, async function (err, hashed_passsword) {
           if (err) {
             console.log(err)
           } else {
             newUser.password = hashed_passsword

             let result = await newUser.save()
             if (!result) {
               res.send("Error saving new User")
               return
             } else {
               res.redirect("/users/login")
             }
           }
         })
       })

     } else {
       res.render("register", {
         errors: errors.array(),
       });
     }
   });

   router
   .route("/login")
   .get((req, res) => {
     res.render("login");
   })
 
     .post(async function (req, res, next) {
      await check("email", "Email is required").notEmpty().run(req);
      await check("email", "Email is invalid").isEmail().run(req);
      await check("password", "Password is required").notEmpty().run(req);
 
      const errors = validationResult(req);
 
       if (errors.isEmpty()) {
         passport.authenticate("local", {
           successRedirect: "/",
           failureRedirect: "/users/login",
           failitureMessage: true
         })(req, res, next)
       } else {
         res.render("login", {
           errors: errors.array(),
         });
       }
     });

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
        return next(err)
    } else {
      res.redirect("/users/login")
      }
    })
  })
     
 

module.exports = router