import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #1e1e2f;
  padding: 20px;
  width: 300px;
  border-radius: 8px;
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 1010;
`;

const CrearEventoModal = ({ isOpen, onClose, onEventCreated, startDate, endDate }) => {
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEventTitle('');
      setEventType('');
      setError('');
    }
  }, [isOpen]);

  const handleSaveEvent = async () => {
    if (!eventTitle || !eventType) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setIsLoading(true);

    try {
      // Llama a la función `onEventCreated` con las fechas seleccionadas
      onEventCreated({
        title: eventTitle,
        eventType: eventType,
        eventStartDate: startDate, // Pasa las fechas seleccionadas del calendario
        eventEndDate: endDate,
      });
      onClose();
    } catch (error) {
      console.error('Error al crear evento:', error);
      setError('Error al crear el evento. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <h3>Crear Nuevo Evento</h3>
        {error && <p style={{ color: '#ff6666', fontSize: '14px', marginBottom: '10px' }}>{error}</p>}
        <input
          type="text"
          placeholder="Ingrese el nombre del evento"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        />
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
        >
          <option value="">-- Seleccionar --</option>
          <option value="Recordatorio de Pagos">Recordatorio de Pagos</option>
          <option value="Cierre de Inscripciones">Cierre de Inscripciones</option>
          <option value="Inicio de Cursos/Modulos">Inicio de Cursos y Modulos</option>
          <option value="Reporte Generado">Reporte Generado</option>
          <option value="Fecha Limite de Pago">Fecha Limite de Pago</option>
          <option value="Auditoria General">Auditoria General</option>
        </select>
        <button
          onClick={handleSaveEvent}
          disabled={isLoading}
          style={{
            backgroundColor: 'green',
            color: 'white',
            marginRight: '10px',
            padding: '5px 10px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isLoading ? 'Guardando...' : 'Guardar Evento'}
        </button>
        <button
          onClick={onClose}
          style={{
            backgroundColor: 'red',
            color: 'white',
            padding: '5px 10px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cancelar
        </button>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CrearEventoModal;
