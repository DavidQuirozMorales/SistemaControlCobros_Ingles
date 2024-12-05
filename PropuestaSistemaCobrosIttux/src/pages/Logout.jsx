import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const Logout = ({ onLogout }) => {
  useEffect(() => {
    onLogout(); // Llama a la función de logout del App.jsx
  }, [onLogout]);

  // Redirige al login después de cerrar sesión
  return <Navigate to="/" />;
};

export default Logout;
