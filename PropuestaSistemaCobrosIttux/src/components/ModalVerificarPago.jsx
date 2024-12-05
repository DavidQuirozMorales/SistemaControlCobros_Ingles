import React from "react";
import styled from "styled-components";
import axios from "axios";

// Styled-components
const ModalContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 400px;
  z-index: 1000;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const Button = styled.button`
  background-color: #28a745;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;

  &:hover {
    background-color: #218838;
  }
`;

const ModalVerificarPago = ({ pago, onClose, onPagoVerificado }) => {
  const verificarPago = async () => {
    try {
      await axios.put(`http://localhost:3001/api/pagos/verificar/${pago.id}`, {
        id_estudiante: pago.id_estudiante,
        id_modulo: pago.id_modulo,
      });
      alert("Pago verificado exitosamente");
      onPagoVerificado();
    } catch (error) {
      console.error("Error al verificar pago:", error);
      alert("Error al verificar el pago.");
    }
  };

  return (
    <>
      <Overlay onClick={onClose} />
      <ModalContainer>
        <h3>Detalles del Pago</h3>
        <p>Estudiante ID: {pago.id_estudiante}</p>
        <p>Módulo ID: {pago.id_modulo}</p>
        <p>Monto: {pago.monto}</p>
        <p>Método de Pago: {pago.metodo_pago}</p>
        <p>Descripción: {pago.descripcion_pago || "Sin descripción"}</p>

        <Button onClick={verificarPago}>Confirmar y Verificar Pago</Button>
      </ModalContainer>
    </>
  );
};

export default ModalVerificarPago;
