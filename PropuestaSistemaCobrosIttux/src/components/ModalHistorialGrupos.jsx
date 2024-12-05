import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { FaUserGraduate } from "react-icons/fa"; // Icono de estudiantes

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
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #2c2f33; // Fondo oscuro para el modal
  color: #e0e0e0;
  padding: 25px;
  border-radius: 8px;
  max-width: 800px;
  width: 100%;
  overflow-y: auto;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.5);
`;

const CloseButton = styled.button`
  background-color: #ff5252; // Rojo para el botón de cierre
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #36393f; // Fondo oscuro para la tabla
`;

const Th = styled.th`
  padding: 12px;
  background-color: #5865f2; // Encabezado en azul oscuro
  color: white;
  font-weight: bold;
`;

const Td = styled.td`
  padding: 10px;
  border: 1px solid #40444b; // Borde gris oscuro
  color: #c1c1c1;
`;

const Button = styled.button`
  background-color: #2196f3; // Azul para botón de acción
  color: white;
  padding: 8px 16px;
  margin-top: 5px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  display: flex;
  align-items: center;

  &:hover {
    opacity: 0.9;
  }

  svg {
    margin-right: 8px;
  }
`;

const StudentList = styled.ul`
  list-style: none;
  padding-left: 0;
  margin-top: 10px;
  background-color: #2c2f33; // Fondo oscuro para la lista de estudiantes
  padding: 10px;
  border-radius: 5px;

  li {
    padding: 5px 0;
    border-bottom: 1px solid #40444b;
    color: #c1c1c1;
  }

  li:last-child {
    border-bottom: none;
  }
`;

const ModalHistorialGrupos = ({ idModulo, closeModal }) => {
  const [historialGrupos, setHistorialGrupos] = useState([]);
  const [estudiantesGrupos, setEstudiantesGrupos] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);

  useEffect(() => {
    obtenerHistorialGrupos(idModulo);
  }, [idModulo]);

  const obtenerHistorialGrupos = async (idModulo) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/modulos/${idModulo}/historial-grupos`);
      setHistorialGrupos(response.data.grupos);
      setEstudiantesGrupos(response.data.estudiantes);
    } catch (error) {
      console.error("Error al obtener el historial de grupos", error);
    }
  };

  const obtenerEstudiantesPorGrupo = (idGrupo) => {
    return estudiantesGrupos.filter(est => est.id_grupo === idGrupo);
  };

  const handleMostrarEstudiantes = (idGrupo) => {
    if (grupoSeleccionado === idGrupo) {
      setGrupoSeleccionado(null);
    } else {
      setGrupoSeleccionado(idGrupo);
    }
  };

  return (
    <Modal>
      <ModalContent>
        <h2>Historial de Grupos del Módulo</h2>
        {historialGrupos.length === 0 ? (
          <p>No hay grupos archivados para este módulo.</p>
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>Clave del Grupo</Th>
                  <Th>Nombre del Grupo</Th>
                  <Th>Fecha de Inicio</Th>
                  <Th>Fecha de Fin</Th>
                  <Th>Estado</Th>
                  <Th>Estudiantes</Th>
                </tr>
              </thead>
              <tbody>
                {historialGrupos.map((grupo) => (
                  <tr key={grupo.id_grupo}>
                    <Td>{grupo.clave_grupo}</Td>
                    <Td>{grupo.nombre_grupo}</Td>
                    <Td>{new Date(grupo.fecha_inicio).toLocaleDateString()}</Td>
                    <Td>{new Date(grupo.fecha_fin).toLocaleDateString()}</Td>
                    <Td>{grupo.estado}</Td>
                    <Td>
                      <Button onClick={() => handleMostrarEstudiantes(grupo.id_grupo)}>
                        <FaUserGraduate />
                        {grupoSeleccionado === grupo.id_grupo ? "Ocultar Estudiantes" : "Ver Estudiantes"}
                      </Button>
                      {grupoSeleccionado === grupo.id_grupo && (
                        <StudentList>
                          {obtenerEstudiantesPorGrupo(grupo.id_grupo).length > 0 ? (
                            obtenerEstudiantesPorGrupo(grupo.id_grupo).map((estudiante) => (
                              <li key={estudiante.id_estudiante}>{estudiante.nombre_completo}</li>
                            ))
                          ) : (
                            <li>No hay estudiantes en este grupo</li>
                          )}
                        </StudentList>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
        <CloseButton onClick={closeModal}>Cerrar</CloseButton>
      </ModalContent>
    </Modal>
  );
};

export default ModalHistorialGrupos;
