const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const mongoose = require('mongoose');
const resizeImg = require('resize-img');

const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

const Schema1 = require('../models/category')
const Category = mongoose.model("category",Schema1);

const Schema = require('../models/product')
const Product = mongoose.model("product",Schema);

mongoose.set('useFindAndModify', false);

const app = express();

app.use(bodyParser.urlencoded({ 
    extended: true 
})); 

router.get('/', isAdmin, async (req, res) => {
   
    var count;

    await Product.countDocuments((err, c) => {
        count = c;
    });
   
    await Product.find((err, products) => {
        res.render('admin/products',{
            products: products,
            count: count,
            msg: ""
        });
    });
});

router.get('/add-product', isAdmin, async (req, res) => {

    const title = "";
    const desc = "";
    const price = "";
    const tt = "";

    await Category.find((err, categories) => {
    
        res.render('admin/add_product',{
            title: title,
            desc: desc,
            categories: categories,
            price: price, 
            tt: tt,
            msg: ""   
        });

   });
});

router.post('/add-product', async (req, res) => {
    const imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    const tt = req.body.tt;
    const title = req.body.title;
    const slug = title.replace(/\s+/g,'-').toLowerCase();
    const desc = req.body.desc;
    const price = req.body.price;
    const category = req.body.category;
        
    await Product.findOne({slug: slug}, async (err, product) => {
        if (product) {
            req.flash('danger','The page title exists. Please, choose another');
                    
            Category.find((err, categories) => {
                res.render('admin/add_product', {
                    title: title,
                    desc: desc,
                    categories: categories,
                    price: price,
                    tt: tt,
                    msg: ""
                });
            });
        }
        else {
                    
            const price2= parseFloat(price).toFixed(2);
            
            const product =new Product({
                title: title,
                slug: slug,
                desc: desc,
                price: price2,
                tt: tt,
                category: category,
                image: imageFile,
            });
                    
            await product.save((err) => {
                if (err) {
                    return console.log(err);   
                }
                else {
                    fs.mkdirSync('public/product_images/' + product._id, (err) => {
                        if (err) {
                            return console.log("error in first mkdirp " + err);
                        }
                        else {
                            console.log("dir created in first mkdir")
                        } 
                    });
                            
                    fs.mkdirSync('public/product_images/' + product._id + '/gallery', (err) => {
                               
                        if (err) {
                            return console.log("error in first mkdirp " + err);
                        }
                        else {
                            console.log("dir created in 2 mkdir");
                        }
                            
                    });
                            
                    fs.mkdirSync('public/product_images/' + product._id +'/gallery/thumbs', (err) => {
                        if (err) {
                            return console.log("error in first mkdirp " + err);
                        }
                        else {
                            console.log("dir created in 3 mkdirp");
                        }
                    });

                    if (imageFile != "") {
                        const productImage=req.files.image;
                               
                        const path = 'public/product_images/' + product._id + '/'+imageFile;

                        productImage.mv(path, (err) => {
                            if (err) {
                                return console.log("ERROR IN PRODUCT IMAGE MV"+err);
                            }
                            else {
                                console.log("no error in productImage mv");
                            }
                        });
                    }
                    
                    req.flash('success','Product added');
                    res.redirect('/admin/products');
                }
            });   
        }
    });
  
});

router.get('/edit-product/:id', isAdmin, async (req, res) => {

    var errors;

    if (req.session.errors) {
        errors=req.session.errors;
    }
    
    req.session.errors=null;  
            
    await Category.find((err, categories) => {
        
        Product.findById(req.params.id, (err, p) => {

            if (err) {
                console.log(err);
                res.redirect('/admin/products');
            }
            else {
                
                const galleryDir='public/product_images/'+p._id+'/gallery'
                const galleryImages =null;
                       
                fs.readdir(galleryDir, (err, files) => {

                    if (err) {
                        console.log("error in fs.readdir" + err);
                    }
                    else {

                        galleryImages = files;
                               
                        res.render('admin/edit_product', {
                            title: p.title,
                            errors: errors,
                            desc: p.desc,
                            categories: categories,
                            tt: p.tt,
                            price: p.price,
                            msg: "",
                            category: p.category.replace(/\s+/g,'-').toLowerCase(),
                            galleryImages: galleryImages,
                            id: p.id,
                            image: p.image
                        });
                    }
                });
            }
        });
    });  
});

router.post('/edit-product/:id', async (req, res) => {
   
    const imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
            
    const title = req.body.title;
    const slug = title.replace(/\s+/g,'-').toLowerCase();// replace spaces with dashes and is in lowercase
    const desc = req.body.desc;
    const price = req.body.price;
    const category = req.body.category;
    const pimage = req.body.pimage;
    const id = req.params.id;
    const tt = req.body.tt;
    
    
    await Product.findOne({
        slug: slug, 
        _id:{'$ne': id}},
        async (err, p) => {
        
        if (err) {
            console.log("error in post edit product 1st"+err);
        }
        
           
        if (p) {
            req.flash('danger','Product title exits, choose another');
            res.redirect('/admin/products/edit-product/'+id);
          
        }
        else {
            await Product.findById(id, (err, p) => {
                if (err) {
                    console.log(err);
                }
                  
                p.title = title;
                p.slu = slug;
                p.desc = desc;
                p.tt = tt;
                p.price = parseFloat(price).toFixed(2);
                p.category = category;
                    
                if (imageFile != "") {
                    p.image =imageFile;
                }
                
                p.save((err) => {
                    
                    if (err) {
                        console.log(err);
                    }

                    if (imageFile != "") {

                        if (pimage != "") {

                            fs.remove('public/product_images/' + id + '/' + pimage, (err) => {
                                if (err) {
                                    console.log(err);
                                }
                            });
                            
                            const productImage = req.files.image;
                            const path = 'public/product_images/' + id + '/' + imageFile;

                            productImage.mv(path, (err) => {

                                if (err) {
                                    return console.log("error in mv in post edit" + err);
                                }
                                else {
                                    console.log('uploaded');
                                }
                            });
                        }
                    }

                    req.flash('success','Product Edited');

                    res.redirect('/admin/products/edit-product/'+id);

                });
            });
        }
    });
});


router.post('/product-gallery/:id', async (req, res) => {
    
    const productImage = req.files.file;
    const id = req.params.id;
    const path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    const thumbsPath ='public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;
 
    await productImage.mv(path,function(err){
        
        if (err) {
            console.log("error in mv in post product gallery"+err);
        }

        resizeImg(fs.readFileSync(path),{width: 100, height: 100 }).then((buf) => {
            console.log("in resize image");
            fs.writeFileSync(thumbsPath,buf);
        });
    });

    res.sendStatus(200);
});

router.get('/delete-image/:image', isAdmin, (req, res) => {
    
    const originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    const thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;
    
    fs.remove(originalImage,function(err){
        if(err){
            console.log("error in get delete gallery image"+err);
        }else{
            fs.remove(thumbImage,function(err){
                if(err){
                    console.log("error in fs thumbpImage"+err);
                }else{
                    req.flash('success','Image deleted');
                    res.redirect('/admin/products/edit-product/'+req.query.id);

                }
            });
        }
    });
});

router.get('/delete-product/:id', isAdmin, async (req, res) => {

    const id = req.params.id;
    const path ='public/product_images/'+id;
    
    fs.remove(path, (err) => {
        
        if (err) {
            console.log("error in get delete-product/:id"+err);
        }
        else {
            Product.findByIdAndDelete(id, (err) => {
                
                if (err) {
                    console.log("error in product.fingByIdAndRemove"+err);
                }
                else {
                    console.log("deleted");
                }
            });
            
            req.flash('success','Product deleted');
            res.redirect('/admin/products');
        }
    });
});

module.exports = router;