if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();          //if we are in production then we will not use dotenv file
}

const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const bandRoutes = require('./routes/bands');
const reviewRoutes = require('./routes/reviews');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

const MongoDBStore = require("connect-mongo")(session);

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));  //method to get values from incoming request.
app.use(methodOverride('_method'));      //to use put, delete and patch request with get and post.
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}));

const secret = process.env.SECRET || 'thisissecret';                   

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());   //use for login and logout of a user using the
passport.deserializeUser(User.deserializeUser()); //cookies and session id.

app.use((req, res, next) => {
    res.locals.currentUser = req.user; // locals has wide scope to all over the application
    res.locals.success = req.flash('success'); //so direct names can be used to access them.
    res.locals.error = req.flash('error');
    next();
});

app.use('/', userRoutes);
app.use('/bands', bandRoutes);
app.use('/bands/:id/reviews', reviewRoutes);


app.get('/', (req, res) => {
    res.render('home');
});

app.all('*', (req, res, next) => {          //If no request above is matched then this will run
    next(new ExpressError('Page Not Found, 400'));    
});

app.use((err, req, res, next) => {  //if we get any error then this function is used to catch 
    const { statusCode=500 } = err;  //the error and handel it.
    if(!err.message) err.message = 'Something went wrong!';
    res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})