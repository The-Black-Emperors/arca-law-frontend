const registerForm = document.getElementById('register-form');
const errorMessageDiv = document.getElementById('error-message');
const submitButton = registerForm.querySelector('button[type="submit"]');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorMessageDiv.textContent = '';
    submitButton.disabled = true;
    submitButton.textContent = 'Registrando...';

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('https://arca-law-backend.vercel.app/api/auth/register', {
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
        submitButton.disabled = false;
        submitButton.textContent = 'Registrar';
    }
});