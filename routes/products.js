const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs-extra');
const auth = require('../config/auth');
const isUser = auth.isUser;

var Schema2 = require('../models/product')
var Product = mongoose.model("products", Schema2);
var Schema = require('../models/category')
var Category = mongoose.model("categories", Schema);

const router = express.Router();

router.get('/', async (req, res) => {

    console.log(req.cookies.username)
    
    await Product.find((err, products) => {
        
        if (err) {
            console.log("error in router.get('/) in products.js" + err);
        }
        
        res.render('all_products',{
            title:'All products',
            products:products
        });
        
    });

});

router.get('/:category',async (req, res) => {

    const categorySlug = req.params.category;
  
    await Category.findOne({slug: categorySlug}, (err, c) => {

        Product.find({category: categorySlug}, (err, products) => {

            if (err) {
                console.log("error in router.get('/:category) in products.js " + err);
            }
            
            res.render('cat_products', {
                title: c.title,
                products: products
            });

        });
    });
});

router.get('/:category/:product', async (req, res) => {

    var galleryImages = null;
    var loggedIn = (req.isAuthenticated()) ? true :false;
   
    await Product.findOne({slug: req.params.product}, (err, product) => {
        if (err) {
            console.log("err in /:category/:product in products.js" + err);
        }
        else {
            
            var galleryDir='public/product_images/' + product._id + '/gallery';

            fs.readdir(galleryDir, (err, files) => {
                if (err) {
                    console.log("error in /:category/:product in fs readir"+err);
                }
                else {
                    galleryImages=files;
                    res.render('product', {
                        title: product.title,
                        p: product,
                        galleryImages: galleryImages,
                        loggedIn:loggedIn
                    });
                }
            });
            
        }
    });
});

module.exports=router;