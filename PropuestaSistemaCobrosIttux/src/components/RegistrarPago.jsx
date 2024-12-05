import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";

const Modal = styled.div`
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
  background: #1e1e2f;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  color: #e0e0e0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h2`
  color: #ffffff;
  text-align: center;
  margin-bottom: 20px;
`;

const Input = styled.input`
  margin-bottom: 15px;
  padding: 10px;
  width: 100%;
  border-radius: 5px;
  border: 1px solid #5865f2;
  background-color: #2c2f33;
  color: #e0e0e0;
`;

const Select = styled.select`
  margin-bottom: 15px;
  padding: 10px;
  width: 100%;
  border-radius: 5px;
  border: 1px solid #5865f2;
  background-color: #2c2f33;
  color: #e0e0e0;
`;

const Button = styled.button`
  padding: 10px;
  margin-right: 10px;
  background-color: ${(props) => (props.type === "cancel" ? "#f44336" : "#32CD32")};
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 48%;
  font-weight: bold;

  &:hover {
    opacity: 0.9;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
`;

const RegistrarPago = ({ onClose }) => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [idEstudiante, setIdEstudiante] = useState("");
  const [monto, setMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [fechaPago, setFechaPago] = useState("");
  const [idModulo, setIdModulo] = useState("1");
  const [referenciaBancaria, setReferenciaBancaria] = useState("");

  useEffect(() => {
    obtenerEstudiantes();
  }, []);

  const obtenerEstudiantes = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/estudiantes");
      setEstudiantes(response.data.filter((est) => est.estatus === "activo"));
    } catch (error) {
      console.error("Error al obtener los estudiantes", error);
    }
  };

  const registrarPago = async () => {
    if (!idEstudiante || !monto || !fechaPago || !idModulo || !referenciaBancaria) {
      alert("Completa todos los campos");
      return;
    }

    try {
      await axios.post("http://localhost:3001/api/pagos", {
        id_estudiante: idEstudiante,
        id_modulo: idModulo,
        monto,
        fecha_pago: fechaPago,
        metodo_pago: metodoPago,
        referencia_bancaria: referenciaBancaria,
        estatus: "no verificado",
      });
      alert("Pago registrado exitosamente");
      onClose();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert("Ya existe un pago para este módulo correspondiente.");
      } else {
        alert("Error al registrar el pago.");
      }
      console.error("Error al registrar el pago", error);
    }
  };

  return (
    <Modal>
      <ModalContent>
        <Title>Registrar Pago</Title>
        <Select value={idEstudiante} onChange={(e) => setIdEstudiante(e.target.value)}>
          <option value="">Seleccionar Estudiante</option>
          {estudiantes.map((est) => (
            <option key={est.id} value={est.id}>
              {est.nombre_completo} (Control: {est.numero_control})
            </option>
          ))}
        </Select>
        <Input
          type="number"
          placeholder="Monto"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
        />
        <Input
          type="date"
          placeholder="Fecha de Pago"
          value={fechaPago}
          onChange={(e) => setFechaPago(e.target.value)}
        />
        <Select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="transferencia">Transferencia</option>
        </Select>
        <Select value={idModulo} onChange={(e) => setIdModulo(e.target.value)}>
          <option value="1">Módulo 1</option>
          <option value="2">Módulo 2</option>
          <option value="3">Módulo 3</option>
          <option value="4">Módulo 4</option>
          <option value="5">Módulo 5</option>
          <option value="6">Módulo 6</option>
          <option value="7">Módulo 7</option>
          <option value="8">Módulo 8</option>
          <option value="9">Módulo 9</option>
          <option value="10">Módulo 10</option>
        </Select>
        <Input
          type="text"
          placeholder="Referencia Bancaria"
          value={referenciaBancaria}
          onChange={(e) => setReferenciaBancaria(e.target.value)}
        />
        <ButtonContainer>
          <Button onClick={registrarPago}>Registrar Pago</Button>
          <Button type="cancel" onClick={onClose}>Cancelar</Button>
        </ButtonContainer>
      </ModalContent>
    </Modal>
  );
};

export default RegistrarPago;
