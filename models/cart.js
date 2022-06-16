const express = require('express');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

mongoose.connect("mongodb://127.0.0.1:27017", {
        useUnifiedTopology: true, 
        useNewUrlParser: true  
});

const CartSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    qt: {
        type: Number,
    },
    price: {
        type: Number,
        trim: true,
        required: true
    },
    image: {
        type: String,
    },
    username: {
        type: String,
        trim: true
    }
});

module.exports = CartSchema;