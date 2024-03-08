const express = require('express');
const passport = require('passport');
const router = express.Router();

const redirectIfNotLoggedIn = require('../middleware/auth.js');
const redirectIfLoggedIn = require('../middleware/loggedIn.js');
const redirectIfLoggedInApi = require('../middleware/loggedInApi.js');

router.get('/register', redirectIfLoggedInApi, (req, res) => {
    const registrationInstructions = {
        Status: "Not logged in...",
        steps: [
            "Open Postman or your preferred HTTP client.",
            "Set the request method to POST.",
            "Set the request URL to the endpoint for registration. For example, 'http://localhost:8080/api/sessions/register' if you are running your server locally.",
            "Go to the 'Headers' tab and add a header with key 'Content-Type' and value 'application/json'.",
            "Go to the 'Body' tab, select 'raw', and then select 'JSON' from the dropdown menu.",
            "Enter your registration details in JSON format. For example: {\"first_name\": \"John\", \"last_name\": \"Doe\", \"email\": \"johndoe@example.com\", \"age\": 30, \"password\": \"your_password\"}.",
            "Send the request.",
            "If the registration is successful, you should be redirected to the login page or receive a success message. You can now log in with the credentials you registered."
        ],
        note: "Replace the example details with your actual registration information."
    };

    res.json(registrationInstructions);
});

router.post('/register', redirectIfLoggedInApi, passport.authenticate('register', {
    failureRedirect: '/register',
    failureFlash: true
}), async (req, res) => {
    if (req.user) {
        req.flash('success', `¡Registro exitoso para ${req.user.email}!`);
        res.redirect('/login');
    } else {
        return res.status(400).send({status: "error", message: "Credenciales inválidas"});
    }
});

router.get('/login', redirectIfLoggedIn, (req, res) => {
    const loginInstructions = {
        Status: "Not logged in...",
        steps: [
            "Open Postman or your preferred HTTP client.",
            "Set the request method to POST.",
            "Set the request URL to the endpoint for logging in. For example, 'http://localhost:8080/api/sessions/login' if you are running your server locally.",
            "Go to the 'Headers' tab and add a header with key 'Content-Type' and value 'application/json'.",
            "Go to the 'Body' tab, select 'raw', and then select 'JSON' from the dropdown menu.",
            "Enter your login credentials in JSON format. Example: {\"email\": \"your_email@example.com\", \"password\": \"your_password\"}.",
            "Send the request.",
            "If login is successful, you should receive a response including a session cookie. Use this cookie for subsequent requests to authenticated routes."
        ],
        note: "If not registered visit 'http://localhost:8080/api/sessions/register'"
    };

    res.json(loginInstructions);
});

router.post('/login', redirectIfLoggedIn, (req, res, next) => {
    const { email, password } = req.body;

    if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
        req.session.user = {
            email,
            role: 'admin',
            first_name: 'Admin',
            last_name: 'CoderHouse',
            age: '9999'
        };
        console.log('Inicio de sesión exitoso para:', email, 'Rol: admin');
        req.flash('success', '¡Inicio de sesión exitoso!');
        return res.redirect('/products');
    }

    passport.authenticate('login', (err, user, info) => {
        if (err) {
            console.log('Error al iniciar sesión:', err);
            req.flash('error', 'Error al iniciar sesión...');
            return res.redirect('/login');
        }
        if (!user) {
            console.log('Intento de inicio de sesión fallido para:', email);
            req.flash('error', 'Usuario o contraseña incorrectos...');
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                console.log('Error al iniciar sesión:', err);
                req.flash('error', 'Error al iniciar sesión...');
                return res.redirect('/login');
            }
            req.session.user = {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                age: user.age,
                role: user.role || 'usuario'
            };
            req.flash('success', '¡Inicio de sesión exitoso!');
            return res.redirect('/products');
        });
    })(req, res, next);
});

router.get("/logout", redirectIfNotLoggedIn, (req, res) => {
    
    const userEmail = req.user ? req.user.email : 'Desconocido';

    req.logout(function(err) {
        if (err) {
            console.log('Error al cerrar sesión:', err);
            req.flash('error', 'Error al cerrar sesión...');
            return res.redirect('/profile');
        }

        req.session.destroy((err) => {
            if (err) {
                console.log('Error al destruir la sesión:', err);
                req.flash('error', 'Error al destruir sesión...');
                return res.redirect('/profile');
            }            
            res.clearCookie('connect.sid', { path: '/' });
            console.log(`Cierre de sesión exitoso para el usuario: ${userEmail}`);            
            res.redirect('/login');
        });
    });
});

router.get("/auth/github", passport.authenticate("github", {scope: ["user:email"]}), async (req, res) => {});

router.get("/auth/github/callback", passport.authenticate("github", {failureRedirect: "/login"}), async (req, res) => {
    let role = req.user.role || 'usuario';
    req.session.user = {
        id: req.user._id,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        age: req.user.age,
        role: role
    };
    req.session.login = true; 
    req.flash('success', '¡Inicio de sesión con GitHub exitoso!');
    res.redirect("/products");
});

module.exports = router;