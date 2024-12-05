import React, { useState } from 'react';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import GenerarInformeGlobalPDF from '../utils/GenerarInformeGlobalPDF';
import axios from 'axios';

// Estilos
const Container = styled.div`
  padding: 20px;
  background-color: #222736;
  color: #e0e0e0;
  border-radius: 8px;
  max-width: 90%;
  margin: auto;
`;

const Title = styled.h1`
  text-align: center;
  color: #ffffff;
  margin-bottom: 20px;
  font-size: 2rem;
`;

const SearchForm = styled.form`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
`;

const Select = styled.select`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #40444b;
  border-radius: 8px;
  color: #e0e0e0;
  background-color: #36393f;
  &:focus {
    outline: none;
    border-color: #5865f2;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  background-color: #5865f2;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-weight: bold;

  &:hover {
    background-color: #4b59f5;
  }
`;

const StyledDatePicker = styled(DatePicker)`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #40444b;
  border-radius: 8px;
  color: #e0e0e0;
  background-color: #36393f;
  &:focus {
    outline: none;
    border-color: #5865f2;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #2c2f33;
`;

const Th = styled.th`
  padding: 15px;
  background-color: #5865f2;
  color: white;
  font-weight: bold;
  border: 1px solid #40444b;
  font-size: 14px;
`;

const Td = styled.td`
  padding: 15px;
  text-align: center;
  border: 1px solid #40444b;
  font-size: 14px;
  color: #c1c1c1;
`;

const IndexTd = styled(Td)`
  width: 50px;
  font-weight: bold;
  color: #5865f2;
`;

const PdfButton = styled(Button)`
  margin-top: 20px;
`;

const ModalOverlay = styled.div`
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
  position: relative;
  background: #2c2f33;
  padding: 35px;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  text-align: center;
  color: #e0e0e0;
`;

const ModalTitle = styled.h3`
  color: #ffffff;
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 15px;
`;

const ModalLabel = styled.p`
  color: #e0e0e0;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 8px;
  text-align: left;
`;

const AdminBox = styled.div`
  background: #36393f;
  padding: 10px;
  border-radius: 8px;
  font-size: 1rem;
  color: #ffffff;
  text-align: center;
  font-weight: bold;
  border: 1px solid #40444b;
  margin-bottom: 20px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #888;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 12px;
  font-size: 1rem;
  border: 1px solid #40444b;
  border-radius: 8px;
  color: #e0e0e0;
  background-color: #36393f;

  &:focus {
    border-color: #5865f2;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  font-size: 1rem;
  border: 1px solid #40444b;
  border-radius: 8px;
  color: #e0e0e0;
  background-color: #36393f;

  &:focus {
    border-color: #5865f2;
  }
`;

const ConfirmButton = styled(Button)`
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  border-radius: 8px;
`;

const SuccessNotification = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1100;
`;

// Componente principal
const InformesGlobales = ({ adminName }) => {
  const [data, setData] = useState([]);
  const [filterType, setFilterType] = useState('semanal');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [folio, setFolio] = useState('');
  const [reportName, setReportName] = useState('');
  const [comments, setComments] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const admin = adminName || localStorage.getItem('adminName') || "Admin desconocido";

  const fetchData = async (params = {}) => {
    try {
      const response = await axios.post('http://localhost:3001/api/reportes/global', params);
      if (Array.isArray(response.data)) {
        setData(response.data);
        setShowTable(true);
      }
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    let params = {};
    if (filterType === 'semanal') {
      params = { period: 'weekly' };
    } else if (filterType === 'mensual') {
      params = { period: 'monthly' };
    } else if (filterType === 'trimestral') {
      params = { period: 'quarterly' };
    } else if (filterType === 'personalizado' && startDate && endDate) {
      params = {
        period: 'custom',
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      };
    }

    fetchData(params);
  };

  const handleGeneratePDF = () => {
    setFolio(Math.floor(10000 + Math.random() * 90000));
    setShowModal(true);
  };

  const confirmGeneratePDF = async () => {
    if (!reportName) {
      setError("Por favor, ingresa un nombre para el reporte.");
      return;
    }
    setError('');
    setShowModal(false);

    const totalAmountFinal = data.reduce((sum, item) => sum + (parseFloat(item.monto) || 0), 0);
    const rows = data.map((item, index) => ({
      index: index + 1,
      date: new Date(item.fecha_pago).toLocaleDateString('es-ES'),
      control: item.numero_control,
      student: item.nombre_estudiante,
      module: item.modulo_pagado,
      month: new Date(item.fecha_pago).toLocaleDateString('es-ES', { month: 'long' }).toUpperCase(),
      method: item.metodo_pago,
      payment: item.monto ? Number(item.monto).toFixed(2) : 'N/A',
    }));

    // Generar el PDF
    const reportData = {
      reportName,
      reportNumber: `#${folio}`,
      date: new Date().toLocaleDateString(),
      adminName: admin,
      comment: comments,
      totalAmountFinal,
      rows,
    };
    GenerarInformeGlobalPDF(reportData);

    // Guardar en el historial
    try {
      await axios.post('http://localhost:3001/api/reportes/registrar', {
        nombre_reporte: reportName,
        numero_reporte: `#${folio}`,
        tipo_reporte: 'Global',
        comentarios: comments,
        total_modulos: 0,
        total_grupos: 0,
        total_estudiantes_activos: 0,
        monto_total: totalAmountFinal,
        fecha_inicio: startDate ? startDate.toISOString().split('T')[0] : null,
        fecha_fin: endDate ? endDate.toISOString().split('T')[0] : null,
        generado_por: admin,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error al guardar el reporte en el historial:", error);
    }
  };

  return (
    <Container>
      {success && <SuccessNotification>Datos enviados al historial correctamente.</SuccessNotification>}
      <Title>Informe Global de Pagos</Title>
      <SearchForm onSubmit={handleSearch}>
        <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="semanal">Semanal</option>
          <option value="mensual">Mensual</option>
          <option value="trimestral">Trimestral</option>
          <option value="personalizado">Personalizado</option>
        </Select>
        {filterType === 'personalizado' && (
          <>
            <StyledDatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Fecha de inicio"
            />
            <StyledDatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Fecha de fin"
            />
          </>
        )}
        <Button type="submit">Buscar</Button>
      </SearchForm>
      {showTable && (
        <>
          <Table>
            <thead>
              <tr>
                <Th>#</Th>
                <Th>Fecha</Th>
                <Th>Número de Control</Th>
                <Th>Estudiante</Th>
                <Th>Módulo Pagado</Th>
                <Th>Mes</Th>
                <Th>Método de Pago</Th>
                <Th>Pago</Th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <IndexTd>{index + 1}</IndexTd>
                  <Td>{new Date(item.fecha_pago).toLocaleDateString('es-ES')}</Td>
                  <Td>{item.numero_control}</Td>
                  <Td>{item.nombre_estudiante}</Td>
                  <Td>{item.modulo_pagado}</Td>
                  <Td>{new Date(item.fecha_pago).toLocaleDateString('es-ES', { month: 'long' }).toUpperCase()}</Td>
                  <Td>{item.metodo_pago}</Td>
                  <Td>{item.monto ? Number(item.monto).toFixed(2) : 'N/A'}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <PdfButton onClick={handleGeneratePDF}>Generar PDF</PdfButton>
        </>
      )}
      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={() => setShowModal(false)}>&times;</CloseButton>
            <ModalTitle>Generar PDF</ModalTitle>
            <ModalLabel>Nombre del administrador:</ModalLabel>
            <AdminBox>{admin}</AdminBox>
            <Input
              type="text"
              placeholder="Nombre del reporte"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <ModalLabel>Número de Reporte: {folio}</ModalLabel>
            <Textarea
              placeholder="Añadir comentarios"
              rows="4"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
            <ConfirmButton onClick={confirmGeneratePDF}>Generar Reporte</ConfirmButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default InformesGlobales;
