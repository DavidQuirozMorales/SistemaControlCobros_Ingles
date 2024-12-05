import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";

// Styled Components
const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
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
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #5865f2;
  border-radius: 5px;
  background-color: #1e1e2f;
  color: #e0e0e0;

  &::placeholder {
    color: #a0a0a0;
  }
`;

const Button = styled.button`
  padding: 10px 15px;
  background-color: ${(props) => (props.variant === "cancel" ? "#ff5252" : "#4caf50")};
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  margin-right: ${(props) => (props.variant === "cancel" ? "0" : "10px")};

  &:hover {
    opacity: 0.9;
  }
`;

const FormLabel = styled.label`
  font-weight: bold;
  color: #a0a0a0;
`;

const FormTitle = styled.h2`
  color: #ffffff;
  margin-bottom: 15px;
  text-align: center;
`;

const AñadirEstudiante = ({ closeModal, actualizarEstudiante }) => {
  const [formData, setFormData] = useState({
    nombre_completo: "",
    numero_control: "",
    carrera: "",
    email: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3001/api/estudiantes", formData);
      alert(response.data.message);
      actualizarEstudiante(); // Refrescar la lista de estudiantes en el componente principal
      closeModal(); // Cerrar el modal después de añadir
    } catch (error) {
      console.error("Error al añadir estudiante", error);
      alert("Error al añadir estudiante");
    }
  };

  return (
    <ModalContainer>
      <ModalContent>
        <FormTitle>Añadir Estudiante</FormTitle>
        <form onSubmit={handleSubmit}>
          <FormLabel>Nombre Completo:</FormLabel>
          <Input
            type="text"
            name="nombre_completo"
            value={formData.nombre_completo}
            onChange={handleChange}
            required
          />
          <FormLabel>Número de Control:</FormLabel>
          <Input
            type="text"
            name="numero_control"
            value={formData.numero_control}
            onChange={handleChange}
            required
          />
          <FormLabel>Carrera:</FormLabel>
          <Input
            type="text"
            name="carrera"
            value={formData.carrera}
            onChange={handleChange}
            required
          />
          <FormLabel>Email:</FormLabel>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
            <Button type="submit">Añadir Estudiante</Button>
            <Button type="button" variant="cancel" onClick={closeModal}>
              Cancelar
            </Button>
          </div>
        </form>
      </ModalContent>
    </ModalContainer>
  );
};

export default AñadirEstudiante;
