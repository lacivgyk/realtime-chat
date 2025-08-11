const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// Előre definiált felhasználók
const users = {
  user1: 'pass1',
  user2: 'pass2'
};

let loggedInUsers = new Set();

io.on('connection', (socket) => {
  let username = null;

  socket.on('login', ({ username: user, password }) => {
    if (users[user] && users[user] === password) {
      if (loggedInUsers.has(user)) {
        socket.emit('login-error', 'Ez a felhasználó már be van jelentkezve!');
        return;
      }
      username = user;
      loggedInUsers.add(user);
      socket.emit('login-success', user);
      console.log(`${user} bejelentkezett.`);
    } else {
      socket.emit('login-error', 'Hibás felhasználónév vagy jelszó!');
    }
  });

  socket.on('chat-message', (message) => {
    if (!username) return;
    const timestamp = new Date().toISOString();
    io.emit('chat-message', { message, sender: username, timestamp });
  });

  socket.on('disconnect', () => {
    if (username) {
      loggedInUsers.delete(username);
      console.log(`${username} kijelentkezett.`);
    }
  });
});

http.listen(PORT, () => {
  console.log(`Szerver fut a http://localhost:${PORT} címen`);
});
