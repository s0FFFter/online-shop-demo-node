var express=require('express');
var mongoose=require('mongoose');
var mongoosePaginate=require('mongoose-paginate');
var Schema = mongoose.Schema

mongoose.connect("mongodb://127.0.0.1:27017", {
        useUnifiedTopology: true, 
        useNewUrlParser: true  
    });

const ProductSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        trim: true
    }, 
    desc: {
        type: String,
        required: true,
        trim: true
    },
    category: { 
        type: String,
        required: true,
        trim: true
    },
    price:{
        type: Number,
        trim: true,
        required: true
    },
    image:{
        type: String,    
    },
    tt:{
        type: Number,
        required: true,
        default: 1
    }
});

ProductSchema.plugin(mongoosePaginate);
module.exports = ProductSchema;
