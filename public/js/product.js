document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const watchId = urlParams.get('id');
    const cartCount = document.getElementById('cart-count');

    if (watchId) {
        fetch(`http://localhost:3000/api/watches/${watchId}`)
            .then(response => response.json())
            .then(data => {
                displayProduct(data);
            })
            .catch(error => console.error('Error fetching product details:', error));
    }

    function displayProduct(watch) {
        const productImage = document.getElementById('product-image');
        const productInfo = document.getElementById('product-info');
        productImage.innerHTML = `<img src="images/watch_images/${watch.image}" alt="${watch.name}" class="w-full h-80 object-cover">`;
        productInfo.innerHTML = `
            <h1 class="text-3xl font-bold">${watch.name}</h1>
            <p class="text-gray-600">${watch.brand}</p>
            <p class="text-gray-800 mt-2 text-lg">₹${watch.price}</p>
            <p class="mt-2">${watch.description}</p>
            <button id="add-to-cart" class="bg-blue-500 text-white p-2 rounded mt-4">Add to Cart</button>
        `;
        
        document.getElementById('add-to-cart').addEventListener('click', () => {
            addToCart(watch.id);
        });
    }

    function addToCart(watchId) {
        const token = localStorage.getItem('token'); // Assuming you store the token in localStorage
        if (!token) {
            alert('You need to log in first.');
            window.location.href = 'login.html'; // Redirect to login page
            return;
        }

        fetch('http://localhost:3000/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Include the Bearer prefix
            },
            body: JSON.stringify({ watchId, quantity: 1 })
        })
        .then(response => response.json())
        
        .then(data => {
            data.textContent = cartItems.length;
            if (data.success) {
                alert('Added to cart!');
            } else {
                alert('Failed to add to cart');
            }
        })
        .catch(error => console.error('Error adding to cart:', error));
    }
});
