const express=require('express');
const path=require('path');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const session =require('express-session');

const expressValidator=require('express-validator');
const fileUpload=require('express-fileupload');
const passport=require('passport');

const Schema = require('./models/page');
const Page = mongoose.model("Pages", Schema);

const cookieParser = require('cookie-parser')

const port = 5000;

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
 
app.use(express.static(path.join(__dirname, 'public')));

app.locals.errors = null;

Page.find({}).sort({sorting: 1}).exec(async (err, pages) => {
    if (err) {
        console.log(err);
    } 
    else {
        app.locals.pages = pages;
    }
});
             
const Schema1 = require('./models/category');
const Category = mongoose.model("categories", Schema1);
      
Category.find(async (err, categories) => {
    if (err) {
        console.log(err);
    } 
    else {
        app.locals.categories = categories;
    }
});
                    
app.use(cookieParser())

app.use(fileUpload());

app.use(bodyParser.urlencoded({
    extended:false
}));

app.use(bodyParser.json());

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
}));

app.use(require('connect-flash')());
app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

require('./config/passport')(passport);
 
app.use(passport.initialize());
app.use(passport.session());

app.get('*', async (req, res, next) => {
    
    res.locals.cart=req.session.cart;
    res.locals.user=req.user||null;

    next();
});

const pages = require('./routes/pages.js');
const products = require('./routes/products.js');
const cart = require('./routes/cart.js');
const users = require('./routes/users.js');
const adminPages = require('./routes/admin_pages.js');
const adminCategories = require('./routes/admin_categories.js');
var adminProducts = require('./routes/admin_products.js');

app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', users);
app.use('/', pages);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
})