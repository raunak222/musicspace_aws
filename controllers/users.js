const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err=> {                 //if a user is registering then after registration we will redirect 
            if(err) return next(err);                     //user not to login page but directly login the user.
            req.flash('success', 'Welcome to MusicSpace!');
            res.redirect('/bands');      //we can redirect user directly to bands but we used login function 
        })                                     //to create the sessionId and this is done using login function of passport.
    } catch(err) {
        req.flash('error', err.message);
        res.redirect('register');
    }
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/bands';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/bands');
};
