const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Schema = require('../models/product')
const Product = mongoose.model("products",Schema);

const Schema1 = require('../models/cart')
const Cart = mongoose.model("cart",Schema1);

const Schema2=require('../models/user')
const User= mongoose.model("users",Schema2);

router.get('/add/:product',async (req, res) => {

    var slug= req.params.product;
    
    await Product.findOne({slug: slug}, (err, p) => {
        
        if (err) {
            console.log("error in /add/:product in cart.js"+err);
        }

        if (typeof req.session.cart == "undefined") {

            req.session.cart=[];

            req.session.cart.push({
                title:slug,
                qty:1,
                tt:p.tt,
                price :parseFloat(p.price).toFixed(2),
                image:'/product_images/'+p._id+'/'+p.image
            });

            const cart = new Cart({
                title: slug,
                qt: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/product_images/'+p._id+'/'+p.image, 
                username: req.cookies.username
            });

            cart.save((err) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log('added to cart mongodb 1st');
                }
            });
        }
        else {
            const cart = req.session.cart;
            const newItem = true;
                
            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == slug){
                        cart[i].qty++;

                        newItem=false;
                        
                        break;
                    }
                }

                if (newItem) {
                    cart.push({
                        title: slug,
                        qty: 1,
                        tt: p.tt,
                        price: parseFloat(p.price).toFixed(2),
                        image: '/product_images/'+p._id+'/'+p.image
                    });
                
                    const cart = new Cart({
                        title: slug,
                        qt: 1,
                        price: parseFloat(p.price).toFixed(2),
                        image: '/product_images/' + p._id + '/' + p.image,
                        username: req.cookies.username
                    });

                    cart.save((err) => {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log('added to cart mongodb');
                        }
                    });
                }
            }
           
            req.flash('success','Product added');
            res.redirect('back');
    });
});

router.get('/checkout', async (req, res) => {
    Cart.find({username:req.cookies.username}, (err, p) => {
        if (err) {
            console.log(err);
        }

        if (p.length == 0){
            res.render('emptycart',{
                title: "Empty Cart"
            });
        }
        else {
            res.render('checkout',{
                title: 'CheckOut',
                cart: p
            });
        }
    });

    if (req.session.cart && req.session.length == 0) {
        await delete req.session.cart;
        
        res.redirect('/cart/checkout');
    }
    else {
        await res.render('checkout', {
            title: 'CheckOut',
            cart: req.session.cart
        });
    } 
});
        
router.get('/update/:product', async (req, res) => {
    
    const slug = req.params.product;
    const cart = req.session.cart; 
    const action=req.query.action;
        
    Cart.find({username:req.cookies.username}, async (err, p) => {  
        if (err) {
            console.log(err);
        }

        for (var i = 0; i < p.length; i++) {
            if (p[i].title == slug) {
                console.log(p[i].title);
                console.log(p[i].qt);
                
                switch(action) {
                    case "add":
                        await Cart.findOneAndUpdate(
                            {
                                title: p[i].title
                            },
                            { 
                                qt:p[i].qt+(1)
                            },
                            {
                                new: true
                            }
                        );

                        break;
                    case "remove":
                        await  Cart.findOneAndUpdate(
                            {
                                title: p[i].title
                            },
                            { 
                                qt:p[i].qt-(1) 
                            },
                            {
                                new:true
                            }
                        );
                        
                        break;
                            
                        case "clear":
                            await Cart.findOneAndDelete(
                                {
                                    title: p[i].title
                                });
                            break;
                        
                        default:
                            
                            console.log("update problem in /update/:product");
                            break;
                    }
            }
        }
    });

    req.flash('success','Cart updated');
    res.redirect('/cart/checkout');
});




router.get('/clear',(req, res) => {

    Cart.deleteMany({username:req.cookies.username}, async (err) => {
        if (err) {
            console.log("error in clearing cart");
        }
        
            console.log("cleared cart ");         
        });                    
                        // }
       
        delete req.session.cart;
        req.flash('success','Cart cleared');
        res.redirect('/cart/checkout');
        
    });
  

    // get buynow 
    router.get('/buynow',async (req, res) => {
        
        Cart.find({username:req.cookies.username}, async (err, p) => {  
            if (err) {
                console.log(err);
            }

            for (var i = 0; i < p.length; i++) {
                var a = (p[i].qt);  
                await Product.findOne({slug:p[i].title}, (err, p1) => {
                    if (err) {
                        console.log(err);
                    }

                    var tt = p1.tt;
                
                    console.log(tt);
                    console.log(a);
                
                    t = tt - a;
                
                    console.log(t);
                
                    for (var i = 0; i < p.length; i++) {
                        Product.findOneAndUpdate(
                            {
                                slug: p[i].title
                            }, 
                            {
                                tt: t
                            }, 
                            {
                                new: true
                            }, (err) => {
                            if(err){
                                console.log(err);
                            }
                            else{
                                console.log("updated products in admin side also");
                            }
                        });             
            }
        }); 
        console.log("updated in products");
    }
         
    });
        
    Cart.deleteMany({username:req.cookies.username}, async (err) => {
        if (err) {
            console.log("error in clearing cart");
        }
           
        console.log("cleared cart ");         
        }); 
            
        delete req.session.cart;
        res.sendStatus(200);
});   
      


module.exports=router;