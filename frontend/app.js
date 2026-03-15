
const socket = io('http://localhost:3000');
let isLogin = true;
let userData = null;

const authForm = document.getElementById('auth-form');
const toggleAuth = document.getElementById('toggle-auth');
const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');
const errorMsg = document.getElementById('error-msg');

// Toggle between Login and Sign Up
toggleAuth.onclick = () => {
    isLogin = !isLogin;
    document.getElementById('auth-title').innerText = isLogin ? 'Login' : 'Sign Up';
    document.getElementById('auth-btn').innerText = isLogin ? 'Login' : 'Sign Up';
    document.getElementById('toggle-p').innerHTML = isLogin ? 
        'Don\'t have an account? <span id="toggle-auth">Sign Up</span>' : 
        'Already have an account? <span id="toggle-auth">Login</span>';
    document.getElementById('toggle-auth').onclick = toggleAuth.onclick;
};

// Authentication (Sign Up or Login)
authForm.onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const path = isLogin ? '/api/login' : '/api/register';

    try {
        const res = await fetch(`http://localhost:3000${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (res.ok) {
            if (isLogin) {
                userData = data.user;
                startChat();
            } else {
                alert('Account Created! Please Login.');
                location.reload();
            }
        } else {
            errorMsg.innerText = data.message;
        }
    } catch (err) { console.error("Connection error:", err); }
};

function startChat() {
    authContainer.style.display = 'none';
    chatContainer.style.display = 'block';
    document.getElementById('welcome-user').innerText = `Chatting as: ${userData.username}`;
    fetchHistory();
}

async function fetchHistory() {
    const res = await fetch('http://localhost:3000/api/history');
    const history = await res.json();
    history.forEach(m => addMessageToUI(m.username, m.message_text));
}

document.getElementById('chat-form').onsubmit = (e) => {
    e.preventDefault();
    const input = document.getElementById('msg-input');
    socket.emit('sendMessage', { 
        sender_id: userData.id, 
        username: userData.username, 
        message_text: input.value 
    });
    input.value = '';
};

socket.on('receiveMessage', (data) => addMessageToUI(data.username, data.message_text));

function addMessageToUI(user, text) {
    const div = document.createElement('div');
    div.classList.add('msg');
    div.innerHTML = `<strong>${user}:</strong> ${text}`;
    document.getElementById('messages').appendChild(div);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}
