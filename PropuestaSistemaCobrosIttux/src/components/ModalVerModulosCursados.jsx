import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";

// Styled Components
const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
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
  width: 650px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.5);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
`;

const Th = styled.th`
  padding: 10px;
  background-color: #5865f2;
  color: white;
  text-align: left;
  font-weight: bold;
`;

const Td = styled.td`
  padding: 10px;
  border: 1px solid #444b52;
  text-align: left;
`;

const Button = styled.button`
  padding: 10px 15px;
  background-color: #ff5252;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    opacity: 0.9;
  }
`;

const ModalTitle = styled.h2`
  color: #ffffff;
  margin-bottom: 15px;
  text-align: center;
`;

const ModalVerModulosCursados = ({ idEstudiante, closeModal }) => {
  const [modulosCursados, setModulosCursados] = useState([]);

  useEffect(() => {
    obtenerModulosCursados();
  }, []);

  const obtenerModulosCursados = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/estudiantes/${idEstudiante}/modulos-cursados`);
      setModulosCursados(response.data);
    } catch (error) {
      console.error("Error al obtener los módulos cursados", error);
    }
  };

  // Formatear la fecha de forma legible
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ModalContainer>
      <ModalContent>
        <ModalTitle>Módulos Cursados</ModalTitle>
        <Table>
          <thead>
            <tr>
              <Th>Módulo</Th>
              <Th>Grupo</Th>
              <Th>Clave del Grupo</Th>
              <Th>Estado</Th>
              <Th>Fecha de Inicio</Th>
              <Th>Fecha Final</Th>
              <Th>Monto Pagado</Th>
            </tr>
          </thead>
          <tbody>
            {modulosCursados.length > 0 ? (
              modulosCursados.map((modulo, index) => (
                <tr key={index}>
                  <Td>{modulo.nombre_modulo}</Td>
                  <Td>{modulo.nombre_grupo}</Td>
                  <Td>{modulo.clave_grupo}</Td>
                  <Td>{modulo.estado}</Td>
                  <Td>{formatearFecha(modulo.fecha_inicio)}</Td>
                  <Td>{formatearFecha(modulo.fecha_fin)}</Td>
                  <Td>{modulo.monto_pagado} $</Td>
                </tr>
              ))
            ) : (
              <tr>
                <Td colSpan="7" style={{ textAlign: "center" }}>No hay módulos cursados disponibles</Td>
              </tr>
            )}
          </tbody>
        </Table>
        <Button onClick={closeModal}>Cerrar</Button>
      </ModalContent>
    </ModalContainer>
  );
};

export default ModalVerModulosCursados;
