import { api } from '../utils/api.js';
import { showToast } from '../utils/toast.js';

export function initDetalheProcessoPage(container, id) {
    const backdrop = document.getElementById('modal-backdrop');
    const invoiceModal = document.getElementById('invoice-modal');

    function renderLayout() {
        const template = `
            <div class="content-header"><a href="/processos" class="back-link" data-navigo>&larr; Voltar</a><h2 id="processo-numero-header">Detalhes do Processo</h2></div>
            <div class="details-card" id="detalhe-processo-content"><div class="spinner-container"><div class="spinner"></div></div></div>
            <div class="financial-section">
                <h3>Painel Financeiro do Processo</h3>
                <div id="financial-summary-container" class="financial-summary"></div>
                <div class="form-container">
                    <h4>Adicionar Lançamento</h4>
                    <form id="financial-entry-form" class="financial-entry-form">
                        <div class="form-group"><input type="text" id="entry-description" placeholder="Descrição (Ex: Honorários iniciais)" required></div>
                        <div class="form-row"><div class="form-group"><input type="number" step="0.01" id="entry-value" placeholder="Valor (R$)" required></div><div class="form-group"><select id="entry-type" required><option value="" disabled selected>Tipo</option><option value="RECEITA">Receita</option><option value="DESPESA">Despesa</option></select></div></div>
                        <div class="form-row"><div class="form-group"><select id="entry-status" required><option value="" disabled selected>Status</option><option value="PAGO">Pago</option><option value="PENDENTE">Pendente</option></select></div><div class="form-group"><input type="date" id="entry-due-date" title="Data de Vencimento/Pagamento"></div></div>
                        <button type="submit" class="btn-primary">Adicionar Lançamento</button>
                    </form>
                </div>
                <h4>Histórico de Lançamentos</h4>
                <div id="financial-list-container"></div>
            </div>
        `;
        container.innerHTML = template;
    }

    function openInvoiceModal(entryId, entryDescription) {
        invoiceModal.innerHTML = `
            <h3>Gerar Fatura</h3>
            <p>Gerar e enviar uma fatura para <strong>${entryDescription}</strong>?</p>
            <form id="invoice-form" data-entry-id="${entryId}">
                <div class="form-group">
                    <label for="client-email">Email do Cliente</label>
                    <input type="email" id="client-email" required placeholder="email@cliente.com">
                </div>
                <div class="modal-actions" style="justify-content: flex-end;">
                    <button type="button" class="btn-logout" id="cancel-invoice">Cancelar</button>
                    <button type="submit" class="btn-primary">Enviar Fatura</button>
                </div>
            </form>
        `;
        invoiceModal.classList.add('active');
        backdrop.classList.add('active');
    }

    function closeInvoiceModal() {
        invoiceModal.classList.remove('active');
        backdrop.classList.remove('active');
    }

    function renderFinancials(entries) {
        const listContainer = container.querySelector('#financial-list-container');
        const summaryContainer = container.querySelector('#financial-summary-container');
        let totalReceitas = 0, totalDespesas = 0, aReceber = 0;
        entries.forEach(entry => {
            const value = parseFloat(entry.value);
            if (entry.type === 'RECEITA') {
                if (entry.status === 'PAGO') totalReceitas += value;
                else if (entry.status === 'PENDENTE') aReceber += value;
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
            listContainer.innerHTML = '<p>Nenhum lançamento.</p>';
            return;
        }
        listContainer.innerHTML = `
            <ul class="financial-entry-list">
                ${entries.map(entry => `
                    <li class="entry-item">
                        <div>
                            <p class="description">${entry.description}</p>
                            <p class="date">Status: ${entry.status}</p>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <p class="value ${entry.type === 'RECEITA' ? 'receita' : 'despesa'}">${entry.type === 'RECEITA' ? '+' : '-'} R$ ${parseFloat(entry.value).toFixed(2)}</p>
                            ${entry.type === 'RECEITA' && entry.status === 'PENDENTE' ? `<button class="btn-action generate-invoice-btn" data-entry-id="${entry.id}" data-entry-description="${entry.description}" title="Gerar Fatura"><i class="fa-solid fa-file-invoice-dollar"></i></button>` : ''}
                        </div>
                    </li>
                `).join('')}
            </ul>
        `;
    }
    
    async function fetchAllData() {
        try {
            const [processo, financialEntries] = await Promise.all([
                api.get(`/processos/${id}`),
                api.get(`/financials/process/${id}`)
            ]);
            container.querySelector('#detalhe-processo-content').innerHTML = `<p><strong>Autor:</strong> ${processo.autor}</p><p><strong>Status:</strong> ${processo.status}</p>`;
            container.querySelector('#processo-numero-header').textContent = `Processo: ${processo.numero}`;
            renderFinancials(financialEntries);
        } catch (error) {
            showToast(`Erro ao carregar dados: ${error.message}`, 'error');
        }
    }

    function attachEventListeners() {
        container.querySelector('#financial-entry-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const formData = {
                description: form.querySelector('#entry-description').value,
                value: form.querySelector('#entry-value').value,
                type: form.querySelector('#entry-type').value,
                status: form.querySelector('#entry-status').value,
                due_date: form.querySelector('#entry-due-date').value || null
            };
            try {
                await api.post(`/financials/process/${id}`, formData);
                showToast('Lançamento adicionado!');
                form.reset();
                fetchAllData();
            } catch (error) {
                showToast(`Erro: ${error.message}`, 'error');
            }
        });

        container.addEventListener('click', (event) => {
            const button = event.target.closest('.generate-invoice-btn');
            if (button) {
                openInvoiceModal(button.dataset.entryId, button.dataset.entryDescription);
            }
        });

        backdrop.addEventListener('click', closeInvoiceModal);
        invoiceModal.addEventListener('click', (event) => {
            if (event.target.id === 'cancel-invoice') closeInvoiceModal();
        });

        invoiceModal.addEventListener('submit', async (event) => {
            if (event.target.id === 'invoice-form') {
                event.preventDefault();
                const form = event.target;
                const entryId = form.dataset.entryId;
                const clientEmail = form.querySelector('#client-email').value;
                const submitButton = form.querySelector('button[type="submit"]');
                submitButton.disabled = true;
                submitButton.textContent = 'Enviando...';
                try {
                    const result = await api.post(`/financials/entry/${entryId}/create-invoice`, { clientEmail });
                    showToast(result.message);
                    if(result.invoiceUrl) window.open(result.invoiceUrl, '_blank');
                    closeInvoiceModal();
                    fetchAllData();
                } catch (error) {
                    showToast(`Erro: ${error.message}`, 'error');
                    submitButton.disabled = false;
                    submitButton.textContent = 'Enviar Fatura';
                }
            }
        });
    }

    renderLayout();
    fetchAllData();
    attachEventListeners();
}