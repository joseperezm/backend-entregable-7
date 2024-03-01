document.addEventListener('DOMContentLoaded', function() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            fetch('/api/carts')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('No se pudo obtener la lista de carritos');
                    }
                    return response.json();
                })
                .then(data => {
                    const cartIds = data.map(cart => cart._id);
                    let cartList = cartIds.join(", ");
                    const cartId = prompt(`Ingrese el ID del carrito al que desea añadir el producto:\nDisponibles: ${cartList}`);
                    
                    if (cartId && cartIds.includes(cartId)) {
                        const quantityInput = document.getElementById(`quantity-${productId}`);
                        const quantity = quantityInput ? quantityInput.value : 1; 
                        
                        fetch(`/api/carts/${cartId}/product/${productId}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ quantity: quantity })
                        })
                        .then(response => response.json())
                        .then(data => {
                            alert(data.message); 
                        })
                        .catch(error => console.error('Error:', error));
                    } else {
                        alert("ID de carrito no válido o no disponible.");
                    }
                })
                .catch(error => {
                    console.error('Error al obtener carritos:', error);
                });
        });
    });
});