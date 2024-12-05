// CrearModulo.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

// Estilos del modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const ModalTitle = styled.h2`
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #218838;
  }
`;

const CloseButton = styled.button`
  padding: 10px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #c82333;
  }
`;

const CrearModulo = ({ onClose, fetchModulos }) => {
  const [nombreModulo, setNombreModulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [numeroModulo, setNumeroModulo] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [message, setMessage] = useState('');

  // Obtener la fecha actual en formato YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);

    // Verificar que la fecha de fin no sea anterior a la fecha de inicio
    if (fechaFinDate <= fechaInicioDate) {
      setMessage('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/modulos', {
        nombre_modulo: nombreModulo,
        descripcion,
        numero_modulo: numeroModulo,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      });
      setMessage(response.data.message);
      fetchModulos(); // Refrescar la lista de módulos
      onClose(); // Cerrar el modal después de guardar
    } catch (error) {
      setMessage('Error al crear módulo');
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalTitle>Crear Módulo</ModalTitle>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Nombre del Módulo"
            value={nombreModulo}
            onChange={(e) => setNombreModulo(e.target.value)}
            required
          />
          <Input
            type="text"
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />
          <Input
            type="number"
            placeholder="Número del Módulo"
            value={numeroModulo}
            onChange={(e) => setNumeroModulo(e.target.value)}
            required
          />
          <Input
            type="date"
            value={fechaInicio}
            min={getCurrentDate()} // No se permite seleccionar fechas anteriores a hoy
            onChange={(e) => setFechaInicio(e.target.value)}
            required
          />
          <Input
            type="date"
            value={fechaFin}
            min={fechaInicio || getCurrentDate()} // La fecha de fin no puede ser antes de la fecha de inicio
            onChange={(e) => setFechaFin(e.target.value)}
            required
          />
          <Button type="submit">Guardar</Button>
        </Form>
        {message && <p>{message}</p>}
        <CloseButton onClick={onClose}>Cerrar</CloseButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CrearModulo;
