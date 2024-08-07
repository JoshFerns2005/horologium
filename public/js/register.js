document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');

    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const phoneNumber = document.getElementById('phoneNumber').value;
            const addressLine1 = document.getElementById('addressLine1').value;
            const addressLine2 = document.getElementById('addressLine2').value;
            const city = document.getElementById('city').value;
            const state = document.getElementById('state').value;
            const postalCode = document.getElementById('postalCode').value;
            const country = document.getElementById('country').value;
            const password = document.getElementById('password').value;

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

            if (!emailRegex.test(email)) {
                alert('Invalid email format.');
                return;
            }
            if (!passwordRegex.test(password)) {
                alert('Password must be between 6 to 20 characters long and include at least one numeric digit, one uppercase and one lowercase letter.');
                return;
            }

            fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    addressLine1,
                    addressLine2,
                    city,
                    state,
                    postalCode,
                    country,
                    password
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Registration successful!');
                    window.location.href = 'login.html'; // Redirect to login page
                } else {
                    alert('Registration failed: ' + data.message);
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }
});
