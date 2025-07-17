import { api } from '../utils/api.js';
import { showToast } from '../utils/toast.js';

export function initContatosPage(container) {
    const template = `
        <div class="content-header">
            <h2>Meus Contatos</h2>
            <p>Adicione e gerencie seus contatos profissionais.</p>
        </div>
        <div class="form-container">
            <h3>Adicionar Novo Contato</h3>
            <form id="create-contact-form">
                <div class="form-group"><label for="contact-name">Nome Completo</label><input type="text" id="contact-name" required></div>
                <div class="form-group"><label for="contact-email">Email</label><input type="email" id="contact-email"></div>
                <div class="form-group"><label for="contact-phone">Telefone</label><input type="text" id="contact-phone"></div>
                <div class="form-group"><label for="contact-address">Endereço</label><input type="text" id="contact-address"></div>
                <button type="submit" class="btn-primary">Salvar Contato</button>
            </form>
        </div>
        <div class="content-body">
            <h3>Lista de Contatos</h3>
            <div id="contact-list" class="contacts-grid"><div class="spinner-container"><div class="spinner"></div></div></div>
        </div>
    `;
    container.innerHTML = template;

    const contactListContainer = container.querySelector('#contact-list');
    const createContactForm = container.querySelector('#create-contact-form');

    async function fetchContacts() {
        contactListContainer.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';
        try {
            const contacts = await api.get('/contacts');
            displayContacts(contacts);
        } catch (error) {
            showToast(`Erro ao carregar contatos: ${error.message}`, 'error');
            contactListContainer.innerHTML = '<p>Não foi possível carregar contatos.</p>';
        }
    }

    function displayContacts(contacts) {
        if (!contacts || contacts.length === 0) {
            contactListContainer.innerHTML = '<p>Nenhum contato encontrado.</p>';
            return;
        }
        contactListContainer.innerHTML = contacts.map(contact => `
            <div class="contact-card" data-id="${contact.id}">
                <h3>${contact.name}</h3>
                <p>${contact.email || '<i>Sem email</i>'}</p>
                <p>${contact.phone || '<i>Sem telefone</i>'}</p>
            </div>
        `).join('');
    }

    createContactForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = container.querySelector('#contact-name').value;
        const email = container.querySelector('#contact-email').value;
        const phone = container.querySelector('#contact-phone').value;
        const address = container.querySelector('#contact-address').value;
        try {
            await api.post('/contacts', { name, email, phone, address });
            showToast('Contato criado com sucesso!');
            createContactForm.reset();
            fetchContacts();
        } catch (error) {
            showToast(`Erro: ${error.message}`, 'error');
        }
    });

    fetchContacts();
}