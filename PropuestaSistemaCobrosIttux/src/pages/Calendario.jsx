import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import axios from 'axios';
import CrearEventoModal from '../components/CrearEventoModal';
import EditarEliminarEventoModal from '../components/EditarEliminarEventoModal';
import '../styles/Calendary.css';

// Nuevo componente para la ventana emergente de confirmación
const ConfirmationPopup = ({ startDate, endDate, onConfirm, onCancel }) => (
  <div className="confirmation-overlay">
    <div className="confirmation-content">
      <p>Fechas seleccionadas desde <strong>{startDate}</strong> hasta <strong>{endDate}</strong></p>
      <button onClick={onConfirm} className="btn-confirm">Confirmar</button>
      <button onClick={onCancel} className="btn-cancel">Cancelar</button>
    </div>
  </div>
);

const Calendario = () => {
  const [events, setEvents] = useState([]);
  const [sidebarEvents, setSidebarEvents] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalStartDate, setModalStartDate] = useState(null);
  const [modalEndDate, setModalEndDate] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/eventos');
      const formattedEvents = response.data.map(event => ({
        id: event.id,
        title: event.eventTitle,
        start: event.eventStartDate || null,
        end: event.eventEndDate || null,
        eventType: event.eventType,
        allDay: true, // Asegura que el evento es de "todo el día"
        className: `fc-event ${event.eventType.replace(/\W+/g, '-').toLowerCase()}`,
      }));
      setEvents(formattedEvents);

      // Filtrar eventos sin fechas para mostrarlos en el sidebar
      const sidebarFilteredEvents = formattedEvents.filter(event => !event.start && !event.end);
      setSidebarEvents(sidebarFilteredEvents);
    } catch (error) {
      console.error('Error al obtener eventos:', error);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const draggableEl = document.getElementById('external-events');
    if (draggableEl) {
      new Draggable(draggableEl, {
        itemSelector: '.fc-event',
        eventData: (eventEl) => ({
          title: eventEl.getAttribute('title'),
          id: eventEl.getAttribute('data-id'),
          className: eventEl.getAttribute('class'),
          eventType: eventEl.getAttribute('data-type'),
          allDay: true, // Asegura que el evento es de "todo el día"
        }),
      });
    }
  }, []);

  const handleEventReceive = async (info) => {
    try {
      const updatedEvent = {
        eventTitle: info.event.title,
        eventType: info.event.extendedProps.eventType,
        eventStartDate: info.event.startStr,
        eventEndDate: info.event.endStr || info.event.startStr,
      };

      await axios.put(`http://localhost:3001/api/eventos/${info.event.id}`, updatedEvent);
      
      setSidebarEvents(sidebarEvents.filter(event => event.id !== info.event.id));
      fetchEvents();
    } catch (error) {
      console.error('Error al recibir evento:', error);
    }
  };

  const handleEventDropOrResize = async (info) => {
    try {
      const { title, extendedProps, startStr, endStr } = info.event;
      
      await axios.put(`http://localhost:3001/api/eventos/${info.event.id}`, {
        eventTitle: title,
        eventType: extendedProps.eventType,
        eventStartDate: startStr,
        eventEndDate: endStr || startStr,
      });
      fetchEvents();
    } catch (error) {
      console.error('Error al actualizar el evento (mover o redimensionar):', error);
    }
  };

  const handleEventSelect = (selectionInfo) => {
    setModalStartDate(selectionInfo.startStr);
    setModalEndDate(selectionInfo.endStr);
    setShowConfirmation(true);
  };

  const confirmSelection = () => {
    setIsCreateModalOpen(true);
    setShowConfirmation(false);
  };

  const cancelSelection = () => {
    setModalStartDate(null);
    setModalEndDate(null);
    setShowConfirmation(false);
  };

  const handleEventCreated = async (newEvent) => {
    try {
      const response = await axios.post('http://localhost:3001/api/eventos', {
        eventTitle: newEvent.title,
        eventType: newEvent.eventType,
        eventStartDate: modalStartDate,
        eventEndDate: modalEndDate,
      });

      setEvents((prevEvents) => [
        ...prevEvents,
        {
          id: response.data.id,
          title: response.data.eventTitle,
          start: modalStartDate,
          end: modalEndDate,
          allDay: true, // Asegura que el evento es de "todo el día"
          className: `fc-event ${response.data.eventType.replace(/\W+/g, '-').toLowerCase()}`,
        },
      ]);
    } catch (error) {
      console.error('Error al crear evento en el calendario:', error);
    }

    setIsCreateModalOpen(false);
    setModalStartDate(null);
    setModalEndDate(null);
    fetchEvents();
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr || clickInfo.event.startStr,
      eventType: clickInfo.event.extendedProps.eventType, // Añadir eventType
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="calendar-page">
      <aside className="main-sidebar"></aside>

      <div className="calendar-container">
        <div className="sidebar-calendar">
          <button onClick={() => setIsCreateModalOpen(true)} className="btn-crear-evento">
            Crear Nuevo Evento
          </button>
          <div id="external-events">
            <h4>Tipos de Eventos</h4>
            {sidebarEvents.map((event) => (
              <div
                key={event.id}
                className={`fc-event ${event.className}`}
                title={event.title}
                data-id={event.id}
                data-type={event.eventType}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>

        <div className="main-calendar">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            editable={true}
            droppable={true}
            selectable={true}
            eventReceive={handleEventReceive}
            eventDrop={handleEventDropOrResize}
            eventResize={handleEventDropOrResize}
            select={handleEventSelect}
            eventClick={handleEventClick}
            allDaySlot={true} // Asegura que el slot de "todo el día" esté visible
            slotDuration="00:30:00"
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              hour12: false,
            }}
          />
        </div>

        {showConfirmation && (
          <ConfirmationPopup
            startDate={modalStartDate}
            endDate={modalEndDate}
            onConfirm={confirmSelection}
            onCancel={cancelSelection}
          />
        )}

        <CrearEventoModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onEventCreated={handleEventCreated}
          startDate={modalStartDate}
          endDate={modalEndDate}
        />

        {selectedEvent && (
          <EditarEliminarEventoModal
            isOpen={isEditModalOpen}
            event={selectedEvent}
            onClose={() => setIsEditModalOpen(false)}
            onEventUpdated={fetchEvents}
          />
        )}
      </div>
    </div>
  );
};

export default Calendario;
