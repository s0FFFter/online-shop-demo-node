const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const auth = require('../config/auth');
const Schema=require('../models/page')
const Pages= mongoose.model("Pages",Schema);

const isAdmin = auth.isAdmin;

const app = express();

app.use(bodyParser.urlencoded({ 
    extended: true 
})); 

const router = express.Router();

router.get('/', isAdmin, async (req, res) => {

    await Pages.find({}).sort({sorting: 1}).exec((err, pages) => {
        
        res.render('admin/pages', {
            pages: pages,
            msg: ""
        });
    
    });
});

router.get('/add-page', isAdmin, async (req, res) => {

    const title = "";
    const slug = "";
    const content = "";

    await res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content, 
        msg: ""
    });

});

router.post('/add-page', (req, res) => {

    const title = req.body.title;
    const slug = req.body.slug.replace(/\s+/g,'-').toLowerCase();
    const content = req.body.content;
        
    if (slug == "") {
        slug=title.replace(/\s+/g,'-').toLowerCase();
    }

    if (title === "" && content == "") {
        res.render('./admin/add_page', {msg: "Title and Content must have a value"});
    }

    if (title == "") {
        res.render('./admin/add_page', {msg: "Title must have a value"});
    }
        
    if (content == "") {
        res.render('./admin/add_page', {msg: "Content must have a value"});
    }
    else {
        Pages.findOne({slug: slug}, (err,page) => {
            if (page) {
                
                req.flash('danger','Page slug exists,choose another');

                res.render('/admin/add_page',{
                    title:title,
                    slug:slug,
                    content:content
                });
            }
            else {
                const newpages = new Pages({
                    title: title,
                    sorting: 100,
                    slug: slug,
                    content: content
                }); 
                
                newpages.save((err) => {
                    if (err) {
                        return console.log(err);
                    }
                    else {
                        Pages.find({}).sort({sorting: 1}).exec((err, pages) => {
                            if (err) {
                                console.log(err);
                            } 
                            else {
                                req.app.locals.pages = pages;
                            }
                        });
                    }
                });
                  
                req.flash('success','Page added');
                
                res.redirect('/admin/pages');  
            }
        });
    }
});

function sortPages(ids, callback) {
        
    var count = 0;

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;
        
        (function(count) {
            Pages.findById(id, (err, page) => {
                
                page.sorting = count;
            
                page.save((err) => {
                    
                    if (err) {
                        return console.log(err);
                    }  
                
                    ++count;
                
                    if (count >= ids.length) {
                        callback();
                    }
                });
            });
         })(count);
    }
}

router.post('/reorder-pages', (req, res) => {
   
    const ids = req.body['id[]'];
    
    sortPages(ids, () => {

        Pages.find({}).sort({sorting: 1}).exec((err, pages) => {

            if (err) {
                console.log(err);
            } 
            else {
                req.app.locals.pages = pages;
            }
        
        });
    });
});

router.get('/edit-page/:id', isAdmin, async (req, res) => {

    await Pages.findById(req.params.id, (err, page) => {
        
        if (err) {
            return console.log(err);
        }
        else {
            res.render('admin/edit_page', {
                title: page.title,
                slug: page.slug,
                content: page.content,
                id: page._id,
                msg: ""
            });
        }        
    });
});

router.post('/edit-page/:id', async (req, res) => {

    const title = req.body.title;
    const slug = req.body.slug.replace(/\s+/g,'-').toLowerCase();
    const content = req.body.content;
    const id = req.params.id;
  
    const a = title.replace(/\s+/g,'-').toLowerCase();
    
    if (slug === '' || slug===null) {
        slug=a;
        console.log('slug');
    }

    
    Pages.findOne({slug: slug , _id: {$ne:id} }, async (err, page) => {
        if (page) {

            req.flash('danger', 'Slug already exists');
            res.redirect('/admin/pages');
        
        }
        else {
            await Pages.updateOne({_id: id},{
                title: title,
                slug:slug, 
                content:content
            });
            
            Pages.find({}).sort({sorting: 1}).exec((err, pages) => {
                if (err) {
                    console.log(err);
                } 
                else {
                    req.app.locals.pages = pages;
                }
            });
                
            req.flash('success','Page updated');
            res.redirect('/admin/pages/edit-page/' + id);

        }
    })
});

router.get('/delete-page/:id', isAdmin, (req, res) => {

    Pages.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            console.log(err);
        }
        else {
            Pages.find({}).sort({sorting: 1}).exec((err, pages) => {
                if (err) {
                    console.log(err);
                } 
                else {
                    req.app.locals.pages = pages;
                }
            });

            req.flash('success','Page Deleted successfully ');
            res.redirect('/admin/pages');
        }
    });
});

module.exports=router;