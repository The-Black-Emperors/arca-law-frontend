const API_URL = 'http://localhost:3000/api/processos';
const processListContainer = document.getElementById('process-list');
const createProcessForm = document.getElementById('create-process-form');
const logoutBtn = document.getElementById('logout-btn');
const token = localStorage.getItem('arca-law-token');

function checkAuth() {
    if (!token) {
        window.location.href = '/public/auth/login.html';
    }
}

function handleLogout() {
    localStorage.removeItem('arca-law-token');
    window.location.href = '/public/auth/login.html';
}

async function handleCreateFormSubmit(event) {
    event.preventDefault();
    const numeroInput = document.getElementById('numero-input');
    const autorInput = document.getElementById('autor-input');
    const newProcessData = { numero: numeroInput.value, autor: autorInput.value };
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(newProcessData),
        });
        if (!response.ok) throw new Error('Falha ao criar processo.');
        numeroInput.value = '';
        autorInput.value = '';
        fetchProcesses();
    } catch (error) {
        console.error('Erro ao enviar formulário:', error);
        alert('Não foi possível salvar o processo.');
    }
}

async function handleDeleteClick(processId) {
    if (!confirm('Tem certeza?')) return;
    try {
        const response = await fetch(`${API_URL}/${processId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao deletar processo.');
        fetchProcesses();
    } catch (error) {
        console.error('Erro ao deletar processo:', error);
        alert('Não foi possível deletar o processo.');
    }
}

async function handleUpdateSubmit(formElement) {
    const processId = formElement.dataset.id;
    const numero = formElement.querySelector('input[name="numero"]').value;
    const autor = formElement.querySelector('input[name="autor"]').value;
    const updatedData = { numero, autor };
    try {
        const response = await fetch(`${API_URL}/${processId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(updatedData),
        });
        if (!response.ok) throw new Error('Falha ao atualizar processo.');
        fetchProcesses();
    } catch (error) {
        console.error('Erro ao atualizar processo:', error);
        alert('Não foi possível atualizar o processo.');
    }
}

async function fetchProcesses() {
    if (!processListContainer) return;
    try {
        const response = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 401) {
            handleLogout();
            return;
        }
        if (!response.ok) throw new Error(`Erro de rede: ${response.statusText}`);
        const processes = await response.json();
        displayProcesses(processes);
    } catch (error) {
        console.error('Falha ao buscar processos:', error);
        processListContainer.innerHTML = `<p style="color: red;">Erro ao carregar processos.</p>`;
    }
}

function displayProcesses(processes) {
    processListContainer.innerHTML = '';
    if (processes.length === 0) {
        processListContainer.innerHTML = '<p>Nenhum processo encontrado.</p>';
        return;
    }
    const list = document.createElement('ul');
    list.className = 'space-y-4';
    processes.forEach(process => {
        const listItem = document.createElement('li');
        listItem.className = 'bg-white p-4 rounded-lg shadow process-item';
        listItem.innerHTML = `
            <div class="process-info" data-numero="${process.numero}" data-autor="${process.autor}">
                <h3 class="font-bold">${process.numero}</h3>
                <p>Autor: ${process.autor}</p>
                <p>Status: ${process.status}</p>
            </div>
            <div class="process-actions">
                <button class="edit-btn" data-id="${process.id}">Editar</button>
                <button class="delete-btn" data-id="${process.id}">Excluir</button>
            </div>
        `;
        list.appendChild(listItem);
    });
    processListContainer.appendChild(list);
}

function handleEditClick(editButton) {
    const listItem = editButton.closest('.process-item');
    const processId = editButton.dataset.id;
    const { numero, autor } = listItem.querySelector('.process-info').dataset;
    listItem.innerHTML = `<form class="edit-form" data-id="${processId}"><div class="edit-form-group"><input type="text" name="numero" value="${numero}" required></div><div class="edit-form-group"><input type="text" name="autor" value="${autor}" required></div><div class="edit-form-actions"><button type="submit" class="btn-primary">Salvar</button><button type="button" class="cancel-btn">Cancelar</button></div></form>`;
}

processListContainer.addEventListener('click', function(event) {
    const target = event.target;
    if (target.classList.contains('delete-btn')) handleDeleteClick(target.dataset.id);
    if (target.classList.contains('edit-btn')) handleEditClick(target);
    if (target.classList.contains('cancel-btn')) fetchProcesses();
});
processListContainer.addEventListener('submit', function(event) {
    event.preventDefault();
    if (event.target.classList.contains('edit-form')) handleUpdateSubmit(event.target);
});
createProcessForm.addEventListener('submit', handleCreateFormSubmit);

logoutBtn.addEventListener('click', handleLogout);

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    fetchProcesses();
});