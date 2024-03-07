const express = require('express');
const bcrypt = require('bcrypt');
const { createHash } = require('../utils/hashBcrypt.js');
const { isValidPassword } = require('../utils/hashBcrypt.js');
const User = require('../dao/models/user-mongoose');
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

router.post('/register', redirectIfLoggedInApi, async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;
        const role = 'usuario';
        const hashedPassword = createHash(password);
        const user = new User({
            first_name,
            last_name,
            email,
            age,
            password: hashedPassword,
            role
        });
        await user.save();
        console.log('Registro exitoso para:', email, 'Rol:', role);
        req.flash('success', `Registro exitoso para ${email}.`);
        res.redirect('/login');
    } catch (error) {
        console.log('Error al registrar el usuario:', error);

        if (error.name === 'MongoServerError' && error.code === 11000) {
            req.flash('error', 'E-mail ya existente. Por favor intenta con otro.');
        } else {
            req.flash('error', `Error al registrar el usuario: ${error.message}`);
        }

        res.redirect('/register');
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
            "Enter your login credentials in JSON format. For example: {\"email\": \"your_email@example.com\", \"password\": \"your_password\"}.",
            "Send the request.",
            "If login is successful, you should receive a response including a session cookie. Use this cookie for subsequent requests to authenticated routes."
        ],
        note: "If not registered visit 'http://localhost:8080/api/sessions/register'"
    };

    res.json(loginInstructions);
});

router.post('/login', redirectIfLoggedIn, async (req, res) => {
    const { email, password } = req.body;

    // Mantén la lógica para el superusuario administrativo como está
    if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
        req.session.user = {
            email,
            role: 'admin',
            first_name: 'Admin',
            last_name: 'CoderHouse',
            age: '9999'
        };
        console.log('Inicio de sesión exitoso para:', email, 'Rol: admin');
        return res.redirect('/products');
    }

    try {
        const user = await User.findOne({ email: email });
        // Cambia la comparación de contraseñas para utilizar isValidPassword de bcrypt
        if (user && isValidPassword(password, user)) {
            req.session.user = {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                age: user.age,
                role: 'usuario'
            };

            console.log('Inicio de sesión exitoso para:', email, 'Rol: usuario');
            res.redirect('/products');
        } else {
            // Mantén el manejo de errores como está
            console.log('Intento de inicio de sesión fallido para:', email, '- Contraseña incorrecta o usuario no encontrado');
            req.flash('error', `Contraseña incorrecta o usuario no encontrado`);
            res.redirect('/login');
        }
    } catch (error) {
        // Mantén el manejo de errores como está
        console.log('Error al iniciar sesión:', error);
        res.status(500).send('Error al iniciar sesión: ' + error.message);
    }
});

router.get("/logout", redirectIfNotLoggedIn, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log('Error al cerrar sesión:', err);
            res.status(500).send('Error al cerrar sesión: ' + error.message);
        } else {
            res.clearCookie('connect.sid', {path: '/'}); 
            res.redirect('/login'); 
        }
    });
});

module.exports = router;