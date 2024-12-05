import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import RegistrarPago from '../components/RegistrarPago';

const Container = styled.div`
  padding: 20px;
  background-color: #222736;
  color: #e0e0e0;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: ${(props) => (props.primary ? '#32CD32' : '#5865f2')};
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
  font-weight: bold;

  &:hover {
    opacity: 0.9;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const Th = styled.th`
  padding: 12px;
  background-color: #3d3d50;
  color: #fff;
  font-weight: bold;
  border: 1px solid #444;
`;

const Td = styled.td`
  padding: 12px;
  background-color: #2c2c3b;
  color: #e0e0e0;
  border: 1px solid #444;
`;

const Input = styled.input`
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #5865f2;
  margin-top: 10px;
  width: 100%;
  color: #e0e0e0;
  background-color: #2c2f33;
`;

const ModalContainer = styled.div`
  padding: 20px;
  background-color: #1e1e2f;
  border-radius: 8px;
  color: #e0e0e0;
  width: 100%;
  max-width: 400px;
  margin: auto;
  text-align: center;
`;

const Pagos = () => {
  const [pagosNoVerificados, setPagosNoVerificados] = useState([]);
  const [pagosVerificados, setPagosVerificados] = useState([]);
  const [tab, setTab] = useState('no-verificados');
  const [showModal, setShowModal] = useState(false);
  const [referenciaBancaria, setReferenciaBancaria] = useState('');
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null);

  const obtenerPagosNoVerificados = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/pagos/no-verificados');
      setPagosNoVerificados(response.data);
    } catch (error) {
      console.error('Error al obtener los pagos no verificados', error);
    }
  };

  const obtenerPagosVerificados = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/pagos/verificados');
      setPagosVerificados(response.data);
    } catch (error) {
      console.error('Error al obtener los pagos verificados', error);
    }
  };

  useEffect(() => {
    if (tab === 'no-verificados') {
      obtenerPagosNoVerificados();
    } else {
      obtenerPagosVerificados();
    }
  }, [tab]);

  const abrirModalVerificacion = (pago) => {
    setPagoSeleccionado(pago);
    setReferenciaBancaria('');
  };

  const verificarPago = async () => {
    try {
      await axios.put(`http://localhost:3001/api/pagos/verificar/${pagoSeleccionado.id_pago}`, {
        referencia_bancaria_ingresada: referenciaBancaria,
      });
      alert('Pago verificado correctamente.');
      setPagoSeleccionado(null);
      obtenerPagosNoVerificados();
    } catch (error) {
      alert('Error al verificar el pago. Verifique que la referencia bancaria sea correcta.');
      console.error('Error al verificar el pago', error);
    }
  };

  return (
    <Container>
      <h1>Gestión de Pagos</h1>
      <Button primary onClick={() => setShowModal(true)}>
        Registrar Pago
      </Button>
      <Button onClick={() => setTab('no-verificados')}>No Verificados</Button>
      <Button onClick={() => setTab('verificados')}>Verificados</Button>

      {tab === 'no-verificados' && (
        <Table>
          <thead>
            <tr>
              <Th>Estudiante</Th>
              <Th>Modulo</Th>
              <Th>Monto</Th>
              <Th>Fecha de Pago</Th>
              <Th>Método de Pago</Th>
              <Th>Referencia Bancaria</Th>
              <Th>Estatus</Th>
              <Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {pagosNoVerificados.length > 0 ? (
              pagosNoVerificados.map((pago) => (
                <tr key={pago.id_pago}>
                  <Td>{pago.nombre_estudiante}</Td>
                  <Td>{pago.nombre_modulo}</Td>
                  <Td>{pago.monto}</Td>
                  <Td>{new Date(pago.fecha_pago).toLocaleDateString()}</Td>
                  <Td>{pago.metodo_pago}</Td>
                  <Td>{pago.referencia_bancaria}</Td>
                  <Td>{pago.estatus}</Td>
                  <Td>
                    <Button onClick={() => abrirModalVerificacion(pago)}>Verificar</Button>
                  </Td>
                </tr>
              ))
            ) : (
              <tr>
                <Td colSpan="8">No hay pagos no verificados</Td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {tab === 'verificados' && (
        <Table>
          <thead>
            <tr>
              <Th>Estudiante</Th>
              <Th>Modulo</Th>
              <Th>Monto</Th>
              <Th>Fecha de Pago</Th>
              <Th>Método de Pago</Th>
              <Th>Referencia Bancaria</Th>
              <Th>Estatus</Th>
            </tr>
          </thead>
          <tbody>
            {pagosVerificados.length > 0 ? (
              pagosVerificados.map((pago) => (
                <tr key={pago.id_pago}>
                  <Td>{pago.nombre_estudiante}</Td>
                  <Td>{pago.nombre_modulo}</Td>
                  <Td>{pago.monto}</Td>
                  <Td>{new Date(pago.fecha_pago).toLocaleDateString()}</Td>
                  <Td>{pago.metodo_pago}</Td>
                  <Td>{pago.referencia_bancaria}</Td>
                  <Td>{pago.estatus}</Td>
                </tr>
              ))
            ) : (
              <tr>
                <Td colSpan="7">No hay pagos verificados</Td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {showModal && <RegistrarPago onClose={() => setShowModal(false)} />}

      {pagoSeleccionado && (
        <ModalContainer>
          <h3>Verificar Pago</h3>
          <label>Referencia Bancaria:</label>
          <Input
            type="text"
            value={referenciaBancaria}
            onChange={(e) => setReferenciaBancaria(e.target.value)}
          />
          <Button primary onClick={verificarPago}>Confirmar Verificación</Button>
          <Button onClick={() => setPagoSeleccionado(null)}>Cancelar</Button>
        </ModalContainer>
      )}
    </Container>
  );
};

export default Pagos;
