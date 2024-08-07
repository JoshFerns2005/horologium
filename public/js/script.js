document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in and display greeting
    const userInfo = document.getElementById('user-info');
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
        userInfo.innerHTML = `Hello, ${user.firstName}! <a href="profile.html" class="text-white hover:underline">Profile</a> | <a href="logout.html" class="text-white hover:underline">Logout</a>`;
    } else {
        userInfo.innerHTML = '<a href="login.html" class="text-white hover:underline">Login</a> | <a href="register.html" class="text-white hover:underline">Register</a>';
    }

    // Fetch and update cart count
    fetch('http://localhost:3000/api/cart/count')
        .then(response => response.json())
        .then(data => {
            const cartCount = document.getElementById('cart-count');
            cartCount.textContent = data.count || 0;
        })
        .catch(error => console.error('Error fetching cart count:', error));

    // Fetch and display watches and brands
    fetchWatches();

    function fetchWatches() {
        fetch(`http://localhost:3000/api/watches/${watchId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json(); // Assuming API returns JSON
        })
        .then(data => {
            displayProduct(data);
        })
        .catch(error => {
            console.error('Error fetching product details:', error);
            alert('Failed to load product details. Please try again later.');
        });
    }

    function displayWatches(watches) {
        const watchesContainer = document.getElementById('watches');
        watchesContainer.innerHTML = '';
        watches.forEach(watch => {
            const watchElement = document.createElement('div');
            watchElement.className = 'border p-4 rounded-lg shadow-md bg-white';
            watchElement.innerHTML = `
            <img src="images/watch_images/${watch.image}" alt="${watch.name}" class="w-full h-48 object-cover mb-2">
            <h2 class="text-lg font-bold">${watch.name}</h2>
            <p class="text-gray-700">$${watch.price}</p>
            <a href="product.html?id=${watch._id}" class="bg-blue-500 text-white p-2 rounded mt-2 inline-block">View Details</a>
        `;
            watchesContainer.appendChild(watchElement);
        });
    }

    function populateBrands(watches) {
        const brandsSet = new Set(watches.map(watch => watch.brand));
        const filterBrandSelect = document.getElementById('filter-brand');
        filterBrandSelect.innerHTML = '<option value="">All Brands</option>'; // Reset with default option
        brandsSet.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            filterBrandSelect.appendChild(option);
        });
    }

    // Event listeners for search and filter
    document.getElementById('search').addEventListener('input', fetchWatches);
    document.getElementById('filter-brand').addEventListener('change', fetchWatches);
});
