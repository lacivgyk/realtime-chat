document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errEl = document.getElementById('error');
  errEl.textContent = '';

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok && data.ok) {
      // sikeres belépés: átirányítás chatre
      window.location = '/chat';
    } else {
      errEl.textContent = data.msg || 'Hiba a bejelentkezéskor';
    }
  } catch (err) {
    errEl.textContent = 'Hálózati hiba';
  }
});
