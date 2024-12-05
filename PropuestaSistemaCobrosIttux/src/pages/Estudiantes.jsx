import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import AñadirEstudiante from "../components/AñadirEstudiante";
import ModalEditarEstudiante from "../components/ModalEditarEstudiante";
import ModalVerModulosCursados from "../components/ModalVerModulosCursados";

const Container = styled.div`
  padding: 20px;
  background-color: #222736;
  color: #e0e0e0;
  min-height: 100vh;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 10px;
`;

const Input = styled.input`
  padding: 10px;
  margin-right: 10px;
  border: 1px solid #5865f2;
  border-radius: 5px;
  background-color: #2c2f33;
  color: #e0e0e0;
  outline: none;
  &::placeholder {
    color: #8c8c8c;
  }
`;

const Select = styled.select`
  padding: 10px;
  border-radius: 5px;
  background-color: #2c2f33;
  color: #e0e0e0;
  border: 1px solid #5865f2;
  outline: none;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #2c2f33;
  border-radius: 8px;
  overflow: hidden;
`;

const Th = styled.th`
  padding: 15px;
  background-color: #5865f2;
  color: white;
  font-weight: bold;
  text-align: left;
`;

const Td = styled.td`
  padding: 12px;
  border: 1px solid #40444b;
  color: #c1c1c1;
  text-align: left;
`;

const Button = styled.button`
  padding: 8px 16px;
  margin-right: 8px;
  background-color: ${(props) =>
    props.variant === "delete" ? "#ff5252" : props.variant === "edit" ? "#4caf50" : props.variant === "ver" ? "#2196f3" : "#5865f2"};
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    opacity: 0.9;
  }
`;

const Title = styled.h1`
  color: #ffffff;
  text-align: center;
  margin-bottom: 20px;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
`;

const PaginationButton = styled.button`
  padding: 8px 16px;
  background-color: #5865f2;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  margin: 0 5px;

  &:disabled {
    background-color: #40444b;
    cursor: not-allowed;
  }

  &:hover:enabled {
    background-color: #4b59f5;
  }
`;

const Estudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [filteredEstudiantes, setFilteredEstudiantes] = useState([]);
  const [estudianteActual, setEstudianteActual] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAñadirVisible, setModalAñadirVisible] = useState(false);
  const [modalModulosVisible, setModalModulosVisible] = useState(false);

  const [searchNombre, setSearchNombre] = useState("");
  const [searchControl, setSearchControl] = useState("");
  const [searchCarrera, setSearchCarrera] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [page, setPage] = useState(1);

  useEffect(() => {
    obtenerEstudiantes();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [estudiantes, searchNombre, searchControl, searchCarrera, statusFilter, page, entriesPerPage]);

  const obtenerEstudiantes = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/estudiantes");
      setEstudiantes(response.data);
    } catch (error) {
      console.error("Error al obtener los estudiantes", error);
    }
  };

  const aplicarFiltros = () => {
    let filtered = estudiantes.filter((estudiante) => {
      return (
        (statusFilter === "" || estudiante.estatus === statusFilter) &&
        (searchCarrera === "" || estudiante.carrera.toLowerCase().includes(searchCarrera.toLowerCase())) &&
        (searchControl === "" || estudiante.numero_control.toString().includes(searchControl)) &&
        (searchNombre === "" || estudiante.nombre_completo.toLowerCase().includes(searchNombre.toLowerCase()))
      );
    });

    setFilteredEstudiantes(
      entriesPerPage === estudiantes.length
        ? filtered
        : filtered.slice((page - 1) * entriesPerPage, page * entriesPerPage)
    );
  };

  const handleEntriesChange = (e) => {
    const value = e.target.value === "All" ? estudiantes.length : parseInt(e.target.value);
    setEntriesPerPage(value);
    setPage(1); // Reset page to 1 on entries change
  };

  const handlePrevious = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNext = () => {
    const maxPage = Math.ceil(estudiantes.length / entriesPerPage);
    setPage((prevPage) => Math.min(prevPage + 1, maxPage));
  };

  const abrirModalEditar = (estudiante) => {
    setEstudianteActual(estudiante);
    setModalVisible(true);
  };

  const abrirModalAñadir = () => {
    setModalAñadirVisible(true);
  };

  const abrirModalModulos = (estudiante) => {
    setEstudianteActual(estudiante);
    setModalModulosVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setEstudianteActual(null);
  };

  const cerrarModalAñadir = () => {
    setModalAñadirVisible(false);
  };

  const cerrarModalModulos = () => {
    setModalModulosVisible(false);
  };

  const inhabilitarEstudiante = async (id) => {
    try {
      const response = await axios.put(`http://localhost:3001/api/estudiantes/inhabilitar/${id}`);
      alert(response.data.message);
      obtenerEstudiantes();
    } catch (error) {
      console.error("Error al inhabilitar estudiante", error);
    }
  };

  const habilitarEstudiante = async (id) => {
    try {
      const response = await axios.put(`http://localhost:3001/api/estudiantes/habilitar/${id}`);
      alert(response.data.message);
      obtenerEstudiantes();
    } catch (error) {
      console.error("Error al habilitar estudiante", error);
    }
  };

  return (
    <Container>
      <Title>Gestión de Estudiantes</Title>
      <Button onClick={abrirModalAñadir}>Añadir Estudiante</Button>

      <FilterContainer>
        <div>
          <Input
            type="text"
            placeholder="Nombre"
            value={searchNombre}
            onChange={(e) => setSearchNombre(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Número de Control"
            value={searchControl}
            onChange={(e) => setSearchControl(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Carrera"
            value={searchCarrera}
            onChange={(e) => setSearchCarrera(e.target.value)}
          />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Todos</option>
            <option value="activo">Activo</option>
            <option value="inhabilitado">Inhabilitado</option>
          </Select>
        </div>
        <div>
          <label>Mostrar Entradas:</label>
          <Select value={entriesPerPage === estudiantes.length ? "All" : entriesPerPage} onChange={handleEntriesChange}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="All">Todos</option>
          </Select>
        </div>
      </FilterContainer>

      <Table>
        <thead>
          <tr>
            <Th>Nombre Completo</Th>
            <Th>Número de Control</Th>
            <Th>Carrera</Th>
            <Th>Email</Th>
            <Th>Fecha de Registro</Th>
            <Th>Estatus</Th>
            <Th>Acciones</Th>
          </tr>
        </thead>
        <tbody>
          {filteredEstudiantes.map((estudiante) => (
            <tr key={estudiante.id}>
              <Td>{estudiante.nombre_completo}</Td>
              <Td>{estudiante.numero_control}</Td>
              <Td>{estudiante.carrera}</Td>
              <Td>{estudiante.email}</Td>
              <Td>{new Date(estudiante.fecha_registro).toLocaleDateString()}</Td>
              <Td>{estudiante.estatus}</Td>
              <Td>
                <Button variant="edit" onClick={() => abrirModalEditar(estudiante)}>Editar</Button>
                <Button variant="ver" onClick={() => abrirModalModulos(estudiante)}>Ver Módulos Cursados</Button>
                {estudiante.estatus === "activo" ? (
                  <Button variant="delete" onClick={() => inhabilitarEstudiante(estudiante.id)}>Inhabilitar</Button>
                ) : (
                  <Button variant="edit" onClick={() => habilitarEstudiante(estudiante.id)}>Habilitar</Button>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <PaginationContainer>
        <p>
          Mostrando {Math.min((page - 1) * entriesPerPage + 1, estudiantes.length)} a {Math.min(page * entriesPerPage, estudiantes.length)} de {estudiantes.length} entradas filtradas
        </p>
        {entriesPerPage < estudiantes.length && (
          <div>
            <PaginationButton onClick={handlePrevious} disabled={page === 1}>
              Anterior
            </PaginationButton>
            <PaginationButton onClick={handleNext} disabled={page === Math.ceil(estudiantes.length / entriesPerPage)}>
              Siguiente
            </PaginationButton>
          </div>
        )}
      </PaginationContainer>

      {modalVisible && (
        <ModalEditarEstudiante
          estudiante={estudianteActual}
          closeModal={cerrarModal}
          actualizarEstudiante={obtenerEstudiantes}
        />
      )}

      {modalAñadirVisible && (
        <AñadirEstudiante closeModal={cerrarModalAñadir} actualizarEstudiante={obtenerEstudiantes} />
      )}

      {modalModulosVisible && (
        <ModalVerModulosCursados idEstudiante={estudianteActual.id} closeModal={cerrarModalModulos} />
      )}
    </Container>
  );
};

export default Estudiantes;
