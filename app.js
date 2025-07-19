const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const User = require('./models/UserModel');
const Food = require('./models/FoodModel');  
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { log } = require('console');
require('dotenv').config()
require('./config/passport');


const app = express();
const port = 7000;

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'views')));

app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
    res.locals.messages = req.flash('error');
    res.locals.user = req.user;
    next();
});

app.get('/', async (req, res) => {
    try {
        const foods = await Food.find();  
        res.render('home', { currentUser: req.user, foods });
    } catch (error) {
        req.flash('error', 'Error fetching food items.');
        res.redirect('/');
    }
});

app.post('/add-to-cart', (req, res) => {
    console.log(`Food ID ${req.body.foodId} added to cart.`);
    req.flash('success', 'Item added to cart!');
    res.redirect('/');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/about', (req, res) => {
    res.render('about');
})

app.get('/contact', (req, res) => {
    res.render('contact');
})

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/order-statusg', (req, res) => {
    res.render('order-statusg',{ status: 'success' });
});

app.get('/order-statusf', (req, res) => {
    res.render('order-statusf',{ status: 'failure' });
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = new User({ name, email });
        await User.register(user, password);
        req.flash('success', 'Registration successful! You can now log in.');
        res.redirect('/login');
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/register');
    }
});



// Create Razorpay order
app.post('/create-order', async (req, res) => {


    try {
        const options = {
          amount: (req.body.amount * 100),
          currency: "INR",
        };
    
        const order = await razorpay.orders.create(options);
    
        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
        });
      } catch (error) {
        console.error(error);
        res.status(500).send("error creating order");
      }
});

app.post('/verify-payment', (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');
    
    if (generatedSignature === razorpay_signature) {
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
});





app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            req.flash('error', 'Logout failed. Please try again.');
            return res.redirect('/');
        }
        req.flash('success', 'Logged out successfully!');
        res.redirect('/');
    });
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
