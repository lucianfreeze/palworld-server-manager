// This file defines the routes for the client-side of the application. (UI, etc.)
const express = require('express');
const router = express.Router();

// Home route
router.get('/', (req, res) => {
    res.send('Welcome to PalWorld Server Manager!');
});

// About route
router.get('/about', (req, res) => {
    res.send('About PalWorld Server Manager');
});

// Server status route
router.get('/status', (req, res) => {
    res.send('Server is running');
});

// Server control route
router.get('/control', (req, res) => {
    res.send('Server control panel');
});

// Members route
router.get('/members', (req, res) => {
    res.send('List of members');
});

// Export the router
module.exports = router;