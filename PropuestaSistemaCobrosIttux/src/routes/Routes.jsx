import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Pagos from '../pages/Pagos';
import Estudiantes from '../pages/Estudiantes';
import Reportes from '../pages/Reportes';
import Calendario from '../pages/Calendario';
import Configuraciones from '../pages/Configuraciones';
import Login from '../pages/Login'; 
import Logout from '../pages/Logout';
import Modulos from '../pages/Modulos'; // Importamos el nuevo componente de Modulos

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} /> {/* Ruta predeterminada */}
      <Route path="/home" element={<Home />} />
      <Route path="/pagos" element={<Pagos />} />
      <Route path="/estudiantes" element={<Estudiantes />} />
      <Route path="/reportes" element={<Reportes />} />
      <Route path="/calendario" element={<Calendario />} />
      <Route path="/configuraciones" element={<Configuraciones />} />
      <Route path="/modulos" element={<Modulos />} /> {/* Nueva ruta para módulos */}
      <Route path="/logout" element={<Logout />} />
    </Routes>
  );
};

export default AppRoutes;
