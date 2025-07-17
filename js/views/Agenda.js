import { api } from '../utils/api.js';
import { showToast } from '../utils/toast.js';

let calendar;
const modal = document.getElementById('event-modal');
const backdrop = document.getElementById('modal-backdrop');

function openModal(data) {
    modal.innerHTML = `
        <h3>${data.id ? 'Editar Evento' : 'Novo Evento'}</h3>
        <form id="event-form">
            <input type="hidden" id="event-id" value="${data.id || ''}">
            <div class="form-group">
                <label for="event-title">Título</label>
                <input type="text" id="event-title" value="${data.title || ''}" required>
            </div>
            <div class="form-group">
                <label for="event-description">Descrição</label>
                <textarea id="event-description">${data.description || ''}</textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="event-start">Início</label>
                    <input type="datetime-local" id="event-start" value="${data.startStr ? data.startStr.slice(0,16) : ''}" required>
                </div>
                <div class="form-group">
                    <label for="event-end">Fim</label>
                    <input type="datetime-local" id="event-end" value="${data.endStr ? data.endStr.slice(0,16) : ''}" required>
                </div>
            </div>
            <div class="modal-actions">
                ${data.id ? `<button type="button" id="delete-event-btn" class="btn-logout" style="background-color: var(--danger-color);">Excluir</button>` : '<div></div>'}
                <button type="submit" class="btn-primary">Salvar</button>
            </div>
        </form>
    `;
    modal.classList.add('active');
    backdrop.classList.add('active');

    document.getElementById('event-form').addEventListener('submit', handleFormSubmit);
    if(data.id) {
        document.getElementById('delete-event-btn').addEventListener('click', handleDelete);
    }
}

function closeModal() {
    modal.classList.remove('active');
    backdrop.classList.remove('active');
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const eventData = {
        id: document.getElementById('event-id').value,
        title: document.getElementById('event-title').value,
        description: document.getElementById('event-description').value,
        start: document.getElementById('event-start').value,
        end: document.getElementById('event-end').value,
        allDay: false
    };

    try {
        if (eventData.id) {
            await api.put(`/events/${eventData.id}`, eventData);
            showToast('Evento atualizado com sucesso!');
        } else {
            await api.post('/events', eventData);
            showToast('Evento criado com sucesso!');
        }
        calendar.refetchEvents();
        closeModal();
    } catch (error) {
        showToast(`Erro ao salvar evento: ${error.message}`, 'error');
    }
}

async function handleDelete() {
    const eventId = document.getElementById('event-id').value;
    if (confirm('Tem certeza que deseja excluir este evento?')) {
        try {
            await api.delete(`/events/${eventId}`);
            showToast('Evento excluído com sucesso!');
            calendar.refetchEvents();
            closeModal();
        } catch (error) {
            showToast(`Erro ao excluir evento: ${error.message}`, 'error');
        }
    }
}

export function initAgendaPage(container) {
    const template = `
        <div class="content-header">
            <h2>Agenda</h2>
            <p>Gerencie seus compromissos, prazos e audiências.</p>
        </div>
        <div id="calendar-container" class="data-table-container"></div>
    `;
    container.innerHTML = template;

    const calendarEl = document.getElementById('calendar-container');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: (fetchInfo, successCallback, failureCallback) => {
            api.get(`/events?start=${fetchInfo.startStr}&end=${fetchInfo.endStr}`)
                .then(data => successCallback(data))
                .catch(error => failureCallback(error));
        },
        locale: 'pt-br',
        buttonText: { today: 'Hoje', month: 'Mês', week: 'Semana', day: 'Dia' },
        selectable: true,
        editable: true,
        select: (info) => openModal(info),
        eventClick: (info) => {
            const eventData = {
                id: info.event.id,
                title: info.event.title,
                description: info.event.extendedProps.description,
                startStr: info.event.start.toISOString(),
                endStr: info.event.end ? info.event.end.toISOString() : info.event.start.toISOString()
            };
            openModal(eventData);
        },
        eventDrop: async (info) => {
            const eventData = {
                id: info.event.id,
                title: info.event.title,
                description: info.event.extendedProps.description,
                start: info.event.start.toISOString(),
                end: info.event.end ? info.event.end.toISOString() : info.event.start.toISOString(),
                allDay: info.event.allDay
            };
            try {
                await api.put(`/events/${eventData.id}`, eventData);
                showToast('Evento atualizado!');
            } catch(error) {
                showToast(`Erro ao mover evento: ${error.message}`, 'error');
                info.revert();
            }
        }
    });
    calendar.render();

    backdrop.addEventListener('click', closeModal);
}