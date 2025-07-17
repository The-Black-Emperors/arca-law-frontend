import { checkAuth, handleLogout, getUserName } from './auth.js';
import { initDashboardPage } from './views/Dashboard.js';
import { initProcessosPage } from './views/Processos.js';
import { initContatosPage } from './views/Contatos.js';
import { initDetalheProcessoPage } from './views/DetalheProcesso.js';
import { initAgendaPage } from './views/Agenda.js';
import { initBillingPage } from './views/Billing.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        checkAuth();

        const contentArea = document.getElementById('content-area');
        const userNameSpan = document.getElementById('user-name');
        const logoutBtn = document.getElementById('logout-btn');
        const router = new Navigo("/", { hash: false });

        userNameSpan.textContent = getUserName();
        logoutBtn.addEventListener('click', handleLogout);

        const handleNavigoLink = (event) => {
            const anchor = event.target.closest('a[data-navigo]');
            if (anchor) {
                event.preventDefault();
                router.navigate(anchor.getAttribute('href'));
            }
        };

        document.querySelector('.sidebar-nav').addEventListener('click', handleNavigoLink);
        contentArea.addEventListener('click', handleNavigoLink);

        router
            .on('/', (match) => {
                setActiveLink('/');
                initDashboardPage(container);
            })
            .on('/processos', (match) => {
                setActiveLink('/processos');
                initProcessosPage(container, router);
            })
            .on('/contatos', (match) => {
                setActiveLink('/contatos');
                initContatosPage(container);
            })
            .on('/agenda', (match) => {
                setActiveLink('/agenda');
                initAgendaPage(container);
            })
            .on('/billing', (match) => {
                setActiveLink('/billing');
                initBillingPage(container);
            })
            .on('/processo/:id', ({ data }) => {
                setActiveLink('/processos');
                initDetalheProcessoPage(container, data.id);
            })
            .notFound(() => {
                contentArea.innerHTML = '<h2>Página não encontrada</h2>';
            })
            .resolve();

    } catch(e) {
        console.error(e.message);
    }
});

function setActiveLink(path) {
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === path || (path.startsWith('/processo') && linkPath === '/processos')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}