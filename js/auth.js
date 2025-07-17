function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

export function checkAuth() {
    const token = localStorage.getItem('arca-law-token');
    if (!token) {
        window.location.href = '/auth/login.html';
        throw new Error("Token não encontrado, redirecionando para login.");
    }
    return token;
}

export function getUserName() {
    const token = localStorage.getItem('arca-law-token');
    if (token) {
        const payload = parseJwt(token);
        return payload?.user?.name || 'Usuário';
    }
    return 'Usuário';
}

export function handleLogout() {
    localStorage.removeItem('arca-law-token');
    window.location.href = '/auth/login.html';
}