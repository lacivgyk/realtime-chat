const socket = io();
const messagesEl = document.getElementById('messages');
const msgForm = document.getElementById('msgForm');
const msgInput = document.getElementById('msgInput');
const yourNameEl = document.getElementById('yourName');
const logoutBtn = document.getElementById('logoutBtn');

async function getUsername() {
  // A szerver session-je alapján nincs külön endpoint; a kliens itt beolvashatja a felhasználónév egy egyszerű hackkel:
  // Amennyiben nem akarsz session-t a kliensből lekérni, a szerver adhatna /whoami endpointot.
  // Gyors és egyszerű megoldás: a szerver beállíthatná a username-t egy cookies-ben, de itt feltételezzük, hogy
  // a session-ből a chat.html betöltése után a kliens tudja a felhasználót (példa: beágyazás nincs).
  // Egyszerű megoldás: kérjük meg a felhasználót egy prompttal (ez jó demo célokra).
  let name = sessionStorage.getItem('username');
  if (!name) {
    name = prompt('Mi a felhasználóneved? (ez a demo miatt)', 'user1') || 'Ismeretlen';
    sessionStorage.setItem('username', name);
  }
  return name;
}

(async () => {
  const username = await getUsername();
  yourNameEl.textContent = username;
  socket.emit('join', username);
})();

function appendMessage({ from, msg, ts }, mine=false) {
  const li = document.createElement('li');
  li.className = mine ? 'mine' : 'other';
  const meta = document.createElement('div');
  meta.className = 'meta';
  const date = new Date(ts);
  meta.textContent = `${from} — ${date.toLocaleString()}`;
  const body = document.createElement('div');
  body.textContent = msg;
  li.appendChild(meta);
  li.appendChild(body);
  messagesEl.appendChild(li);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function appendSystem({ msg, ts }) {
  const li = document.createElement('li');
  li.style.textAlign = 'center';
  li.style.fontSize = '0.9rem';
  li.style.color = '#666';
  li.textContent = `${msg} — ${new Date(ts).toLocaleTimeString()}`;
  messagesEl.appendChild(li);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

socket.on('message', (payload) => {
  const myName = sessionStorage.getItem('username');
  appendMessage(payload, payload.from === myName);
});

socket.on('system', (payload) => {
  appendSystem(payload);
});

msgForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = msgInput.value.trim();
  if (!text) return;
  socket.emit('message', text);
  msgInput.value = '';
});

// Logout
logoutBtn.addEventListener('click', async () => {
  await fetch('/logout', { method: 'POST' });
  sessionStorage.removeItem('username');
  window.location = '/';
});
