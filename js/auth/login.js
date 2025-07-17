const loginForm = document.getElementById('login-form');
const errorMessageDiv = document.getElementById('error-message');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorMessageDiv.textContent = '';
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        const response = await fetch('/api/auth/login', {
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
    }
});