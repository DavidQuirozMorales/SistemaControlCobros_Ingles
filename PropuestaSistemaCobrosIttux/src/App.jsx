import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './pages/Home';
import Pagos from './pages/Pagos';
import Estudiantes from './pages/Estudiantes';
import InformeModulos from './pages/InformeModulos';
import InformesGlobales from './pages/InformesGlobales';
import Calendario from './pages/Calendario';
import Configuraciones from './pages/Configuraciones';
import Logout from './pages/Logout';
import Login from './pages/Login';
import Modulos from './pages/Modulos';
import LogoutModal from './components/LogoutModal';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticación
  const [username, setUsername] = useState(''); // Nombre del usuario autenticado
  const [showLogoutModal, setShowLogoutModal] = useState(false); // Modal de logout

  // Manejar login
  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setUsername(user);
  };

  // Manejar logout con un retraso y mostrar modal
  const handleLogout = () => {
    setShowLogoutModal(true);
    setTimeout(() => {
      setIsAuthenticated(false);
      setUsername('');
      setShowLogoutModal(false);
    }, 2000);
  };

  return (
    <Router>
      <div className="app-container">
        {/* Rutas para usuarios no autenticados */}
        {!isAuthenticated ? (
          <Routes>
            <Route path="/" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        ) : (
          // Layout de usuarios autenticados
          <div className="authenticated-layout">
            <Sidebar onLogout={handleLogout} /> {/* Menú lateral */}
            <div className="main-content">
              <Header username={username} /> {/* Encabezado */}
              <div className="content">
                <Routes>
                  <Route path="/home" element={<Home />} />
                  <Route path="/pagos" element={<Pagos />} />
                  <Route path="/estudiantes" element={<Estudiantes />} />
                  <Route path="/informe-modulos" element={<InformeModulos adminName={username} />} />
                  <Route path="/informes-globales" element={<InformesGlobales />} />
                  <Route path="/calendario" element={<Calendario />} />
                  <Route path="/configuraciones" element={<Configuraciones />} />
                  <Route path="/modulos" element={<Modulos />} />
                  <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
                  <Route path="*" element={<Navigate to="/home" />} />
                </Routes>
              </div>
            </div>
          </div>
        )}
        {/* Modal de cierre de sesión */}
        {showLogoutModal && <LogoutModal />}
      </div>
    </Router>
  );
}

export default App;
