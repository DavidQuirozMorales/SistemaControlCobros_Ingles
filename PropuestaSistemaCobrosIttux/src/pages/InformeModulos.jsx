import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import GenerarInformePDF from '../utils/GenerarInformePDF';

const Container = styled.div`
  width: 70%;
  margin: auto;
  padding: 20px;
  background-color: #222736;
  color: #e0e0e0;
  border-radius: 8px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2.5rem;
  color: #ffffff;
  margin-bottom: 20px;
`;

const Section = styled.div`
  margin-top: 20px;
  padding: 15px;
  background-color: #2c2f33;
  border-radius: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  font-size: 1rem;
  border: 1px solid #40444b;
  border-radius: 5px;
  background-color: #36393f;
  color: white;
`;

const Button = styled.button`
  background-color: #5865f2;
  color: #fff;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  margin-top: 10px;

  &:hover {
    background-color: #4b59f5;
  }
`;

const ModuleGroupButton = styled.button`
  background-color: ${props => (props.selected ? '#5865f2' : '#4a4e57')};
  color: #fff;
  padding: 10px;
  margin: 5px 0;
  cursor: pointer;
  border: none;
  width: 100%;
  border-radius: 5px;

  &:hover {
    background-color: ${props => (props.selected ? '#4b59f5' : '#5c5f67')};
  }
`;

const ReportSection = styled.div`
  margin-top: 20px;
  padding: 15px;
  background-color: #2c2f33;
  border-radius: 8px;
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
  padding: 25px;
  border-radius: 8px;
  text-align: center;
  color: white;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #fff;
  cursor: pointer;
`;

const InformeModulos = ({ adminName }) => {
  const [reportName, setReportName] = useState('');
  const [comment, setComment] = useState('');
  const [modules, setModules] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [folio, setFolio] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchModulesAndGroups = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/informe-modulos-grupos');
        setModules(response.data);
      } catch (error) {
        console.error("Error fetching modules and groups:", error);
      }
    };
    fetchModulesAndGroups();
  }, []);

  const handleGroupSelect = (moduleId, groupId) => {
    setSelectedGroups(prevSelected => {
      const isSelected = prevSelected.some(
        group => group.moduleId === moduleId && group.groupId === groupId
      );
      if (isSelected) {
        return prevSelected.filter(
          group => !(group.moduleId === moduleId && group.groupId === groupId)
        );
      } else {
        return [...prevSelected, { moduleId, groupId }];
      }
    });
  };

  const handleGenerateReport = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/informe-modulos-grupos');
      const data = response.data;

      const filteredData = data.filter(module =>
        selectedGroups.some(group => group.moduleId === module.modulo_id)
      ).map(module => ({
        ...module,
        grupos: module.grupos.filter(group =>
          selectedGroups.some(selected => selected.groupId === group.grupo_id)
        ),
      }));

      const totalAmountFinal = filteredData.reduce((total, module) => {
        return (
          total +
          module.grupos.reduce(
            (groupTotal, group) => groupTotal + Number(group.monto_total_recaudado || 0),
            0
          )
        );
      }, 0);

      const folioNumber = Math.floor(10000 + Math.random() * 90000);
      setFolio(folioNumber);

      setReportData({
        reportName,
        comment,
        modules: filteredData,
        totalAmountFinal,
        adminName,
        date: new Date().toLocaleString(),
        folioNumber,
      });
    } catch (error) {
      console.error("Error al generar el informe:", error);
    }
  };

  const handleDownloadPDF = async () => {
    if (reportData) {
      GenerarInformePDF(reportData);

      try {
        await axios.post('http://localhost:3001/api/reportes/registrar', {
          nombre_reporte: reportData.reportName,
          numero_reporte: reportData.folioNumber,
          tipo_reporte: 'Modulos Y Grupos',
          comentarios: reportData.comment,
          total_modulos: reportData.modules.length,
          total_grupos: reportData.modules.reduce((count, module) => count + module.grupos.length, 0),
          total_estudiantes_activos: reportData.modules.reduce(
            (total, module) =>
              total +
              module.grupos.reduce((groupTotal, group) => groupTotal + group.estudiantes_activos, 0),
            0
          ),
          monto_total: reportData.totalAmountFinal,
          generado_por: adminName || 'Admin desconocido',
        });

        setShowModal(true);
      } catch (error) {
        console.error("Error al guardar en el historial:", error);
      }
    } else {
      alert("Por favor, genere el informe antes de descargar el PDF.");
    }
  };

  return (
    <Container>
      <Title>Informe por Módulos y Grupos</Title>

      <Section>
        <label>Nombre del Informe:</label>
        <Input
          type="text"
          value={reportName}
          onChange={(e) => setReportName(e.target.value)}
        />
      </Section>

      <Section>
        <label>Seleccionar Módulos y Grupos</label>
        {modules.map((module) => (
          <div key={module.modulo_id}>
            <h3>{module.modulo_nombre}</h3>
            {module.grupos.map((group) => (
              <ModuleGroupButton
                key={group.grupo_id}
                selected={selectedGroups.some(
                  (selected) =>
                    selected.moduleId === module.modulo_id &&
                    selected.groupId === group.grupo_id
                )}
                onClick={() =>
                  handleGroupSelect(module.modulo_id, group.grupo_id)
                }
              >
                {group.grupo_nombre}
              </ModuleGroupButton>
            ))}
          </div>
        ))}
      </Section>

      <Section>
        <label>Comentarios:</label>
        <Input
          as="textarea"
          rows="3"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </Section>

      <Button onClick={handleGenerateReport}>Generar Informe</Button>

      {reportData && (
        <ReportSection>
          <h2>Resumen del Informe</h2>
          <p><strong>Folio del Reporte:</strong> {reportData.folioNumber}</p>
          <p><strong>Nombre del Informe:</strong> {reportData.reportName}</p>
          <p><strong>Comentarios:</strong> {reportData.comment}</p>
          <p><strong>Total de Módulos Seleccionados:</strong> {reportData.modules.length}</p>
          <p><strong>Monto Total Final:</strong> ${Number(reportData.totalAmountFinal).toFixed(2)}</p>
          <p><strong>Generado por:</strong> {reportData.adminName}</p>
          <p><strong>Fecha:</strong> {reportData.date}</p>

          <h3>Detalles del Informe</h3>
          {reportData.modules.map((module) => (
            <div key={module.modulo_id}>
              <h4>{module.modulo_nombre}</h4>
              {module.grupos.map((group) => (
                <div key={group.grupo_id}>
                  <p><strong>Grupo:</strong> {group.grupo_nombre}</p>
                  <p><strong>Monto Total Recaudado:</strong> ${Number(group.monto_total_recaudado).toFixed(2)}</p>
                  <p><strong>Estudiantes Activos:</strong> {group.estudiantes_activos}</p>
                </div>
              ))}
            </div>
          ))}
          <Button onClick={handleDownloadPDF}>Descargar PDF</Button>
        </ReportSection>
      )}

      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={() => setShowModal(false)}>&times;</CloseButton>
            <h3>¡Datos enviados al historial correctamente!</h3>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default InformeModulos;
