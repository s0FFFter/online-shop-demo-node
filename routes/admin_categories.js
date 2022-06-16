
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

const Schema = require('../models/category');
const Category = mongoose.model("categories", Schema);

// Application instance
const app = express();

app.use(bodyParser.urlencoded({
    extended: true
})); 

const router = express.Router();

router.get('/', isAdmin, async (req, res) => {

    await Category.find((err, categories) => {
        
        if (err) {
            return console.log(err);
        }
        else {
            res.render('admin/categories', {
                categories: categories, 
                msg: ""
            });
        } 
    });     
});

router.get('/add-category', isAdmin, (req, res) => {

    const title = "";

    res.render('admin/add_category', {
        title: title, 
        msg: ""
    });
});

router.post('/add-category', (req, res) => {

    const title = req.body.title;
        
    if (title === "" || title === null) {
        req.flash('danger', 'Title empty');

        res.render('./admin/add_category', {
            title: title,
            msg: ""
        });
    }
    else {
        // replacing spaces with dashes and is in lowercase
        const slug = title.replace(/\s+/g, '-').toLowerCase();
       
        Category.findOne({slug: slug}, (err, category) => {
            if (category) {
                req.flash('danger', 'The specified category title exists!');

                res.render('/admin/add_category', {
                    title: title,       
                });
            }
            else {
                const categories = new Category({
                    title: title,
                    slug: slug
                }); 
                    
                categories.save((err) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        Category.find(async (err, categories) => {
                            if (err) {
                                console.log(err);
                            } 
                            else {
                                req.app.locals.categories = categories;
                            }
                        });        
                    }
                });
                        
                req.flash('success','Category added');
                res.redirect('/admin/categories');         
            }
        });
    }    
});

router.get('/edit-category/:id', isAdmin, async (req, res) => {

    await Category.findById(req.params.id, (err, category) => {
        
        if (err) {
            return console.log(err);
        }
        else {
            res.render('admin/edit_category', {
                title: category.title,
                id: category._id,
                msg: ""
            });
        }
    });
});

router.post('/edit-category/:id', (req,res) => {

    const title = req.body.title;
    const slug = title.replace(/\s+/g,'-').toLowerCase();
    const id = req.params.id;
  
    Category.findOne({slug: slug, _id: {$ne: id}}, async (err, page) => {

        if (page) {
            req.flash('info','slug already exists');
            
            res.redirect('/admin/pages');  
        }
        else {

            Category.findOne({slug: slug, _id: {'$ne': id} }, (err, category) => {
            
                if (category) {
                
                req.flash('danger','Category already exists, choose another');

                res.render('admin/edit_category', {
                    title: title,
                    id: id,
                    msg: ""
                });
            }
            else {

                Category.findById(id, (err,category) => {
                
                    if (err) {
                        console.log(err);
                    }
                    else {
                        category.title = title;
                        category.slug = slug;

                        category.save((err) => {
                        
                            if (err) {
                                return console.log(err);
                            }
                            else {
                                Category.find( async function (err, categories) {
                                    if (err) {
                                        console.log(err);
                                    } 
                                    else {
                                        req.app.locals.categories = categories;
                                    }
                                });
                               
                                req.flash('success', 'Category was edited!');

                                res.redirect('/admin/categories/edit-category/' + id);
                            }
                        });
                    }
                });
            }
        });
        }
    });
});

router.get('/delete-category/:id', isAdmin, (req, res) => {

    Category.findByIdAndRemove(req.params.id, (err) => {
        
        if (err) {
            console.log(err);
        }
        else {

            Category.find(async (err, categories) => {
                
                if (err) {
                    console.log(err);
                } 
                else {
                    req.app.locals.categories = categories;
                }
            });
           
            req.flash('success', 'Category has been deleted successfully!');

            res.redirect('/admin/categories');
        }
    });
});

module.exports=router;