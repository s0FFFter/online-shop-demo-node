const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const Schema = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;
const User = mongoose.model('User', Schema);

module.exports = async function(passport) {
    await passport.use(new LocalStrategy((username, password, done) => {
        User.findOne({username: username}, (err, user) => {
            if (err) {
                console.log("error in module.exports in passport.js" + err);
            }

            if (!user) {
                return done(null, false, {
                    message: 'No user found'
                });
            }
            
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.log("error in bcrypt.compare in passport.js" + err);
                }
                        
                if (isMatch) {
                    return done(null, user);
                }
                else {
                    return done(null, false, {
                        message: 'Wrong password'
                    });            
                }
            });
        });
    }));
}

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err,user);
    });
});