import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { toast } from 'react-toastify'; // Asegúrate de tener instalado react-toastify

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 5px;
  max-width: 600px;
  width: 100%;
`;

const CloseButton = styled.button`
  background-color: #f44336;
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  border: 1px solid #ddd;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: ${(props) => (props.primary ? '#4caf50' : '#f44336')};
  color: white;
  border: none;
  cursor: pointer;
  margin-right: 10px;

  &:hover {
    opacity: 0.8;
  }
`;

const AsignarEstudiante = ({ idGrupo, idModulo, onClose }) => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState('');

  // Obtener estudiantes verificados para este módulo
  const obtenerEstudiantesVerificados = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/modulos/${idModulo}/estudiantes-verificados`
      );
      setEstudiantes(response.data);
    } catch (error) {
      console.error('Error al obtener estudiantes verificados', error);
      toast.error('Error al obtener estudiantes verificados'); // Notificación de error
    }
  };

  useEffect(() => {
    obtenerEstudiantesVerificados();
  }, [idModulo]);

  const asignarEstudiante = async () => {
    if (!estudianteSeleccionado) {
      toast.error('Selecciona un estudiante para asignar'); // Notificación de error
      return;
    }

    try {
      await axios.post(
        `http://localhost:3001/api/grupos/${idGrupo}/asignar-estudiante`,
        {
          id_estudiante: estudianteSeleccionado,
        }
      );
      toast.success('Estudiante Añadido Exitosamente'); // Notificación de éxito
      onClose();
    } catch (error) {
      console.error('Error al asignar estudiante', error);
      toast.error('No ha sido posible asignar a este estudiante'); // Notificación de error
    }
  };

  return (
    <Modal>
      <ModalContent>
        <h2>Asignar Estudiante al Grupo</h2>
        <Select
          value={estudianteSeleccionado}
          onChange={(e) => setEstudianteSeleccionado(e.target.value)}
        >
          <option value="">Seleccionar Estudiante</option>
          {estudiantes.map((estudiante) => (
            <option key={estudiante.id} value={estudiante.id}>
              {estudiante.nombre_completo}
            </option>
          ))}
        </Select>
        <div>
          <Button primary onClick={asignarEstudiante}>
            Asignar Estudiante
          </Button>
          <CloseButton onClick={onClose}>Cerrar</CloseButton>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default AsignarEstudiante;
