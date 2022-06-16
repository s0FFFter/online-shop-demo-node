const express = require('express');
const mongoose = require('mongoose');

const Schema = mongoose.Schema

mongoose.connect("mongodb://127.0.0.1:27017", {
        useUnifiedTopology: true, 
        useNewUrlParser: true  
    });

const UserSchema = new Schema({

       name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        }, 
        username: {
            type: String,
            required: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            trim: true,
            
        },
        admin: {
            type: Number
        },
        
});

module.exports = UserSchema;