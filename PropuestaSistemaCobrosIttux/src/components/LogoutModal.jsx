import React, { useEffect } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 40px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const LoadingCircle = styled.div`
  border: 5px solid rgba(0, 0, 0, 0.1);
  border-top: 5px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LogoutModal = ({ onLogout }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onLogout(); // Cerrar la sesión después de 5 segundos
    }, 5000);

    return () => clearTimeout(timer); // Limpia el temporizador al desmontar el componente
  }, [onLogout]);

  return (
    <ModalOverlay>
      <ModalContent>
        <h2>Cerrando sesión...</h2>
        <LoadingCircle />
      </ModalContent>
    </ModalOverlay>
  );
};

export default LogoutModal;
