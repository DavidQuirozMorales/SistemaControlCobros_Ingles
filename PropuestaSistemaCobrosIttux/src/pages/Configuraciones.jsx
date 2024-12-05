import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contenedor principal
const Container = styled.div`
  padding: 40px;
  width: 90%;
  margin: 50px auto;
  background-color: #1e1f25;
  color: #ffffff;
  border-radius: 12px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3);
`;

// Título principal
const Title = styled.h1`
  text-align: center;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 40px;
  color: #ffffff;
`;

// Sección con separación clara
const Section = styled.div`
  margin-bottom: 40px;
  padding: 20px;
  background-color: #292a30;
  border-radius: 10px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
`;

// Contenedor para tablas con scroll
const TableContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border-radius: 8px;
  background-color: #2c2f33;

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #5865f2;
    border-radius: 4px;
  }
`;

// Tabla con estilos personalizados
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: #2c2f33;

  th {
    position: sticky;
    top: 0;
    background-color: #5865f2;
    color: white;
    font-weight: bold;
    font-size: 14px;
    border: 1px solid #40444b;
    text-align: center;
    z-index: 1;
  }

  td {
    padding: 15px;
    text-align: center;
    font-size: 14px;
    color: #c1c1c1;
    border: 1px solid #40444b;
  }

  tbody tr:nth-child(even) {
    background-color: #343a40;
  }

  tbody tr:hover {
    background-color: #424866;
    cursor: pointer;
  }
`;

// Mensaje de tabla vacía
const EmptyMessage = styled.p`
  text-align: center;
  margin-top: 20px;
  font-size: 1.2rem;
  color: #e0e0e0;
`;

// Selector de tipo de reporte
const Select = styled.select`
  width: 200px;
  padding: 10px;
  margin-bottom: 20px;
  font-size: 16px;
  color: #ffffff;
  background-color: #36393f;
  border: 1px solid #40444b;
  border-radius: 8px;

  &:focus {
    outline: none;
    border-color: #5865f2;
  }
`;

// Botón estilizado
const Button = styled.button`
  padding: 12px 20px;
  margin-right: 10px;
  background-color: ${(props) => (props.primary ? '#007bff' : '#6c757d')};
  color: #ffffff;
  width: 100%;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(props) => (props.primary ? '#0056b3' : '#5a6268')};
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 12px 20px;
  background-color: #007bff;
  color: #ffffff;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

// Contenedor para el cron job
const CronJobContainer = styled.div`
  margin-top: 20px;
  padding: 20px;
  background-color: #292a30;
  border-radius: 8px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

// Botón centrado
const CronJobButton = styled.button`
  padding: 12px 20px;
  background-color: #e63946;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #d62839;
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

// Leyenda explicativa para el cron job
const CronJobDescription = styled.p`
  margin-top: 10px;
  font-size: 14px;
  color: #c1c1c1;
  text-align: justify;
`;

const Configuraciones = () => {
  const [isLoadingBackup, setIsLoadingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [historialNotificaciones, setHistorialNotificaciones] = useState([]);
  const [reports, setReports] = useState([]);
  const [reportType, setReportType] = useState('Global');
  const [isExecutingCronJob, setIsExecutingCronJob] = useState(false);

  useEffect(() => {
    const fetchHistorialNotificaciones = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/historial-notificaciones');
        setHistorialNotificaciones(response.data);
      } catch (error) {
        toast.error('Error al cargar historial de notificaciones.');
      }
    };

    const fetchReports = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/historial-reportes');
        setReports(response.data.filter((report) => report.tipo_reporte === reportType));
      } catch (error) {
        toast.error('Error al cargar historial de reportes.');
      }
    };

    fetchHistorialNotificaciones();
    fetchReports();
  }, [reportType]);

  const handleBackup = async () => {
    setIsLoadingBackup(true);
    try {
      const response = await fetch('/api/backup');
      const result = await response.json();
      if (response.ok) toast.success('Respaldo generado correctamente.');
      else throw new Error(result.message || 'Error al generar el respaldo.');
    } catch (error) {
      toast.error('Error al generar el respaldo.');
    } finally {
      setIsLoadingBackup(false);
    }
  };

  const handleRestore = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      toast.error('Por favor selecciona un archivo válido.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setIsRestoring(true);

    try {
      const response = await fetch('/api/restore', { method: 'POST', body: formData });
      if (response.ok) toast.success('Base de datos restaurada correctamente.');
      else throw new Error('Error al restaurar el respaldo.');
    } catch (error) {
      toast.error('Error al restaurar el respaldo.');
    } finally {
      setIsRestoring(false);
    }
  };

  const forceCronJob = async () => {
    setIsExecutingCronJob(true);
    try {
      const response = await axios.post('http://localhost:3001/api/cron/manual/eventos');
      if (response.data.success) toast.success('Cron job ejecutado manualmente.');
      else toast.error('Error al ejecutar el cron job.');
    } catch (error) {
      toast.error('Error al ejecutar el cron job.');
    } finally {
      setIsExecutingCronJob(false);
    }
  };

  return (
    <Container>
      <Title>Configuraciones del Sistema</Title>

      {/* Respaldo */}
      <Section>
        <h2>Descargar Respaldo</h2>
        <Button primary onClick={handleBackup} disabled={isLoadingBackup}>
          {isLoadingBackup ? 'Generando...' : 'Descargar Respaldo'}
        </Button>
      </Section>

      {/* Restaurar */}
      <Section>
        <h2>Restaurar Respaldo</h2>
        <FileInput type="file" accept=".sql,.csv" id="file-upload" onChange={handleRestore} />
        <FileInputLabel htmlFor="file-upload">{isRestoring ? 'Restaurando...' : 'Seleccionar Archivo'}</FileInputLabel>
      </Section>

      {/* Reportes */}
      <Section>
        <h2>Bitácora de Reportes Generados</h2>
        <Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
          <option value="Global">Global</option>
          <option value="Modulos y Grupos">Módulos y Grupos</option>
        </Select>
        {reports.length > 0 ? (
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Número</th>
                  <th>Comentarios</th>
                  <th>Total</th>
                  <th>Generado por</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => (
                  <tr key={index}>
                    <td>{report.id_reporte}</td>
                    <td>{report.nombre_reporte}</td>
                    <td>{report.numero_reporte}</td>
                    <td>{report.comentarios}</td>
                    <td>${report.monto_total}</td>
                    <td>{report.generado_por}</td>
                    <td>{new Date(report.fecha_generacion).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        ) : (
          <EmptyMessage>No hay reportes disponibles.</EmptyMessage>
        )}
      </Section>

      {/* Notificaciones */}
      <Section>
        <h2>Historial de Notificaciones</h2>
        {historialNotificaciones.length > 0 ? (
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tipo</th>
                  <th>Mensaje</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {historialNotificaciones.map((noti, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{noti.tipo}</td>
                    <td>{noti.mensaje}</td>
                    <td>{new Date(noti.fecha_creacion).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        ) : (
          <EmptyMessage>No hay notificaciones disponibles.</EmptyMessage>
        )}
      </Section>

      {/* Cron Job */}
      <Section>
        <h2>Forzar Cron Job</h2>
        <CronJobDescription>
          Ejecuta manualmente el proceso de notificaciones si es necesario.
        </CronJobDescription>
        <CronJobContainer>
          <CronJobButton onClick={forceCronJob} disabled={isExecutingCronJob}>
            {isExecutingCronJob ? 'Ejecutando...' : 'Forzar Cron Job'}
          </CronJobButton>
        </CronJobContainer>
      </Section>

      <ToastContainer position="top-right" autoClose={5000} />
    </Container>
  );
};

export default Configuraciones;
