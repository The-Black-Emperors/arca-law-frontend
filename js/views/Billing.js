import { api } from '../utils/api.js';
import { showToast } from '../utils/toast.js';

export function initBillingPage(container) {
    const monthlyPriceId = "price_1RfFVzQkT9sgchaq5pohgITn";
    const yearlyPriceId = "price_1RfFZuQkT9sgchaqoBuBLtci";
    const publishableKey = "pk_test_51RfFLLQkT9sgchaqrD365f47SrHRTY5CQcgDVqnGfFi0t2LXwQukNv1qlcYAImXO6BMI2stmHwqVoruCRZmhconD00I5vnGUop"; 

    if (!publishableKey || publishableKey.includes("SUBSTITUA")) {
        container.innerHTML = `<p style="color:red; text-align: center; padding: 20px;">ERRO DE CONFIGURAÇÃO: A chave publicável do Stripe não foi definida no frontend.</p>`;
        return;
    }

    const template = `
        <div class="content-header">
            <h2>Planos e Assinatura</h2>
            <p>Escolha o plano que melhor se adapta às suas necessidades.</p>
        </div>
        <div id="plans-container" style="display: flex; gap: 20px; justify-content: center; padding: 20px;">
            <div class="plan-card">
                <h2>Mensal</h2>
                <p class="price">R$ 49,90<span>/mês</span></p>
                <button class="btn-primary" data-price-id="${monthlyPriceId}">Assinar Plano Mensal</button>
            </div>
            <div class="plan-card">
                <h2>Anual</h2>
                <p class="price">R$ 499,00<span>/ano</span></p>
                <button class="btn-primary" data-price-id="${yearlyPriceId}">Assinar Plano Anual</button>
            </div>
        </div>
    `;
    container.innerHTML = template;
    
    const stripe = Stripe(publishableKey);
    const token = localStorage.getItem('arca-law-token');

    container.querySelectorAll('.plan-card button').forEach(button => {
        button.addEventListener('click', async (event) => {
            const priceId = event.target.dataset.priceId;
            button.disabled = true;
            button.textContent = 'Aguarde...';
            try {
                const session = await api.post('/subscriptions/create-checkout-session', { priceId });
                await stripe.redirectToCheckout({ sessionId: session.id });
            } catch (error) {
                showToast(`Erro: ${error.message}`, 'error');
                button.disabled = false;
                button.textContent = 'Assinar Plano';
            }
        });
    });
}