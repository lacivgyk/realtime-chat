const socket = io();

const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = loginForm.username.value.trim();
  const password = loginForm.password.value.trim();

  socket.emit('login', { username, password });
});

socket.on('login-success', (username) => {
  // Sikeres login után átirányítás a chat oldalra, pl. query parammal átadva a felhasználónevet (opcionális)
  window.location.href = 'chat.html?username=' + encodeURIComponent(username);
});

socket.on('login-error', (msg) => {
  loginError.textContent = msg;
});
