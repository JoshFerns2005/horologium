// Function to handle checkout
function checkout(paymentMethod) {
    fetch('/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentMethod })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
