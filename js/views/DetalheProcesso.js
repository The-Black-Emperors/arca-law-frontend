import { api } from '../utils/api.js';
import { showToast } from '../utils/toast.js';

export function initDetalheProcessoPage(container, id) {
    let currentProcess = {};

    function renderLayout() {
        const template = `
            <div class="content-header">
                <a href="/processos" class="back-link" data-navigo>&larr; Voltar</a>
                <h2 id="processo-numero-header">Detalhes do Processo</h2>
            </div>
            <div class="details-grid">
                <div class="details-card" id="detalhe-processo-content"><div class="spinner-container"><div class="spinner"></div></div></div>
                <div class="details-card" id="monitoramento-card"></div>
            </div>
            <div class="financial-section">
                <h3>Painel Financeiro do Processo</h3>
                </div>
            <div class="update-section">
                <h3>Movimentações do Processo</h3>
                <div id="updates-list-container"><p>Nenhuma movimentação carregada.</p></div>
            </div>
        `;
        container.innerHTML = template;
    }

    function renderProcessoDetails() {
        container.querySelector('#processo-numero-header').textContent = `Processo: ${currentProcess.numero}`;
        container.querySelector('#detalhe-processo-content').innerHTML = `
            <p><strong>Autor:</strong> ${currentProcess.autor}</p>
            <p><strong>Status do Processo:</strong> ${currentProcess.status}</p>
            <p><strong>Criado em:</strong> ${new Date(currentProcess.created_at).toLocaleString('pt-BR')}</p>
        `;
        container.querySelector('#monitoramento-card').innerHTML = `
            <h3>Monitoramento</h3>
            <div class="form-group">
                <label for="process-url">Link para Consulta Pública</label>
                <input type="url" id="process-url" class="form-control" placeholder="Cole o link do processo no site do tribunal">
            </div>
            <button id="check-updates-btn" class="btn-primary">Verificar Movimentações</button>
            <p><small>Última verificação: ${currentProcess.last_check_at ? new Date(currentProcess.last_check_at).toLocaleString('pt-BR') : 'Nunca'}</small></p>
        `;
    }

    async function fetchAllData() {
        try {
            currentProcess = await api.get(`/processos/${id}`);
            renderProcessoDetails();
            attachEventListeners();
        } catch (error) {
            showToast(`Erro ao carregar dados: ${error.message}`, 'error');
        }
    }

    function attachEventListeners() {
        const checkUpdatesBtn = container.querySelector('#check-updates-btn');
        checkUpdatesBtn.addEventListener('click', async () => {
            const processUrlInput = container.querySelector('#process-url');
            if (!processUrlInput.value) {
                showToast('Por favor, insira o link para consulta.', 'error');
                return;
            }
            checkUpdatesBtn.disabled = true;
            checkUpdatesBtn.textContent = 'Verificando...';
            try {
                const result = await api.post(`/processos/${id}/check-updates`, { processUrl: processUrlInput.value });
                showToast(result.message);
                fetchAllData();
            } catch (error) {
                showToast(error.message || 'Falha na verificação.', 'error');
            } finally {
                checkUpdatesBtn.disabled = false;
                checkUpdatesBtn.textContent = 'Verificar Movimentações';
            }
        });
    }

    renderLayout();
    fetchAllData();
}