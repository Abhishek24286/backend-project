const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const db = require('../config/db'); 

// --- Authentication Routes ---

// Route for creating a new account
router.post('/register', authController.register);

// Route for logging into an existing account
router.post('/login', authController.login);


// --- Chat Routes ---

// Route to fetch all previous messages from the database
router.get('/history', (req, res) => {
    // This query joins the users and messages tables so we can show 
    // the actual username instead of just a sender_id number.
    const query = `
        SELECT users.username, messages.message_text 
        FROM messages 
        JOIN users ON messages.sender_id = users.id 
        ORDER BY messages.created_at ASC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("History fetch error:", err);
            return res.status(500).json({ error: "Could not retrieve chat history" });
        }
        res.json(results);
    });
});

// Optional: Route to delete a user (as discussed earlier)
// router.post('/delete-account', authController.deleteUser);

module.exports = router;