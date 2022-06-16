const express = require('express');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect("mongodb://127.0.0.1:27017", {
        useUnifiedTopology: true, 
        useNewUrlParser: true  
    });

const CategorySchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        trim: true
    }, 
});

module.exports = CategorySchema;