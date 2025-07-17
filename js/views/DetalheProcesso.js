import { api } from '../utils/api.js';
import { showToast } from '../utils/toast.js';

export function initDetalheProcessoPage(container, id) {
    let currentProcess = {};

    function renderLayout() {
        const template = `
            <div class="content-header">
                <a href="/processos" class="back-link" data-navigo>&larr; Voltar para a Lista de Processos</a>
                <h2 id="processo-numero-header">Detalhes do Processo</h2>
            </div>
            <div class="details-card" id="detalhe-processo-content"><div class="spinner-container"><div class="spinner"></div></div></div>
            <div class="financial-section">
                <h3>Painel Financeiro do Processo</h3>
                <div id="financial-summary-container" class="financial-summary"></div>
                <div class="form-container">
                    <h4>Adicionar Lançamento</h4>
                    <form id="financial-entry-form" class="financial-entry-form">
                        <div class="form-group"><input type="text" id="entry-description" placeholder="Descrição (Ex: Honorários iniciais)" required></div>
                        <div class="form-row">
                            <div class="form-group"><input type="number" step="0.01" id="entry-value" placeholder="Valor (R$)" required></div>
                            <div class="form-group"><select id="entry-type" required><option value="" disabled selected>Tipo</option><option value="RECEITA">Receita</option><option value="DESPESA">Despesa</option></select></div>
                        </div>
                        <div class="form-row">
                            <div class="form-group"><select id="entry-status" required><option value="" disabled selected>Status</option><option value="PAGO">Pago</option><option value="PENDENTE">Pendente</option></select></div>
                            <div class="form-group"><input type="date" id="entry-due-date"></div>
                        </div>
                        <button type="submit" class="btn-primary">Adicionar Lançamento</button>
                    </form>
                </div>
                <h4>Histórico de Lançamentos</h4>
                <div id="financial-list-container"></div>
            </div>
        `;
        container.innerHTML = template;
    }

    function renderProcessoDetails() {
        container.querySelector('#processo-numero-header').textContent = `Processo: ${currentProcess.numero}`;
        const detalheContent = container.querySelector('#detalhe-processo-content');
        detalheContent.innerHTML = `
            <p><strong>Autor:</strong> ${currentProcess.autor}</p>
            <p><strong>Status do Processo:</strong> ${currentProcess.status}</p>
            <p><strong>Criado em:</strong> ${new Date(currentProcess.created_at).toLocaleString('pt-BR')}</p>
        `;
    }
    
    function renderFinancials(entries) {
        const listContainer = container.querySelector('#financial-list-container');
        const summaryContainer = container.querySelector('#financial-summary-container');
        let totalReceitas = 0, totalDespesas = 0, aReceber = 0;
        entries.forEach(entry => {
            const value = parseFloat(entry.value);
            if (entry.type === 'RECEITA') {
                if (entry.status === 'PAGO') totalReceitas += value;
                else aReceber += value;
            } else if (entry.type === 'DESPESA' && entry.status === 'PAGO') {
                totalDespesas += value;
            }
        });
        const saldo = totalReceitas - totalDespesas;

        summaryContainer.innerHTML = `
            <div class="summary-card"><h4 class="receita">Receitas Pagas</h4><p>R$ ${totalReceitas.toFixed(2)}</p></div>
            <div class="summary-card"><h4 class="despesa">Despesas Pagas</h4><p>R$ ${totalDespesas.toFixed(2)}</p></div>
            <div class="summary-card"><h4>A Receber</h4><p>R$ ${aReceber.toFixed(2)}</p></div>
            <div class="summary-card"><h4 class="saldo">Saldo</h4><p>R$ ${saldo.toFixed(2)}</p></div>
        `;

        if (entries.length === 0) {
            listContainer.innerHTML = '<p>Nenhum lançamento financeiro para este processo.</p>';
            return;
        }
        listContainer.innerHTML = `
            <ul class="financial-entry-list">
                ${entries.map(entry => `
                    <li class="entry-item">
                        <div>
                            <p class="description">${entry.description}</p>
                            <p class="date">Status: ${entry.status} | Venc.: ${entry.due_date ? new Date(entry.due_date).toLocaleDateString('pt-BR') : 'N/A'}</p>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <p class="value ${entry.type === 'RECEITA' ? 'receita' : 'despesa'}">
                                ${entry.type === 'RECEITA' ? '+' : '-'} R$ ${parseFloat(entry.value).toFixed(2)}
                            </p>
                            ${entry.type === 'RECEITA' && entry.status === 'PENDENTE' ? `<button class="btn-action generate-invoice-btn" data-entry-id="${entry.id}" title="Gerar Fatura para Cliente"><i class="fa-solid fa-file-invoice-dollar"></i></button>` : ''}
                        </div>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    async function fetchAllData() {
        container.querySelector('#detalhe-processo-content').innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';
        try {
            currentProcess = await api.get(`/processos/${id}`);
            renderProcessoDetails();
            const financialEntries = await api.get(`/financials/process/${id}`);
            renderFinancials(financialEntries);
        } catch (error) {
            showToast(`Erro ao carregar dados: ${error.message}`, 'error');
        }
    }

    function attachEventListeners() {
        const financialForm = container.querySelector('#financial-entry-form');
        financialForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = {
                description: container.querySelector('#entry-description').value,
                value: container.querySelector('#entry-value').value,
                type: container.querySelector('#entry-type').value,
                status: container.querySelector('#entry-status').value,
                due_date: container.querySelector('#entry-due-date').value || null
            };
            try {
                await api.post(`/financials/process/${id}`, formData);
                showToast('Lançamento adicionado com sucesso!');
                financialForm.reset();
                fetchAllData();
            } catch (error) {
                showToast(`Erro ao salvar lançamento: ${error.message}`, 'error');
            }
        });

        container.addEventListener('click', async (event) => {
            const button = event.target.closest('.generate-invoice-btn');
            if (button) {
                const entryId = button.dataset.entryId;
                const clientEmail = prompt("Digite o email do cliente para enviar a fatura:");
                if (clientEmail) {
                    try {
                        button.disabled = true;
                        button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                        const result = await api.post(`/financials/entry/${entryId}/create-invoice`, { clientEmail });
                        showToast(result.message);
                        window.open(result.invoiceUrl, '_blank');
                    } catch (error) {
                        showToast(`Erro ao gerar fatura: ${error.message}`, 'error');
                    } finally {
                        button.disabled = false;
                        button.innerHTML = '<i class="fa-solid fa-file-invoice-dollar"></i>';
                    }
                }
            }
        });
    }

    renderLayout();
    fetchAllData();
    attachEventListeners();
}