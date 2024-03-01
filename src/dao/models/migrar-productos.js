const mongoose = require('mongoose');
const Product = require('./products-mongoose'); 
const productsData = require('../fs/products.json'); 

mongoose.connect('mongodb+srv://coderhouse:ihOXSjjIqf0DM7xT@jjpm.envjeyh.mongodb.net/ecommerce?retryWrites=true&w=majority')
.then(async () => {
  console.log('Conectado a MongoDB Atlas para la migración');

  await Product.deleteMany({});

  await Product.insertMany(productsData);

  console.log('Migración de productos completada');
  process.exit();
}).catch(err => console.error('Error al conectar a MongoDB Atlas', err));
