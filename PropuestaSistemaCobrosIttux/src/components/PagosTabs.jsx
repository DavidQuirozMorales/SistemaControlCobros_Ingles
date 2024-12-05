import React, { useState } from 'react';
import styled from 'styled-components';

// Estilos para las Tabs
const TabsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const TabButton = styled.button`
  background-color: ${(props) => (props.active ? '#28a745' : '#ccc')};
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => (props.active ? '#218838' : '#bbb')};
  }
`;

const TabContent = styled.div`
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

// Estilos de cada Pago
const PagoItem = styled.div`
  background-color: white;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const PagoButton = styled.button`
  background-color: ${(props) => (props.verificar ? '#28a745' : '#dc3545')};
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const PagosTabs = ({ pagosNoVerificados, pagosVerificados, onVerificarPago }) => {
  const [tab, setTab] = useState('noVerificados');

  const handleVerificar = (id) => {
    fetch(`http://localhost:3001/api/pagos/verificar/${id}`, { method: 'PUT' })
      .then(() => {
        onVerificarPago(); // Refrescar la lista de pagos no verificados
      })
      .catch((error) => console.error('Error al verificar pago:', error));
  };

  return (
    <>
      <TabsContainer>
        <TabButton active={tab === 'noVerificados'} onClick={() => setTab('noVerificados')}>
          No Verificados
        </TabButton>
        <TabButton active={tab === 'verificados'} onClick={() => setTab('verificados')}>
          Verificados
        </TabButton>
      </TabsContainer>

      {/* Contenido de las Tabs */}
      {tab === 'noVerificados' && (
        <TabContent>
          <h2>Pagos No Verificados</h2>
          {pagosNoVerificados.map((pago) => (
            <PagoItem key={pago.id}>
              <p>{`Estudiante: ${pago.id_estudiante}, Módulo: ${pago.id_modulo}, Monto: ${pago.monto}`}</p>
              <PagoButton verificar onClick={() => handleVerificar(pago.id)}>Verificar Pago</PagoButton>
            </PagoItem>
          ))}
        </TabContent>
      )}

      {tab === 'verificados' && (
        <TabContent>
          <h2>Pagos Verificados</h2>
          {pagosVerificados.map((pago) => (
            <PagoItem key={pago.id}>
              <p>{`Estudiante: ${pago.id_estudiante}, Módulo: ${pago.id_modulo}, Monto: ${pago.monto}`}</p>
            </PagoItem>
          ))}
        </TabContent>
      )}
    </>
  );
};

export default PagosTabs;
