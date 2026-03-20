const db = require('../config/db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const register = async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
            if (results.length > 0) return res.status(400).json({ message: 'User already exists' });

            db.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', 
            [username, hashedPassword], (err) => {
                if (err) return res.status(500).json({ message: 'Error saving user' });
                res.status(201).json({ message: 'User registered safely!' });
            });
        });
    } catch (err) {
        res.status(500).json({ message: 'Security error' });
    }
};

const login = (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
        
        const user = results[0];
        const match = await bcrypt.compare(password, user.password_hash);

        if (match) {
            res.json({ message: 'Login success', user: { id: user.id, username: user.username } });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    });
};
const deleteUser = (req, res) => {
    const userId = req.body.id; // Or get it from a session/token

    db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error deleting user' });
        res.json({ message: 'Account deleted successfully' });
    });
};

// Add to your exports
module.exports = { register, login, deleteUser };
module.exports = { register, login };