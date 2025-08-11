const express = require('express');
const http = require('http');
const path = require('path');
const session = require('express-session');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- Konfiguráció ---
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'valami_titkos_kulcs';

// Előre definiált felhasználók (példa)
const USERS = {
  user1: 'pass1',
  user2: 'pass2'
};

// --- Middlewares ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 óra
}));

app.use(express.static(path.join(__dirname, 'public')));

// --- Auth middleware a chat oldal védelmére ---
function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/');
}

// Login endpoint (POST)
app.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, msg: 'Hiányzó adatok' });
  }

  const expected = USERS[username];
  if (expected && expected === password) {
    req.session.user = { username };
    return res.json({ ok: true });
  } else {
    return res.status(401).json({ ok: false, msg: 'Hibás felhasználónév vagy jelszó' });
  }
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// Chat oldal (csak autentikáltaknak)
app.get('/chat', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// --- Socket.io real-time rész ---
io.use((socket, next) => {
  // Ha akarod, be lehet kötni session-t is. Itt egyszerűen elfogadjuk a username-t kliens oldali csatlakozásból.
  next();
});

io.on('connection', (socket) => {
  // várjuk az "join" eseményt (username)
  socket.on('join', (username) => {
    socket.username = username || 'Ismeretlen';
    socket.join('main-room');
    // értesítés csatlakozásról
    const ts = new Date().toISOString();
    io.to('main-room').emit('system', { msg: `${socket.username} csatlakozott.`, ts });
  });

  socket.on('message', (msg) => {
    const payload = {
      from: socket.username || 'Ismeretlen',
      msg: msg,
      ts: new Date().toISOString()
    };
    io.to('main-room').emit('message', payload);
  });

  socket.on('disconnect', () => {
    const ts = new Date().toISOString();
    if (socket.username) {
      io.to('main-room').emit('system', { msg: `${socket.username} elhagyta a chatet.`, ts });
    }
  });
});

// --- Start server ---
server.listen(PORT, () => {
  console.log(`Szerver fut a http://localhost:${PORT} porton`);
});
