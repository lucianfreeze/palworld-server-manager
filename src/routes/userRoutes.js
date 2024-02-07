const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../User.js');

// Basic authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.session.isAuthenticated) {
        next();
    } else {
        res.status(401).send("Unauthorized: You need to login first");
    }
};

// User login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.find(email);
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.isAuthenticated = true;
        res.json({ message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// User logout route
router.get('/logout', (req, res) => {
    req.session.isAuthenticated = false;
    res.json({ message: 'Logout successful' });
});

// Add a new user - only for authenticated users
router.post('/register', isAuthenticated, async (req, res) => {
    await User.create(req.body)
    .then(() => {
        res.send('User added successfully');
    })
    .catch((err) => {
        res.status(400).send(err.message);
    });
});

// List all users - only for authenticated users
router.get('/list', async (req, res) => {
    let users = await User.all();
    users.forEach(user => delete user.password);
    res.json(users);
});

// List all users - only for authenticated users
router.get('/:id', async (req, res) => {
    let user = await User.find(req.params.id);
    // Remove the password from the response
    delete user.password;
    res.json(user);
});

// Remove a user - only for authenticated users
router.delete('/remove/:id', isAuthenticated, (req, res) => {
    if (req.params.id === req.session.userId) {
        res.status(400).send('You cannot delete your own account');
    }
    if (req.session.isAdmin) {
        res.status(400).send('You cannot delete an admin account');
    }
    User.delete(req.params.id);
    res.send('User removed successfully');
});

module.exports = router;
