import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { FaHistory } from "react-icons/fa";
import CardsGrupos from "../components/CardsGrupos";
import ModalHistorialGrupos from "../components/ModalHistorialGrupos";

// Importar imágenes de módulos
import img1 from "../assets/images/modulo1.jpeg";
import img2 from "../assets/images/modulo2.jpeg";
import img3 from "../assets/images/modulo3.jpeg";
import img4 from "../assets/images/modulo4.jpeg";
import img5 from "../assets/images/modulo5.jpeg";
import img6 from "../assets/images/modulo6.jpeg";
import img7 from "../assets/images/modulo7.jpeg";
import img8 from "../assets/images/modulo8.jpeg";
import img9 from "../assets/images/modulo9.jpeg";
import img10 from "../assets/images/modulo10.jpeg";

// Mapeo de imágenes para cada módulo
const moduleImages = {
  1: img1,
  2: img2,
  3: img3,
  4: img4,
  5: img5,
  6: img6,
  7: img7,
  8: img8,
  9: img9,
  10: img10,
};

// Estilos de los componentes
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #2c2f33;
  color: #e0e0e0;
  padding: 25px;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.5);
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 8px 0;
  border: 1px solid #444b52;
  border-radius: 5px;
  background-color: #36393f;
  color: white;
`;

const CloseButton = styled.button`
  background-color: #ff5252;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 15px;
`;

const CardWrapper = styled.div`
  display: grid;
  grid-template-columns: 300px;
  grid-template-rows: 210px 210px 80px;
  grid-template-areas: "image" "text" "stats";
  border-radius: 18px;

  /* Degradado en tonos azules */
  background: linear-gradient(180deg, #237bad, #1e6b91, #185a7a);
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.5);
  text-align: center;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  /* Efecto interactivo */
  &:hover {
    transform: scale(1.05);
    box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.7);
  }
`;

const CardStatWrapper = styled.div`
  grid-area: stats;
  display: flex;
  justify-content: space-around;

  /* Degradado en tonos azules */
  background: linear-gradient(90deg, #1e6b91, #237bad, #2a85a3);
  padding: 10px;
  border-top: 2px solid rgba(255, 255, 255, 0.1);

  /* Transición en los botones */
  button {
    background: transparent;
    border: none;
    color: #ffffff;
    font-weight: bold;
    transition: transform 0.3s ease, color 0.3s ease;

    &:hover {
      transform: scale(1.1); /* Aumenta ligeramente el tamaño */
      color: #d1e8ff; /* Un azul más claro para resaltar */
    }
  }
`;

const CardTextWrapper = styled.div`
  grid-area: text;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;

  /* Estilo del texto */
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: bold;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6); /* Sombras para mayor legibilidad */
`;

const CardImage = styled.div`
  grid-area: image;
  background-image: url(${(props) => props.$background});
  background-size: cover;
  background-position: center;
  height: 200px;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
`;

const Modulos = () => {
  const [modulos, setModulos] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showCardsModal, setShowCardsModal] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [moduloSeleccionado, setModuloSeleccionado] = useState(null);
  const [nombreGrupo, setNombreGrupo] = useState("");
  const [capacidadGrupo, setCapacidadGrupo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [claveGrupo, setClaveGrupo] = useState("");
  const [grupos, setGrupos] = useState([]);

  useEffect(() => {
    obtenerModulos();
  }, []);

  const obtenerModulos = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/modulos");
      setModulos(response.data);
    } catch (error) {
      console.error("Error al obtener los módulos", error);
    }
  };

  const crearGrupo = async () => {
    if (!nombreGrupo || !capacidadGrupo || !fechaInicio || !fechaFin || !claveGrupo) {
      alert("Completa todos los campos para crear un grupo");
      return;
    }

    try {
      await axios.post(
        `http://localhost:3001/api/modulos/${moduloSeleccionado}/crear-grupo`,
        {
          nombre_grupo: nombreGrupo,
          clave_grupo: claveGrupo,
          capacidad: capacidadGrupo,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        }
      );
      alert("Grupo creado exitosamente");
      setShowGroupModal(false);
    } catch (error) {
      console.error("Error al crear el grupo", error);
    }
  };

  const verGrupos = async (idModulo) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/modulos/${idModulo}/grupos`);
      setGrupos(response.data);
      setShowCardsModal(true);
    } catch (error) {
      console.error("Error al obtener los grupos", error);
    }
  };

  const verHistorial = (idModulo) => {
    setModuloSeleccionado(idModulo);
    setShowHistorialModal(true);
  };

  const getImagePath = (numero_modulo) => {
    const imagePath = moduleImages[numero_modulo] || "";
    return imagePath;
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", padding: "20px" }}>
      {modulos.map((modulo) => (
        <CardWrapper key={modulo.id_modulo}>
          <CardImage $background={getImagePath(modulo.numero_modulo)} />

          <CardTextWrapper>
            <h2>{modulo.nombre_modulo}</h2>
          </CardTextWrapper>

          <CardStatWrapper>
            <ActionButton onClick={() => {
              setModuloSeleccionado(modulo.id_modulo);
              setShowGroupModal(true);
            }}>
              Crear Grupo
            </ActionButton>
            <ActionButton onClick={() => verGrupos(modulo.id_modulo)}>
              Ver Grupos
            </ActionButton>
            <ActionButton onClick={() => verHistorial(modulo.id_modulo)}>
              <FaHistory /> Historial
            </ActionButton>
          </CardStatWrapper>
        </CardWrapper>
      ))}

      {showGroupModal && (
        <ModalOverlay>
          <ModalContent>
            <h2>Crear Grupo</h2>
            <Input
              type="text"
              placeholder="Nombre del Grupo"
              value={nombreGrupo}
              onChange={(e) => setNombreGrupo(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Clave del Grupo"
              value={claveGrupo}
              onChange={(e) => setClaveGrupo(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Capacidad del Grupo"
              value={capacidadGrupo}
              onChange={(e) => setCapacidadGrupo(e.target.value)}
            />
            <Input
              type="date"
              placeholder="Fecha de Inicio"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
            <Input
              type="date"
              placeholder="Fecha de Fin"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
            <ActionButton onClick={crearGrupo}>Crear</ActionButton>
            <CloseButton onClick={() => setShowGroupModal(false)}>Cerrar</CloseButton>
          </ModalContent>
        </ModalOverlay>
      )}

      {showCardsModal && (
        <CardsGrupos
          grupos={grupos}
          onClose={() => setShowCardsModal(false)}
          onAssignStudent={(idGrupo) => setGrupoSeleccionado(idGrupo)}
        />
      )}

      {showHistorialModal && (
        <ModalHistorialGrupos
          idModulo={moduloSeleccionado}
          closeModal={() => setShowHistorialModal(false)}
        />
      )}
    </div>
  );
};

export default Modulos;
