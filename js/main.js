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
            const linkPath = link.getAttribute('href');
            link.classList.remove('active');
            if (linkPath === path) {
                link.classList.add('active');
            } else if (path.startsWith('/processo/') && linkPath === '/processos') {
                link.classList.add('active');
            }
        });
    };

    const routes = {
        '/': () => initDashboardPage(contentArea, router),
        '/processos': () => initProcessosPage(contentArea, router),
        '/contatos': () => initContatosPage(contentArea, router),
        '/agenda': () => initAgendaPage(contentArea, router),
        '/billing': () => initBillingPage(contentArea, router),
        '/processo/:id': ({ data }) => initDetalheProcessoPage(contentArea, data.id, router),
    };

    router.on(routes).notFound(() => {
        contentArea.innerHTML = '<h2>404 - Página não encontrada</h2>';
        setActiveLink(null);
    }).resolve();

    router.hooks({
        before: (done, match) => {
            setActiveLink(match.route.path);
            done();
        }
    });
};

document.addEventListener('DOMContentLoaded', main);