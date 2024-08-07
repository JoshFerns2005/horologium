const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;

const JWT_SECRET = 'REDPajpPo9'; // Change this to your JWT secret


// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', // Change this to your MySQL password
    database: 'horologium'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database.');
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// Route to register a new user
app.post('/api/register', async (req, res) => {
    const { 
        username, 
        email, 
        password, 
        firstName, 
        lastName, 
        phoneNumber, 
        addressLine1, 
        addressLine2, 
        city, 
        state, 
        postalCode, 
        country 
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
        INSERT INTO users (
            username, 
            first_name, 
            last_name, 
            email, 
            phone_number, 
            address_line1, 
            address_line2, 
            city, 
            state, 
            postal_code, 
            country, 
            password
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [username, firstName, lastName, email, phoneNumber, addressLine1, addressLine2, city, state, postalCode, country, hashedPassword], (err, result) => {
        if (err) throw err;
        res.json({ message: 'User registered successfully' });
    });
});

// Route to login a user
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
                res.json({ token });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    });
});

// Route to get authenticated user details
app.get('/api/user', authenticateJWT, (req, res) => {
    const userId = req.user.id;
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user details:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch user details' });
        }
        res.json(results[0]);
    });
});

// Route to get all watches
app.get('/api/watches', (req, res) => {
    const sql = 'SELECT * FROM watches';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Route to get a single watch by ID
app.get('/api/watches/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM watches WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) throw err;
        res.json(results[0]);
    });
});

// Route to handle adding items to cart
app.post('/api/cart', authenticateJWT, (req, res) => {
    const { watchId, quantity } = req.body;
    const userId = req.user.id;

    // Check if the item already exists in the cart
    const checkSql = 'SELECT * FROM cart WHERE user_id = ? AND watch_id = ?';
    db.query(checkSql, [userId, watchId], (err, results) => {
        if (err) {
            console.error('Error checking cart:', err);
            return res.status(500).json({ success: false, message: 'Failed to check cart' });
        }

        if (results.length > 0) {
            // Item already exists in the cart, update the quantity
            const updateSql = 'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND watch_id = ?';
            db.query(updateSql, [quantity, userId, watchId], (err, result) => {
                if (err) {
                    console.error('Error updating cart:', err);
                    return res.status(500).json({ success: false, message: 'Failed to update cart' });
                }
                res.json({ success: true, message: 'Item quantity updated in cart' });
            });
        } else {
            // Item does not exist in the cart, add it
            const sql = 'INSERT INTO cart (user_id, watch_id, quantity) VALUES (?, ?, ?)';
            db.query(sql, [userId, watchId, quantity], (err, result) => {
                if (err) {
                    console.error('Error adding to cart:', err);
                    return res.status(500).json({ success: false, message: 'Failed to add to cart' });
                }
                res.json({ success: true, message: 'Added to cart successfully' });
            });
        }
    });
});

// Remove an item from the cart
app.delete('/api/cart', authenticateJWT, (req, res) => {
    const { id } = req.body;
    const user_id = req.user.id; // Use authenticated user's ID from the token
    // const watchId = Number(watch_id);

    console.log('Received data:', { user_id, id }); // Log request data

    if (!id) {
        return res.status(400).json({ success: false, message: 'Missing watch_id' });
    }

    // Convert watch_id to a number
    

    // SQL query
    const sql = 'DELETE FROM cart WHERE user_id = ? AND id = ?';
    db.query(sql, [user_id, id], (error, results) => {
        if (error) {
            console.error('Error removing item from cart:', error);
            return res.status(500).json({ success: false, message: 'Error removing item' });
        }

        if (results.affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Item not found in cart' });
        }
    });
});




// Route to get items in the cart for the logged-in user
app.get('/api/cart', authenticateJWT, (req, res) => {
    const userId = req.user.id;
    
    const sql = `
        SELECT c.id, w.name, w.brand, w.price, w.image, c.quantity
        FROM cart c
        JOIN watches w ON c.watch_id = w.id
        WHERE c.user_id = ?
    `;
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching cart items:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch cart items' });
        }
        res.json(results);
    });
});


// Route to get cart item count for the logged-in user
app.get('/api/cart-count', authenticateJWT, (req, res) => {
    const userId = req.user.id;
    const sql = 'SELECT COUNT(*) AS count FROM cart WHERE user_id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching cart count:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch cart count' });
        }
        res.json(results[0]);
    });
});

// Route to handle checkout process (basic example)
app.post('/api/checkout', authenticateJWT, (req, res) => {
    const userId = req.user.id;

    // Get items in the cart
    const getCartItemsSql = `
        SELECT watch_id, quantity 
        FROM cart 
        WHERE user_id = ?
    `;
    db.query(getCartItemsSql, [userId], (err, cartItems) => {
        if (err) {
            console.error('Error fetching cart items:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch cart items' });
        }

        // Update stock for each item
        const updateStockPromises = cartItems.map(item => {
            const updateStockSql = 'UPDATE watches SET stock = stock - ? WHERE id = ?';
            return new Promise((resolve, reject) => {
                db.query(updateStockSql, [item.quantity, item.watch_id], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
        });

        Promise.all(updateStockPromises)
            .then(() => {
                // Delete items from the cart after stock is updated
                const deleteCartSql = 'DELETE FROM cart WHERE user_id = ?';
                db.query(deleteCartSql, [userId], (err, result) => {
                    if (err) {
                        console.error('Error during checkout:', err);
                        return res.status(500).json({ success: false, message: 'Checkout failed' });
                    }
                    res.json({ success: true, message: 'Checkout successful' });
                });
            })
            .catch(error => {
                console.error('Error updating stock:', error);
                res.status(500).json({ success: false, message: 'Failed to update stock' });
            });
    });
});

// Route to increase stock (e.g., used when restocking or adding new products)
app.post('/api/increase-stock', (req, res) => {
    const { productId, quantity } = req.body;
    
    const sql = 'UPDATE watches SET stock = stock + ? WHERE id = ?';
    db.query(sql, [quantity, productId], (err, result) => {
        if (err) {
            console.error('Error increasing stock:', err);
            return res.status(500).json({ success: false, message: 'Failed to increase stock' });
        }
        res.json({ success: true, message: 'Stock increased successfully' });
    });
});


// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
