console.log("Arquivo login.js carregado e executado com SUCESSO!");

const loginForm = document.getElementById('login-form');
const debugBtn = document.getElementById('debug-login-btn');
const errorMessageDiv = document.getElementById('error-message');

async function performLogin(event, isDebug = false) {
    event.preventDefault();
    errorMessageDiv.textContent = '';
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const url = isDebug ? 'https://arca-law-backend.vercel.app/api/auth/debug-login' : 'https://arca-law-backend.vercel.app/api/auth/login';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();

        if (isDebug) {
            console.log("RESPOSTA DO DEBUG:", data);
            errorMessageDiv.textContent = `Debug: ${data.step} -> ${data.status}. Veja o console (F12).`;
            return;
        }

        if (!response.ok) {
            throw new Error(data.message || 'Falha no login.');
        }

        localStorage.setItem('arca-law-token', data.token);
        window.location.href = '/';
    } catch (error) {
        console.error("ERRO COMPLETO:", error);
        errorMessageDiv.textContent = error.message;
    }
}

loginForm.addEventListener('submit', (event) => performLogin(event, false));
debugBtn.addEventListener('click', (event) => performLogin(event, true));