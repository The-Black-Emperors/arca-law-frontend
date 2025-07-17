const registerForm = document.getElementById('register-form');
const debugBtn = document.getElementById('debug-register-btn');
const errorMessageDiv = document.getElementById('error-message');

async function performRegister(event, isDebug = false) {
    event.preventDefault();
    errorMessageDiv.textContent = '';
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const url = isDebug ? 'https://arca-law-backend.vercel.app/api/auth/debug-register' : 'https://arca-law-backend.vercel.app/api/auth/register';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        
        const data = await response.json();

        if (isDebug) {
            console.log("RESPOSTA DO DEBUG:", data);
            errorMessageDiv.textContent = `Debug: Passo ${data.step} -> ${data.status}. Veja o console (F12).`;
            if(data.status === 'success') {
                alert('Debug de registro funcionou! Usuário criado.');
            }
            return;
        }

        if (!response.ok) {
            throw new Error(data.message || 'Falha no registro.');
        }
        
        alert('Registro realizado com sucesso! Você será redirecionado para a página de login.');
        window.location.href = '/auth/login.html';

    } catch (error) {
        console.error("ERRO COMPLETO:", error);
        errorMessageDiv.textContent = error.message;
    }
}

registerForm.addEventListener('submit', (event) => performRegister(event, false));
debugBtn.addEventListener('click', (event) => performRegister(event, true));