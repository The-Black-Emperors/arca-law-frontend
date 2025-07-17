const loginForm = document.getElementById('login-form');
const errorMessageDiv = document.getElementById('error-message');
const submitButton = loginForm.querySelector('button[type="submit"]');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorMessageDiv.textContent = '';
    submitButton.disabled = true;
    submitButton.textContent = 'Entrando...';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('https://arca-law-backend.vercel.app/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Falha no login.');
        }
        localStorage.setItem('arca-law-token', data.token);
        window.location.href = '/';
    } catch (error) {
        errorMessageDiv.textContent = error.message;
        submitButton.disabled = false;
        submitButton.textContent = 'Entrar';
    }
});