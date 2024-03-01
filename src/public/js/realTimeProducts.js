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

document.getElementById("btnSend").addEventListener("click", (event) => {
    event.preventDefault(); // Prevenir el envío por defecto del formulario
    addProduct();
});

const addProduct = () => {
    // Selecciona el formulario usando su clase o id
    const form = document.querySelector('.texto-formulario');

    // Verifica si el formulario es válido
    if (form.checkValidity() === true) {
        // Construye el objeto del producto solo si el formulario es válido
        const product = {
            title: document.getElementById("title").value,
            description: document.getElementById("description").value,
            price: parseFloat(document.getElementById("price").value),
            thumbnails: document.getElementById("thumbnails").value || "uploads/placeholder.jpg",
            code: document.getElementById("code").value,
            stock: parseInt(document.getElementById("stock").value),
            category: document.getElementById("category").value,
            status: document.getElementById("status").value === "true"
        };

        // El formulario es válido, puedes enviar los datos
        socket.emit("addProduct", product);

        // Limpia el formulario solo después de enviar los datos
        form.reset(); // Esto restablece los valores de los campos a sus valores predeterminados
        
        // Elimina la clase 'was-validated' y la clase 'is-invalid' de todos los elementos del formulario
        form.classList.remove('was-validated');
        Array.from(form.querySelectorAll('.form-control')).forEach((input) => {
            input.classList.remove('is-invalid');
        });

        // Restablece manualmente el estado seleccionado de elementos como 'select' si es necesario
        document.getElementById("status").value = "true"; // Ejemplo para restablecer el select
    } else {
        // Añade la clase was-validated al formulario para que se muestren los feedbacks
        form.classList.add('was-validated');
    }
};