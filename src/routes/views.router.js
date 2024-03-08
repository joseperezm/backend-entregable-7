const express = require("express");
const router = express.Router();

const ProductManagerFs = require("../dao/fs/productManager-fs")
const productManagerFs = new ProductManagerFs("../dao/fs/products.json");

const ProductManager = require("../dao/db/productManager");
const productManager = new ProductManager();

const CartManager = require("../dao/db/cartManager.js");
const cartManager = new CartManager();

const redirectIfNotLoggedIn = require('../middleware/auth.js');
const redirectIfLoggedIn = require('../middleware/loggedIn.js');

router.get("/", redirectIfNotLoggedIn, (req, res) => {
    res.render("index");
});

router.get("/products", redirectIfNotLoggedIn, async (req, res) => {
    try {
        const { limit, page, sort, query } = req.query;

        const options = {
            limit: limit ? parseInt(limit, 10) : 10,
            page: page ? parseInt(page, 10) : 1,
            sort: sort || '',
            query: query || ''
        };

        const result = await productManager.getProducts(options);
        
        const productosObj = Array.isArray(result.products) ? result.products.map(producto => {
            return producto.toObject ? producto.toObject() : producto;
        }) : [];

        const messages = req.flash();

        res.render("products", {
            messages,
            productos: productosObj,
            page: result.page,
            totalPages: result.totalPages,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            limit: options.limit, 
            sort: options.sort, 
            query: options.query,
        });
    } catch (error) {
        console.error("Error al obtener productos", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

router.get("/realtimeproducts", redirectIfNotLoggedIn, async (req, res) => {
    try {
        res.render("realtimeproducts");
    } catch (error) {
        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});

router.get("/chat", redirectIfNotLoggedIn, (req, res) => {
    res.render("chat");
});

router.get("/carts", redirectIfNotLoggedIn, async (req, res) => {
    try {
        const carts = await cartManager.getAllCarts();
        const cartsObjects = carts.map(cart => cart.toObject ? cart.toObject() : cart);
        res.render('carts', { carts: cartsObjects });
    } catch (error) {
        console.error("Error al obtener todos los carritos...", error);
        res.status(404).render('error', { message: "Error al intentar listar los carritos" });
    }
});

router.get("/carts/:cid", redirectIfNotLoggedIn, async (req, res) => {
    try {
        const cart = await cartManager.getCart(req.params.cid);
        if (cart) {
            const cartObject = cart.toObject ? cart.toObject() : cart;
            res.render('cart', { cart: cartObject });
        } else {
            res.status(404).render('error', { message: "Carrito no encontrado" });
        }
    } catch (error) {
        console.error("Error al obtener el carrito por ID...", error);
        res.status(404).render('error', { message: "Carrito no encontrado" });
    }
});

router.get('/login', redirectIfLoggedIn, (req, res) => {
    const messages = req.flash();
    res.render('login', { messages });
});

router.get("/register", redirectIfLoggedIn, (req, res) => {
    const messages = req.flash();
    res.render('register', { messages }); 
});

router.get('/profile', redirectIfNotLoggedIn, (req, res) => {
    res.render('profile', { user: req.session.user });
});

module.exports = router;