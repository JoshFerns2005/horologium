// public/order-summary.js
document.addEventListener('DOMContentLoaded', () => {
    const orderId = new URLSearchParams(window.location.search).get('orderId');
    
    if (orderId) {
        fetch(`/api/order-summary?orderId=${orderId}`)
            .then(response => response.json())
            .then(data => {
                const productsList = document.getElementById('products-list');
                productsList.innerHTML = '';

                data.products.forEach(product => {
                    const productElement = document.createElement('div');
                    productElement.classList.add('product');
                    productElement.innerHTML = `
                        <img src="${product.image}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p>Brand: ${product.brand}</p>
                        <p>Price: $${product.price}</p>
                        <p>Quantity: ${product.quantity}</p>
                    `;
                    productsList.appendChild(productElement);
                });
            })
            .catch(error => {
                console.error('Error fetching order summary:', error);
            });
    } else {
        alert('Order ID is missing.');
    }
});
