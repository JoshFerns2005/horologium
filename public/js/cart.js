document.addEventListener('DOMContentLoaded', () => {
    const cartContainer = document.getElementById('cart-items');
    const cart = document.getElementById('cart');
    const checkoutButton = document.getElementById('checkout');
    const userInfo = document.getElementById('user-info');
    const cartCount = document.getElementById('cart-count');
    const token = localStorage.getItem('token'); // Assuming you store the token in localStorage
    let userId; // Variable to store user ID

    if (token) {
        fetchUserInfo(token);
        fetchCartItems(token);
    } else {
        showAnonymousUser();
    }

    function fetchUserInfo(token) {
        fetch('http://localhost:3000/api/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(user => {
            if (user && user.first_name) {
                userId = user.id; // Store user ID
                userInfo.innerHTML = `Hello, ${user.first_name}! <a href="index.html" class="text-white hover:underline">Home</a> | <a href="logout.html" class="text-white hover:underline">Logout</a>`;
            } else {
                throw new Error('Invalid token');
            }
        })
        .catch(() => {
            showAnonymousUser();
        });
    }

    function fetchCartItems(token) {
        fetch('http://localhost:3000/api/cart', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(cartItems => {
            displayCartItems(cartItems);
            cartCount.textContent = cartItems.length;
        })
        .catch(error => console.error('Error fetching cart items:', error));
    }

    function displayCartItems(cartItems) {
        cartContainer.innerHTML = '';
        cartItems.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'border p-4 rounded shadow-lg mb-4';
            cartItem.innerHTML = `
                <h2 class="text-lg font-bold">${item.name}</h2>
                <p class="text-gray-700">${item.brand}</p>
                <p class="text-gray-700">Price: ₹${item.price}</p>
                <p class="text-gray-700">Stock: ${item.stock}</p>

                <p class="text-gray-700">Quantity: ${item.quantity}</p>
                <button class="remove-item bg-red-500 text-white p-2 rounded mt-2" data-watch-id="${item.id}">Remove from Cart</button>
            `;
            cartContainer.appendChild(cartItem);
        });

        // Attach event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (event) => {
                const watchId = event.target.getAttribute('data-watch-id');
                removeFromCart(userId, watchId); // Pass both user ID and watch ID
            });
        });
    }
    function removeFromCart(userId, id) {
        console.log('Removing from cart:', { userId, id }); // Verify the watchId being sent
        fetch('/api/cart', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ user_id: userId, id: id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Item removed from cart');
                fetchCartItems(); // Refresh cart items
            } else {
                alert('Failed to remove item: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    
    
    function showAnonymousUser() {
        userInfo.innerHTML = `Anonymous | <a href="login.html" class="text-white hover:underline">Login</a> | <a href="register.html" class="text-white hover:underline">Register</a>`;
        cartContainer.innerHTML = '<p>Please log in to see your cart items.</p>';
        checkoutButton.style.display = 'none';
    }

    checkoutButton.addEventListener('click', () => {
        fetch('http://localhost:3000/api/checkout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Checkout successful!');
                cartContainer.innerHTML = ''; // Clear cart display
                cartCount.textContent = '0';
            } else {
                alert('Checkout failed');
            }
        })
        .catch(error => console.error('Error during checkout:', error));
    });
});
