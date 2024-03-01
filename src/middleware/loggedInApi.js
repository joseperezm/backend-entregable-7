function redirectIfLoggedInApi(req, res, next) {
    if (req.session.user) {
        res.redirect('/api/products'); // O la ruta que prefieras
    } else {
        next();
    }
}

module.exports = redirectIfLoggedInApi;