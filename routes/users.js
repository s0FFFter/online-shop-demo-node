const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt = require('bcryptjs');

const Schema1 = require('../models/user')
const User = mongoose.model("users", Schema1);

const router = express.Router();

router.get('/register', async (req, res) => {
    res.render('register', {
        title: 'Register'
    });
});

router.post('/register', async (req, res) => {
    
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;
 
    if (password != password2) {
        req.flash('danger', 'Confirmation password don\'t match with the specified one!');
        res.redirect('/users/register');
    }
    else {
        User.findOne({username: username}, (err, user) => {
            if (err) {
                console.log("error in post register in users.js"+err);
            }  
                
            if (user) {
                req.flash('danger','Username already exists');
                res.redirect('/users/register');
            }
            else {
                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password :password,
                    admin: 0
                });
                        
                bcrypt.genSalt(10, (err, salt) => {
                    
                    bcrypt.hash(user.password, salt, (err, hash) => {
                        if (err) {
                            console.log(err);
                        }
                                        
                        user.password = hash;
                        user.save((err) => {
                            if (err) {
                                console.log(err);
                            } 
                            else {
                                req.flash('success', 'You are now registered!');
                                res.redirect('/users/login')
                            }
                        });
                    });
                });
            }
        });
    }
});

// get login 
router.get('/login', async (req, res) => {

    if (res.locals.user) {
        res.redirect('/');
    }

    res.render('login', {
        title: 'Log In'
    });

});

router.post('/login', passport.authenticate('local', {
    failureRedirect:'/users/login',
    failureFlash:true
    }), 
    (req, res, next) => {
        res.cookie('username', req.body.username, 
        {  
            maxAge: 900000, 
            httpOnly: true
        });

        res.redirect('/products');
});

router.get('/logout', async (req, res) => {
   req.logOut();
   res.clearCookie('username')
   req.flash('success',"Successfully logged out");
   res.redirect('/users/login');
});

module.exports=router;