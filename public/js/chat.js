const socket = io();

// Username-t a URL-ből olvassuk ki, amit a login.js átadott
const urlParams = new URLSearchParams(window.location.search);
const currentUser = urlParams.get('username');

if (!currentUser) {
  // Ha nincs username, vissza a login oldalra
  window.location.href = '/';
}

const messages = document.getElementById('messages');
const inputForm = document.getElementById('input-container');
const messageInput = document.getElementById('message-input');

inputForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (!message) return;
  socket.emit('chat-message', message);
  messageInput.value = '';
});

socket.on('chat-message', ({ message, sender, timestamp }) => {
  addMessage(message, sender, timestamp, sender === currentUser);
});

function addMessage(message, sender, timestamp, self) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message');
  msgDiv.classList.add(self ? 'self' : 'other');

  msgDiv.innerHTML = `
    <div>${message}</div>
    <div class="message-info">
      <span>${sender}</span>
      <span>${new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
    </div>
  `;

  messages.appendChild(msgDiv);
  messages.scrollTop = messages.scrollHeight;
}
