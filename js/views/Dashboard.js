import { api } from '../utils/api.js';

export function initDashboardPage(container, router) {
    const template = `
        <div class="content-header">
            <h2>Área de Trabalho</h2>
            <p>Um resumo da sua atividade recente.</p>
        </div>
        <div class="dashboard-grid">
            <div class="dashboard-card" id="processos-widget">
                <h3><i class="fa-solid fa-gavel"></i> Processos Recentes</h3>
                <div class="widget-content"><div class="spinner-container"><div class="spinner"></div></div></div>
            </div>
            <div class="dashboard-card" id="financeiro-widget">
                <h3><i class="fa-solid fa-dollar-sign"></i> Resumo Financeiro</h3>
                <div class="widget-content"><div class="spinner-container"><div class="spinner"></div></div></div>
            </div>
            <div class="dashboard-card" id="agenda-widget">
                <h3><i class="fa-solid fa-calendar-days"></i> Próximos Compromissos</h3>
                <div class="widget-content"><p>Funcionalidade em breve...</p></div>
            </div>
        </div>
    `;
    container.innerHTML = template;

    const processosWidgetContent = container.querySelector('#processos-widget .widget-content');
    const financeiroWidgetContent = container.querySelector('#financeiro-widget .widget-content');

    loadProcessosWidget(processosWidgetContent);
    loadFinanceiroWidget(financeiroWidgetContent);
}

async function loadProcessosWidget(widgetContent) {
    try {
        const processos = await api.get('/processos?limit=5');
        if (!processos || processos.length === 0) {
            widgetContent.innerHTML = '<p>Nenhum processo recente.</p>';
            return;
        }
        
        widgetContent.innerHTML = `
            <table class="data-table compact">
                <tbody>
                    ${processos.map(p => `
                        <tr>
                            <td><a href="/processo/${p.id}" data-navigo>${p.numero}</a></td>
                            <td style="text-align: right;">${p.status}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <a href="/processos" class="view-all-link" data-navigo>Ver todos &rarr;</a>
        `;
    } catch (e) {
        widgetContent.innerHTML = '<p style="color:red;">Não foi possível carregar os processos.</p>';
    }
}

async function loadFinanceiroWidget(widgetContent) {
    try {
        const summary = await api.get('/financials/summary');
        const saldo = parseFloat(summary.total_receitas) - parseFloat(summary.total_despesas);
        widgetContent.innerHTML = `
            <ul>
                <li><span>Receitas Pagas</span> <span class="value receita">R$ ${parseFloat(summary.total_receitas).toFixed(2)}</span></li>
                <li><span>Despesas Pagas</span> <span class="value despesa">R$ ${parseFloat(summary.total_despesas).toFixed(2)}</span></li>
                <li><span>A Receber</span> <span class="value">R$ ${parseFloat(summary.a_receber).toFixed(2)}</span></li>
                <li class="summary-total"><span>Saldo (PAGO)</span> <span class="value saldo">R$ ${saldo.toFixed(2)}</span></li>
            </ul>
        `;
    } catch (e) {
        widgetContent.innerHTML = '<p style="color:red;">Não foi possível carregar o resumo.</p>';
    }
}