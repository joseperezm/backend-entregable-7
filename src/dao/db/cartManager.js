const mongoose = require('mongoose');
const { CastError } = require('mongoose').Error;
const Cart = require('../models/carts-mongoose'); 
const Product = require('../models/products-mongoose'); 

class CartManager {
    constructor() {}

    async createCart() {
        try {
            const cart = new Cart();
            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error creando el carrito:', error);
            throw error;
        }
    }

    async addToCart(cartId, productId, quantity = 1) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                console.log('Carrito no encontrado');
                return { success: false, message: 'Carrito no encontrado', cart: null };
            }
    
            const product = await Product.findById(productId);
            if (!product) {
                console.log('Producto no encontrado');
                return { success: false, message: 'Producto no encontrado', cart: null };
            }
    
            const existingProductIndex = cart.products.findIndex(item => item.productId.equals(productId));
    
            if (existingProductIndex >= 0) {
                cart.products[existingProductIndex].quantity += quantity;
            } else {
                cart.products.push({ productId, quantity });
            }
    
            await cart.save(); 
    
            return { success: true, message: 'Producto agregado al carrito correctamente', cart: cart };
        } catch (error) {
            if (error instanceof CastError) {
                console.error('ID incorrecto:', error);
                return { success: false, message: 'ID incorrecto de carrito o producto', cart: null };
            } else {
                console.error('Error añadiendo producto al carrito:', error);
                throw error;
            }
        }
    }
       
    
    async getAllCarts() {
        try {
            const carts = await Cart.find(); 
            return carts;
        } catch (error) {
            console.error('Error obteniendo todos los carritos:', error);
            throw error;
        }
    }    

    async getCart(cartId) {
        try {
            const cart = await Cart.findById(cartId).populate('products.productId');
            if (!cart) {
                console.log('Carrito no encontrado');
                return null;
            }
            return cart;
        } catch (error) {
            if (error instanceof CastError && error.path === '_id') {
                console.error('ID incorrecto de carrito:', error);
                return null; 
            } else {
                console.error('Error obteniendo el carrito:', error);
                throw error; 
            }
        }
    }

    async deleteCart(cartId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                console.log('Carrito no encontrado');
                return false; 
            }
            
            await cart.deleteOne(); 
            return true; 
        } catch (error) {
            if (error instanceof CastError) {
                console.error('ID incorrecto:', error);
                return false;
            } else {
                console.error('Error eliminando el carrito:', error);
                throw error;
            }
        }
    }     

    async deleteProductFromCart(cartId, productId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                console.log('Carrito no encontrado');
                return { success: false, message: 'Carrito no encontrado' };
            }
    
            const productIndex = cart.products.findIndex(product => product.productId.equals(productId));
    
            if (productIndex !== -1) {
                if (cart.products[productIndex].quantity > 1) {
                    cart.products[productIndex].quantity -= 1;
                } else {
                    cart.products.splice(productIndex, 1);
                }
    
                await cart.save(); 
    
                return {
                    success: true,
                    message: 'Producto eliminado del carrito correctamente',
                    cart: cart
                };
            } else {
                return {
                    success: false,
                    message: 'Producto no encontrado en el carrito',
                    cart: cart
                };
            }
        } catch (error) {
            if (error instanceof CastError) {
                console.error('ID incorrecto:', error);
                return { success: false, message: 'Carrito no encontrado' };
            } else {
                console.error('Error eliminando el producto del carrito:', error);
                throw error;
            }
        }
    }
    
    async updateProductQuantity(cartId, productId, quantity) {
        const cart = await this.getCart(cartId); 
        if (!cart) {
            return { success: false, message: "Carrito no encontrado" };
        }
    
        const productIndex = cart.products.findIndex(p => p.productId.equals(productId));
        if (productIndex === -1) {
            return { success: false, message: "Producto no encontrado en el carrito" };
        }
    
        if (quantity <= 0) {
            cart.products.splice(productIndex, 1); 
        } else {
            cart.products[productIndex].quantity = quantity; 
        }
    
        await cart.save();
        return { success: true, cart: cart };
    }
    
    async updateCartProducts(cartId, products) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                return { success: false, message: "Carrito no encontrado" };
            }
    
            const updatedProducts = products.map(product => ({
                productId: new mongoose.Types.ObjectId(product.productId),
                quantity: Number(product.quantity)
            }));
    
            cart.products = updatedProducts;c
    
            await cart.save();
            return { success: true, cart: cart };
        } catch (error) {
            console.error("Error al actualizar el carrito con nuevos productos", error);
            throw error;
        }
    }
    
    async emptyCart(cartId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                console.log('Carrito no encontrado');
                return { success: false, message: 'Carrito no encontrado' };
            }
    
            cart.products = [];
    
            await cart.save();
    
            return { success: true, message: 'Carrito vaciado correctamente', cart: cart };
        } catch (error) {
            if (error instanceof CastError) {
                console.error('ID incorrecto:', error);
                return { success: false, message: 'ID incorrecto de carrito' };
            } else {
                console.error('Error vaciando el carrito:', error);
                throw error;
            }
        }
    }    
          
}

module.exports = CartManager;