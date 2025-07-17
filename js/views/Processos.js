import { api } from '../utils/api.js';
import { showToast } from '../utils/toast.js';

export function initProcessosPage(container, router) {
    const template = `
        <div class="content-header">
            <h2>Meus Processos</h2>
            <p>Adicione e gerencie todos os seus casos.</p>
        </div>
        <div class="form-container">
            <h3>Adicionar Novo Processo</h3>
            <form id="create-process-form" class="form-row" style="align-items: flex-end;">
                <div class="form-group" style="flex-grow: 1;"><input type="text" id="numero-input" placeholder="Número do Processo" required></div>
                <div class="form-group" style="flex-grow: 1;"><input type="text" id="autor-input" placeholder="Nome do Autor/Cliente" required></div>
                <button type="submit" class="btn-primary">Adicionar Processo</button>
            </form>
        </div>
        <div class="data-table-container">
            <div id="process-list"><div class="spinner-container"><div class="spinner"></div></div></div>
        </div>
    `;
    container.innerHTML = template;

    const processListContainer = container.querySelector('#process-list');
    const createProcessForm = container.querySelector('#create-process-form');

    async function fetchProcesses() {
        processListContainer.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';
        try {
            const processes = await api.get('/processos');
            displayProcesses(processes);
        } catch (error) {
            showToast(`Erro ao carregar processos: ${error.message}`, 'error');
        }
    }

    function displayProcesses(processes) {
        if (!processes || processes.length === 0) {
            processListContainer.innerHTML = '<p>Nenhum processo encontrado.</p>';
            return;
        }
        processListContainer.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Número do Processo</th>
                        <th>Autor</th>
                        <th>Status</th>
                        <th class="actions">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${processes.map(process => `
                        <tr data-id="${process.id}" data-numero="${process.numero}" data-autor="${process.autor}">
                            <td><a href="/processo/${process.id}" data-navigo>${process.numero}</a></td>
                            <td>${process.autor}</td>
                            <td>${process.status}</td>
                            <td class="actions">
                                <button class="btn-action edit-btn" title="Editar"><i class="fa-solid fa-pencil"></i></button>
                                <button class="btn-action delete delete-btn" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    createProcessForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const numero = container.querySelector('#numero-input').value;
        const autor = container.querySelector('#autor-input').value;
        try {
            await api.post('/processos', { numero, autor });
            showToast('Processo criado com sucesso!');
            createProcessForm.reset();
            fetchProcesses();
        } catch (error) {
            showToast(`Erro: ${error.message}`, 'error');
        }
    });

    processListContainer.addEventListener('click', async (event) => {
        const button = event.target.closest('button');
        if (!button) return;

        const tr = button.closest('tr');
        const processId = tr.dataset.id;

        if (button.classList.contains('delete-btn')) {
            if (confirm('Tem certeza que deseja excluir este processo?')) {
                try {
                    await api.delete(`/processos/${processId}`);
                    showToast('Processo deletado com sucesso!');
                    fetchProcesses();
                } catch (error) {
                    showToast(`Erro: ${error.message}`, 'error');
                }
            }
        }

        if (button.classList.contains('edit-btn')) {
            const { numero, autor } = tr.dataset;
            tr.innerHTML = `
                <td colspan="4">
                    <form class="edit-form" data-id="${processId}" style="display: flex; gap: 10px; align-items: center;">
                        <input type="text" name="numero" value="${numero}" class="form-control" style="flex-grow: 1;" required>
                        <input type="text" name="autor" value="${autor}" class="form-control" style="flex-grow: 1;" required>
                        <button type="submit" class="btn-primary">Salvar</button>
                        <button type="button" class="cancel-btn btn-logout">Cancelar</button>
                    </form>
                </td>
            `;
        }

        if (button.classList.contains('cancel-btn')) {
            fetchProcesses();
        }
    });

    processListContainer.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (event.target.classList.contains('edit-form')) {
            const form = event.target;
            const processId = form.dataset.id;
            const numero = form.querySelector('input[name="numero"]').value;
            const autor = form.querySelector('input[name="autor"]').value;
            try {
                await api.put(`/processos/${processId}`, { numero, autor });
                showToast('Processo atualizado com sucesso!');
                fetchProcesses();
            } catch (error) {
                showToast(`Erro: ${error.message}`, 'error');
            }
        }
    });

    fetchProcesses();
}