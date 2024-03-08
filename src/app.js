const express = require('express');
const flash = require('connect-flash');
const session = require('express-session');
const exphbs = require("express-handlebars");
const socket = require("socket.io");
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const PUERTO = 8080;
const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");
const sessionsRouter = require('./routes/sessions.router.js');
const initializePassport = require("./config/passport.config.js");

const app = express();

mongoose.connect('mongodb+srv://coderhouse:ihOXSjjIqf0DM7xT@jjpm.envjeyh.mongodb.net/ecommerce?retryWrites=true&w=majority')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB', err));
  
app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());

app.use(cookieParser());

const oneWeekLogin = 7 * 24 * 60 * 60;

app.use(session({
  secret: "s3cr3t0sup3r53cr3t0",
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({ 
    mongoUrl: 'mongodb+srv://coderhouse:ihOXSjjIqf0DM7xT@jjpm.envjeyh.mongodb.net/ecommerce?retryWrites=true&w=majority', 
    ttl: oneWeekLogin
  }),
  cookie: {
    maxAge: oneWeekLogin * 1000 // milisegundos
  }
}));

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
    if (req.session.user) {
        res.locals.user = req.session.user;
    }
    next();
});

app.use(express.static("./src/public"));

app.engine("handlebars", exphbs.engine({
    helpers: {
        multiply: function(a, b) {
            return (a * b).toFixed(2);
        },
        totalCart: function(products) {
            let total = 0;
            products.forEach(product => {
                total += product.quantity * product.productId.price;
            });
            return total.toFixed(2);
        }
    }
}));
app.set("view engine", "handlebars");
app.set("views", "./src/views");

app.use("/api", productsRouter);
app.use("/api", cartsRouter);
app.use("/", viewsRouter);

app.use('/api/sessions', sessionsRouter);

const server = app.listen(PUERTO, () => {
    console.log(`Servidor escuchando en el puerto ${PUERTO}`);
});

const ProductManagerFs = require("./dao/fs/productManager-fs")
const productManagerFs = new ProductManagerFs("./dao/fs/products.json");

const ProductManager = require("./dao/db/productManager.js");
const productManager = new ProductManager();

const io = socket(server);

io.on("connection", async (socket) => {
    console.log("Nuevo cliente conectado");

    socket.emit("products", await productManager.getProducts());    
    
    socket.on("deleteProduct", async (id) => {
        await productManager.deleteProduct(id);
        io.sockets.emit("products", await productManager.getProducts());
    });

    socket.on("addProduct", async (producto) => {
        await productManager.addProduct(producto);
        io.sockets.emit("products", await productManager.getProducts());
    });
});

const Message = require('./dao/models/messages-mongoose.js'); 

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado');

   socket.on('user email provided', (email) => {
    console.log(`Correo electrónico recibido: ${email}`);
    
    Message.find().then(messages => {
        socket.emit('load all messages', messages); 
    });
});

    socket.on('chat message', async (data) => {
        try {
            const message = new Message(data);
            await message.save();
            io.emit('chat message', data); 
        } catch (error) {
            console.error('Error guardando el mensaje', error);
        }
    });

});