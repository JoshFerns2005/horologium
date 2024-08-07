document.addEventListener('DOMContentLoaded', () => {
    const watchContainer = document.getElementById('watches');
    const filterBrand = document.getElementById('filter-brand');
    const search = document.getElementById('search');
    const userInfo = document.getElementById('user-info');
    const cartCount = document.getElementById('cart-count');

    // Fetch and display watches
    fetch('http://localhost:3000/api/watches')
        .then(response => response.json())
        .then(watches => {
            watches.forEach(watch => {
                const watchElement = document.createElement('div');
                watchElement.className = 'border p-4 rounded shadow-lg';
                watchElement.innerHTML = `
                    <img src="images/watch_images/${watch.image}" alt="${watch.name}" class="w-full h-48 object-cover mb-2">
                    <h2 class="text-lg font-bold">${watch.name}</h2>
                    <p class="text-gray-700">$${watch.price}</p>
                    <a href="product.html?id=${watch.id}" class="bg-blue-500 text-white p-2 rounded mt-2 inline-block">View Details</a>
                `;
                watchContainer.appendChild(watchElement);
            });

            // Populate brand filter options
            const brands = [...new Set(watches.map(watch => watch.brand))];
            brands.forEach(brand => {
                const option = document.createElement('option');
                option.value = brand;
                option.textContent = brand;
                filterBrand.appendChild(option);
            });
        });

    // Filter watches
    filterBrand.addEventListener('change', () => {
        const brand = filterBrand.value;
        fetch(`http://localhost:3000/api/watches?brand=${brand}`)
            .then(response => response.json())
            .then(watches => {
                watchContainer.innerHTML = '';
                watches.forEach(watch => {
                    const watchElement = document.createElement('div');
                    watchElement.className = 'border p-4 rounded shadow-lg';
                    watchElement.innerHTML = `
                        <img src="images/watch_images/${watch.image}" alt="${watch.name}" class="w-full h-48 object-cover mb-2">
                        <h2 class="text-lg font-bold">${watch.name}</h2>
                        <p class="text-gray-700">$${watch.price}</p>
                        <a href="product.html?id=${watch.id}" class="bg-blue-500 text-white p-2 rounded mt-2 inline-block">View Details</a>
                    `;
                    watchContainer.appendChild(watchElement);
                });
            });
    });

    // Search functionality
    search.addEventListener('input', () => {
        const query = search.value.toLowerCase();
        const items = document.querySelectorAll('#watches > div');
        items.forEach(item => {
            const name = item.querySelector('h2').textContent.toLowerCase();
            if (name.includes(query)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Fetch user info and update UI
    fetch('http://localhost:3000/api/user', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response.json();
    })
    .then(user => {
        userInfo.innerHTML = `
            <span>Hello, ${user.first_name}</span>
            <a href="profile.html" class="ml-4">Profile</a>
            <button id="logout" class="ml-4 bg-red-500 text-white p-2 rounded">Logout</button>
        `;

        document.getElementById('logout').addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.reload();
        });
    })
    .catch(error => {
        userInfo.innerHTML = `
            <a href="login.html" class="ml-4">Login</a>
            <a href="register.html" class="ml-4">Register</a>
        `;
        console.error('Error fetching user info:', error);
    });

    // Fetch cart count
    fetch('http://localhost:3000/api/cart', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(cartItems => {
        cartCount.textContent = cartItems.length;
    })
    .catch(error => {
        console.error('Error fetching cart count:', error);
        cartCount.textContent = '0';

    });
});
