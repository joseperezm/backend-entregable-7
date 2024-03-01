function redirectIfLoggedIn(req, res, next) {
    if (req.session.user) {
        res.redirect('/products'); // O la ruta que prefieras
    } else {
        next();
    }
}

module.exports = redirectIfLoggedIn;