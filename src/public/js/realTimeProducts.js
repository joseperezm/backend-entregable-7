const socket = io();

socket.on("products", (data) => {
    renderProducts(data);
}); 

const renderProducts = (productos) => {
    const productContainer = document.getElementById("productContainer");
    productContainer.innerHTML = "";


    productos.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
        <img src="${item.thumbnails}" class="card-img-top" alt="${item.title}">
        <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
            <p class="card-title">Categoría: ${item.category}</p>
            <p class="card-text">Precio: $${item.price}</p>
            <p class="card-text">Stock: ${item.stock}</p>
            <p class="card-text">Status: ${item.status}</p>
            <p class="card-text">Code: ${item.code}</p>
            <p class="card-text mini mt-2 mb-2">ID: ${item._id}</p>
            <button type="button" class="btn btn-primary mt-2">Eliminar Producto</button>
        </div>
        `;
        productContainer.appendChild(card);

        card.querySelector("button").addEventListener("click", () => {
            deleteProduct(item._id);
        });
    });
}

const deleteProduct = (id) => {
    socket.emit("deleteProduct", id);
}

document.getElementById("btnSend").addEventListener("click", () => {
    addProduct();
});


const addProduct = () => {
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const price = document.getElementById("price").value;
    const thumbnails = document.getElementById("thumbnails").value;
    const code = document.getElementById("code").value;
    const stock = document.getElementById("stock").value;
    const category = document.getElementById("category").value;
    const status = document.getElementById("status").value === "true";

    const product = {
        title: title,
        description: description,
        price: parseFloat(price),
        thumbnails: thumbnails || "uploads/placeholder.jpg",
        code: code,
        stock: parseInt(stock),
        category: category,
        status: status
    };
    
    if (!title || !description || !code || !price || !stock || !category) {
        alert("Por favor, complete todos los campos obligatorios.");
        return;
    }
    
    socket.emit("addProduct", product);
};



