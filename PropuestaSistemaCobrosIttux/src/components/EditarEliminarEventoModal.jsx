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

const Input = styled.input`
  width: 100%;
  margin-bottom: 10px;
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const Select = styled.select`
  width: 100%;
  margin-bottom: 10px;
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const Button = styled.button`
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  margin-right: ${(props) => (props.cancel ? '0' : '10px')};
  background-color: ${(props) => (props.cancel ? 'red' : props.edit ? 'blue' : 'green')};

  &:disabled {
    background-color: #888;
    cursor: not-allowed;
  }
`;

const EditarEliminarEventoModal = ({ isOpen, event, onClose, onEventUpdated }) => {
  const [eventTitle, setEventTitle] = useState(event.title || '');
  const [eventType, setEventType] = useState(event.eventType || ''); // Inicializar con el eventType existente
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && event) {
      setEventTitle(event.title || '');
      setEventType(event.eventType || ''); // Asegurar que se mantenga el eventType actual
      setError('');
    }
  }, [isOpen, event]);

  const handleUpdateEvent = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Asegurarse de enviar el eventType original si no se selecciona uno nuevo
      const updatedEventType = eventType || event.eventType;

      // Validar fechas y convertir a strings si son objetos Date
      const startDate = event.start ? (event.start instanceof Date ? event.start.toISOString().split('T')[0] : event.start) : null;
      const endDate = event.end ? (event.end instanceof Date ? event.end.toISOString().split('T')[0] : event.end) : null;

      await axios.put(`http://localhost:3001/api/eventos/${event.id}`, {
        eventTitle,
        eventType: updatedEventType, // Usar el eventType original si no se ha cambiado
        eventStartDate: startDate,
        eventEndDate: endDate,
      });
      onEventUpdated(); // Refresca el calendario
      onClose(); // Cierra el modal después de actualizar
    } catch (error) {
      console.error('Error al actualizar el evento:', error);
      setError('Error al actualizar el evento. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    setIsLoading(true);
    setError('');

    try {
      await axios.delete(`http://localhost:3001/api/eventos/${event.id}`);
      onEventUpdated(); // Refresca el calendario después de eliminar
      onClose(); // Cierra el modal después de eliminar
    } catch (error) {
      console.error('Error al eliminar el evento:', error);
      setError('Error al eliminar el evento. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <h3>Editar Evento</h3>
        {error && <p style={{ color: '#ff6666', fontSize: '14px', marginBottom: '10px' }}>{error}</p>}
        <Input
          type="text"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          placeholder="Editar nombre del evento"
        />
        <Select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
        >
          <option value="">-- Mantener tipo actual --</option>
          <option value="Recordatorio de Pagos">Recordatorio de Pagos</option>
          <option value="Cierre de Inscripciones">Cierre de Inscripciones</option>
          <option value="Inicio de Cursos/Modulos">Inicio de Cursos y Modulos</option>
          <option value="Reporte Generado">Reporte Generado</option>
          <option value="Fecha Limite de Pago">Fecha Limite de Pago</option>
          <option value="Auditoria General">Auditoria General</option>
        </Select>
        <Button onClick={handleUpdateEvent} edit disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Actualizar'}
        </Button>
        <Button onClick={handleDeleteEvent} cancel disabled={isLoading}>
          {isLoading ? 'Eliminando...' : 'Eliminar'}
        </Button>
        <Button onClick={onClose} cancel disabled={isLoading}>
          Cancelar
        </Button>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditarEliminarEventoModal;
