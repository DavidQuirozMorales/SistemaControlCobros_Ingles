import React, { useState } from 'react';
import styled from 'styled-components';
import InformeModulosYGrupos from '../components/InformeModulosYGrupos';
import InformeFinancieroGlobal from '../components/InformeFinancieroGlobal';

// Styled Components
const Container = styled.div`
  padding: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const ToggleButton = styled.button`
  padding: 10px 20px;
  margin-right: 10px;
  background-color: ${(props) => (props.active ? '#333' : '#ddd')};
  color: ${(props) => (props.active ? '#fff' : '#333')};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.active ? '#555' : '#ccc')};
  }
`;

const Reportes = () => {
  const [activeReport, setActiveReport] = useState('modulosYGrupos');

  return (
    <Container>
      <h1>Reportes Financieros</h1>
      <ButtonContainer>
        <ToggleButton
          active={activeReport === 'modulosYGrupos'}
          onClick={() => setActiveReport('modulosYGrupos')}
        >
          Informe por Módulo y Grupo
        </ToggleButton>
        <ToggleButton
          active={activeReport === 'financieroGlobal'}
          onClick={() => setActiveReport('financieroGlobal')}
        >
          Informe Financiero Global
        </ToggleButton>
      </ButtonContainer>
      {activeReport === 'modulosYGrupos' && <InformeModulosYGrupos />}
      {activeReport === 'financieroGlobal' && <InformeFinancieroGlobal />}
    </Container>
  );
};

export default Reportes;
