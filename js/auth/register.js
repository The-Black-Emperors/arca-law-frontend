const registerForm = document.getElementById('register-form');
const errorMessageDiv = document.getElementById('error-message');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorMessageDiv.textContent = '';
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Falha no registro.');
        }
        alert('Registro realizado com sucesso! Você será redirecionado para a página de login.');
        window.location.href = '/auth/login.html';
    } catch (error) {
        errorMessageDiv.textContent = error.message;
    }
});