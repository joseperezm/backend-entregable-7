const express = require("express");
const router = express.Router();

const CartManagerFs = require("../dao/fs/cartManager-fs.js")
const cartManagerFs = new CartManagerFs("../dao/fs/carts.json");

const CartManager = require("../dao/db/cartManager.js");
const cartManager = new CartManager();

const redirectIfNotLoggedInApi = require('../middleware/authApi.js');

router.post("/carts", redirectIfNotLoggedInApi, async (req, res) => {
    try {
        const cart = await cartManager.createCart();
        res.status(201).json({ cid: cart._id, message: "Carrito creado correctamente" });
    } catch (error) {
        console.error("Error al crear el carrito...", error);
        res.status(500).json({ error: "Error del servidor" });
    }
});

router.get("/carts", redirectIfNotLoggedInApi, async (req, res) => {
    try {
        const carts = await cartManager.getAllCarts();
        res.json(carts);
    } catch (error) {
        console.error("Error al obtener los carritos...", error);
        res.status(500).json({ error: "Error del servidor" });
    }
});

router.get("/carts/:cid", redirectIfNotLoggedInApi, async (req, res) => {
    try {
        const cart = await cartManager.getCart(req.params.cid);
        if (cart) {
            res.json(cart);
        } else {
            res.status(404).json({ message: "Carrito no encontrado" });
        }
    } catch (error) {
        console.error("Error al obtener el carrito por ID...", error);
        res.status(500).json({ error: "Error del servidor" });
    }
});

router.post("/carts/:cid/product/:pid", redirectIfNotLoggedInApi, async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity = 1 } = req.body;

    try {
        const { success, message, cart } = await cartManager.addToCart(cid, pid, quantity);
        if (success) {
            res.json({ message: message, cart: cart });
        } else {
            res.status(404).json({ message: message });
        }
    } catch (error) {
        console.error("Error al agregar producto al carrito...", error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

router.put("/carts/:cid", redirectIfNotLoggedInApi, async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;

    try {
        const updatedCart = await cartManager.updateCartProducts(cid, products);
        if (updatedCart) {
            res.json({ message: "Carrito actualizado con éxito", cart: updatedCart });
        } else {
            res.status(404).json({ message: "Carrito no encontrado" });
        }
    } catch (error) {
        console.error("Error al actualizar el carrito", error);
        res.status(500).json({ message: "Error del servidor" });
    }
});


router.put("/carts/:cid/product/:pid", redirectIfNotLoggedInApi, async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    try {
        const result = await cartManager.updateProductQuantity(cid, pid, quantity);
        if (result.success) {
            res.json({ message: "Cantidad actualizada correctamente", cart: result.cart });
        } else {
            res.status(404).json({ message: result.message });
        }
    } catch (error) {
        console.error("Error al actualizar la cantidad del producto en el carrito", error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

router.delete("/carts/:cid", redirectIfNotLoggedInApi, async (req, res) => {
    try {
        const success = await cartManager.emptyCart(req.params.cid);
        if (success) {
            res.json({ message: "Carrito vaciado correctamente" });
        } else {
            res.status(404).json({ message: "Carrito no encontrado" });
        }
    } catch (error) {
        console.error("Error al vaciar el carrito...", error);
        res.status(500).json({ error: "Error del servidor" });
    }
});

router.delete("/carts/:cid/delete", redirectIfNotLoggedInApi, async (req, res) => {
    try {
        const success = await cartManager.deleteCart(req.params.cid);
        if (success) {
            res.json({ message: "Carrito eliminado correctamente" });
        } else {
            res.status(404).json({ message: "Carrito no encontrado" });
        }
    } catch (error) {
        console.error("Error al eliminar el carrito...", error);
        res.status(500).json({ error: "Error del servidor" });
    }
});

router.delete("/carts/:cid/product/:pid", redirectIfNotLoggedInApi, async (req, res) => {
    try {
        const { success, message, cart } = await cartManager.deleteProductFromCart(req.params.cid, req.params.pid);
        if (success) {
            res.json({ message: message, cart: cart });
        } else {
            res.status(404).json({ message: message });
        }
    } catch (error) {
        console.error("Error al eliminar producto del carrito...", error);
        res.status(500).json({ error: "Error del servidor" });
    }
});

module.exports = router;