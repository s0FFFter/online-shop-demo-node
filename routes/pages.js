const express = require('express');
const mongoose = require('mongoose');

const Schema = require('../models/page')
const Pages = mongoose.model("Pages",Schema);

const router = express.Router();

router.get('/', async (req, res) => {

    await Pages.findOne({slug:'home'}, (err, page) => {
        
        if (err) {
            console.log("error in router.get('/) "+err);
        }
            
        res.render('index',{
            title: page.title,
            content: page.content
        });
        
    });

});

router.get('/:slug', async (req, res) => {
    const slug = req.params.slug;

    await Pages.findOne({slug: slug}, (err, page) => {
        if (err) {
            console.log("error in pages.js in /:slug " + err);
        }

        if (!page) {
            res.redirect('/');
        }
        else {
            res.render('index', {
                title: page.title,
                content: page.content
            });
        }
    });
});

module.exports=router;