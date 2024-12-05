import React, { useState } from "react";
import styled from "styled-components";
import AsignarEstudiante from "./AsignarEstudiante";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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
  border-radius: 10px;
  width: 90%;
  max-width: 1000px;
  max-height: 90%;
  overflow-y: auto;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.5);
`;

const CloseButton = styled.button`
  background-color: #ff5252; // Rojo para el botón de cierre
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
  margin-top: 10px;
  border-radius: 5px;

  &:hover {
    opacity: 0.8;
  }
`;

const Card = styled.div`
  background-color: #36393f; // Fondo oscuro para cada tarjeta
  border: 1px solid #444b52;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 15px;
  color: #c1c1c1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
`;

const Button = styled.button`
  background-color: ${(props) => 
    props.primary ? "#5865f2" : props.secondary ? "#f28c28" : "#2196f3"}; // Azul y tonos llamativos para botones de acción
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  flex: 1;
  min-width: 120px;
  margin-top: 10px;
  font-weight: bold;

  &:hover {
    opacity: 0.9;
  }
`;

const CardsGrupos = ({ grupos, onClose }) => {
  const [showAsignarEstudianteModal, setShowAsignarEstudianteModal] = useState(false);
  const [showEstudiantesModal, setShowEstudiantesModal] = useState(false);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [estudiantesGrupo, setEstudiantesGrupo] = useState([]);
  const [gruposLocal, setGruposLocal] = useState(grupos);

  const formatearFecha = (fecha) => {
    const opciones = { year: "numeric", month: "long", day: "numeric" };
    return new Date(fecha).toLocaleDateString("es-ES", opciones);
  };

  const showToast = (message, type = "success") => {
    if (type === "success") {
      toast.success(message, { autoClose: 3000 });
    } else if (type === "error") {
      toast.error(message, { autoClose: 3000 });
    }
  };

  const verEstudiantes = async (idGrupo) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/grupos/${idGrupo}/estudiantes`);
      setEstudiantesGrupo(response.data);
      setShowEstudiantesModal(true);
    } catch (error) {
      console.error('Error al obtener estudiantes del grupo', error);
      showToast('Error al obtener estudiantes del grupo', 'error');
    }
  };

  const iniciarGrupo = async (idGrupo) => {
    try {
      await axios.put(`http://localhost:3001/api/grupos/${idGrupo}/iniciar`);
      showToast('Módulo Iniciado con Éxito');
      setGruposLocal((prevGrupos) =>
        prevGrupos.map((grupo) =>
          grupo.id_grupo === idGrupo ? { ...grupo, estado: "En Curso" } : grupo
        )
      );
    } catch (error) {
      console.error('Error al iniciar grupo', error);
      if (error.response && error.response.data) {
        showToast(error.response.data.message, 'error');
      } else {
        showToast('Error al iniciar grupo', 'error');
      }
    }
  };
  

  const finalizarGrupo = async (idGrupo) => {
    try {
      await axios.put(`http://localhost:3001/api/grupos/${idGrupo}/finalizar`);
      showToast('Grupo Finalizado Exitosamente');
      setGruposLocal((prevGrupos) =>
        prevGrupos.map((grupo) =>
          grupo.id_grupo === idGrupo ? { ...grupo, estado: "Finalizado" } : grupo
        )
      );
    } catch (error) {
      console.error('Error al finalizar grupo', error);
      showToast('Error al finalizar grupo', 'error');
    }
  };

  const registrarEstudiantes = async (idGrupo) => {
    try {
      await axios.put(`http://localhost:3001/api/grupos/${idGrupo}/registrar-estudiantes`);
      showToast('Estudiantes Registrados Exitosamente');
    } catch (error) {
      console.error('Error al registrar estudiantes', error);
      showToast('Error al registrar estudiantes', 'error');
    }
  };

  const archivarGrupo = async (idGrupo) => {
    try {
      await axios.put(`http://localhost:3001/api/grupos/${idGrupo}/archivar`);
      showToast('Grupo archivado con éxito');
  
      // Actualizar la lista de grupos eliminando el grupo archivado
      setGruposLocal((prevGrupos) =>
        prevGrupos.filter((grupo) => grupo.id_grupo !== idGrupo)
      );
    } catch (error) {
      console.error('Error al archivar grupo:', error);
      if (error.response && error.response.data) {
        showToast(error.response.data.error, 'error');
      } else {
        showToast('Error al archivar grupo', 'error');
      }
    }
  };
  
  

  const añadirEstudiante = async (idGrupo) => {
    try {
      await axios.post(`http://localhost:3001/api/grupos/${idGrupo}/asignar-estudiante`, { id_estudiante: 1 });
      showToast('Estudiante Añadido Exitosamente');
    } catch (error) {
      console.error('No ha sido posible asignar a este estudiante', error);
      showToast('No ha sido posible asignar a este estudiante', 'error');
    }
  };

  return (
    <>
      <Modal>
        <ModalContent>
          <h2>Grupos del Módulo</h2>
          {gruposLocal.length === 0 ? (
            <p>No hay grupos disponibles para este módulo.</p>
          ) : (
            gruposLocal.map((grupo) => (
              <Card key={grupo.id_grupo}>
                <h3>{grupo.nombre_grupo}</h3>
                <p>Clave: {grupo.clave_grupo}</p>
                <p>Capacidad: {grupo.max_estudiantes}</p>
                <p>Fecha de inicio: {formatearFecha(grupo.fecha_inicio)}</p>
                <p>Fecha de fin: {formatearFecha(grupo.fecha_fin)}</p>
                <p>Estado: {grupo.estado}</p>

                <ButtonContainer>
                  {grupo.estado === "Abierto" && (
                    <>
                      <Button secondary onClick={() => iniciarGrupo(grupo.id_grupo)}>Iniciar Módulo</Button>
                      <Button onClick={() => {
                        setGrupoSeleccionado(grupo.id_grupo);
                        setShowAsignarEstudianteModal(true);
                      }}>
                        Añadir Estudiante
                      </Button>
                    </>
                  )}

                  {grupo.estado === "En Curso" && (
                    <>
                      <Button primary onClick={() => finalizarGrupo(grupo.id_grupo)}>Finalizar Módulo</Button>
                    </>
                  )}

                  {grupo.estado === "Finalizado" && (
                    <>
                      <Button primary onClick={() => registrarEstudiantes(grupo.id_grupo)}>Registrar Estudiantes</Button>
                      <Button primary onClick={() => archivarGrupo(grupo.id_grupo)}>Archivar</Button>
                    </>
                  )}

                  <Button primary onClick={() => verEstudiantes(grupo.id_grupo)}>Ver Estudiantes</Button>
                </ButtonContainer>
              </Card>
            ))
          )}
          <CloseButton onClick={onClose}>Cerrar</CloseButton>

          {showAsignarEstudianteModal && (
            <AsignarEstudiante
              idGrupo={grupoSeleccionado}
              idModulo={grupos[0]?.id_modulo}
              onClose={() => setShowAsignarEstudianteModal(false)}
              onAsignar={() => añadirEstudiante(grupoSeleccionado)}
            />
          )}

          {showEstudiantesModal && (
            <Modal>
              <ModalContent>
                <h2>Estudiantes del Grupo</h2>
                {estudiantesGrupo.length === 0 ? (
                  <p>No hay estudiantes asignados a este grupo.</p>
                ) : (
                  estudiantesGrupo.map((estudiante) => (
                    <p key={estudiante.id}>{estudiante.nombre_completo}</p>
                  ))
                )}
                <CloseButton onClick={() => setShowEstudiantesModal(false)}>Cerrar</CloseButton>
              </ModalContent>
            </Modal>
          )}
        </ModalContent>
      </Modal>

      <ToastContainer />
    </>
  );
};

export default CardsGrupos;
