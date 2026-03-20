require('dotenv').config(); 
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./config/db'); 
const apiRoutes = require('./routes/api');

const app = express();

// 1. First, apply middleware
app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

// 2. Second, create the HTTP server using the express app
const server = http.createServer(app);

// 3. Third, initialize Socket.io USING the server we just created
// Fixed: Removed the double declaration you had earlier
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('sendMessage', (data) => {
        const { sender_id, username, message_text } = data;
        const query = 'INSERT INTO messages (sender_id, message_text) VALUES (?, ?)';
        
        db.query(query, [sender_id, message_text], (err) => {
            if (err) return console.error("DB Error:", err);
            // This sends the message to everyone connected
            io.emit('receiveMessage', { username, message_text }); 
        });
    });

    socket.on('disconnect', () => console.log('User disconnected'));
});

// 4. Use the dynamic port for Render/Railway
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
