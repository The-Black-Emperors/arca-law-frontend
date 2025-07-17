import { handleLogout } from '../auth.js';

const API_BASE_URL = 'https://arca-law-backend-the-black-emperors-projects.vercel.app/api';

async function request(endpoint, options = {}) {
    const token = localStorage.getItem('arca-law-token');
    if (!token) {
        handleLogout();
        throw new Error('Token não encontrado');
    }

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (response.status === 401) {
            handleLogout();
            throw new Error('Sessão expirada.');
        }

        const responseBody = await response.text();
        const data = responseBody ? JSON.parse(responseBody) : {};

        if (!response.ok) {
            throw new Error(data.message || 'Erro na resposta da API');
        }

        return data;
    } catch (error) {
        console.error('Erro na chamada da API:', error);
        throw error;
    }
}

export const api = {
    get: (endpoint) => request(endpoint),
    post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};