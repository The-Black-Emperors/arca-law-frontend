import { checkAuth, handleLogout, getUserName } from './auth.js';
import { initDashboardPage } from './views/Dashboard.js';
import { initProcessosPage } from './views/Processos.js';
import { initContatosPage } from './views/Contatos.js';
import { initDetalheProcessoPage } from './views/DetalheProcesso.js';
import { initAgendaPage } from './views/Agenda.js';
import { initBillingPage } from './views/Billing.js';

const main = () => {
    try {
        checkAuth();
    } catch (e) {
        console.error(e.message);
        return;
    }

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
    
    document.querySelector('.app-container').addEventListener('click', handleNavigoLink);
    
    const setActiveLink = (path) => {
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            link.classList.remove('active');
            const linkPath = link.getAttribute('href');
            if (linkPath === path || (path.startsWith('/processo') && linkPath === '/processos')) {
                link.classList.add('active');
            }
        });
    };

    router
        .on('/', () => {
            setActiveLink('/');
            initDashboardPage(contentArea, router);
        })
        .on('/processos', () => {
            setActiveLink('/processos');
            initProcessosPage(contentArea, router);
        })
        .on('/contatos', () => {
            setActiveLink('/contatos');
            initContatosPage(contentArea);
        })
        .on('/agenda', () => {
            setActiveLink('/agenda');
            initAgendaPage(contentArea);
        })
        .on('/billing', () => {
            setActiveLink('/billing');
            initBillingPage(contentArea);
        })
        .on('/processo/:id', ({ data }) => {
            setActiveLink('/processos');
            initDetalheProcessoPage(contentArea, data.id, router);
        })
        .notFound(() => {
            contentArea.innerHTML = '<h2>404 - Página não encontrada</h2>';
            setActiveLink(null);
        })
        .resolve();
};

document.addEventListener('DOMContentLoaded', main);