import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaWallet,
  FaUser,
  FaChartPie,
  FaCalendarAlt,
  FaCog,
  FaPowerOff,
  FaLayerGroup,
  FaChevronDown,
} from 'react-icons/fa';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  width: 250px;
  height: 100vh;
  background-color: #1e1f2a;
  display: flex;
  flex-direction: column;
  padding-top: 20px;
  position: fixed;
  left: 0;
  top: 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.4);
  color: #b5b5b5;
  transition: width 0.3s ease;

  @media (max-width: 768px) {
    width: 80px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  font-size: 22px;
  font-weight: bold;
  color: #6c63ff; /* Color destacado */
  text-transform: uppercase;

  img {
    width: 50px;
    height: 50px;
    margin-right: 15px;
    filter: drop-shadow(0 0 5px #6c63ff); /* Sombra vibrante */
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.1);
    }
  }

  @media (max-width: 768px) {
    font-size: 16px;
    flex-direction: column;

    img {
      margin-right: 0;
      margin-bottom: 10px;
    }
  }
`;

const Menu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
`;

const MenuItem = styled.li`
  width: 100%;
  margin-bottom: 10px;
  position: relative;

  &:hover {
    background-color: #25283e;
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 5px;
    background-color: ${({ isActive }) => (isActive ? '#6c63ff' : 'transparent')};
    transition: background-color 0.3s ease;
  }
`;

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  font-size: 16px;
  color: ${({ isActive }) => (isActive ? '#ffffff' : '#b5b5b5')};
  text-decoration: none;
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.3s ease;

  &:hover {
    background-color: #1c1f32;
    color: #6c63ff;
    transform: translateX(5px);
  }

  svg {
    margin-right: 10px;
    font-size: 18px;
  }

  @media (max-width: 768px) {
    justify-content: center;

    svg {
      margin-right: 0;
    }

    span {
      display: none;
    }
  }
`;

const LogoutButton = styled.button`
  width: 90%;
  padding: 10px 20px;
  margin: 20px auto;
  display: block;
  font-size: 1rem;
  font-weight: bold;
  color: #ffffff; /* Blanco para el texto */
  background-color: #6c63ff; /* Morado principal */
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    background-color: #ff6b6b; /* Rojo suave al pasar el mouse */
    color: #ffffff; /* Asegura que el texto siga siendo visible */
    box-shadow: 0 4px 8px rgba(255, 107, 107, 0.4); /* Sutil sombra para el hover */
  }


  svg {
    margin-right: 10px;
    font-size: 18px;
  }

  @media (max-width: 768px) {
    justify-content: center;

    svg {
      margin-right: 0;
    }

    span {
      display: none;
    }
  }
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const DropdownButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  font-size: 16px;
  color: #b5b5b5;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: #1c1f32;
    color: #6c63ff;
  }

  svg {
    margin-left: 10px;
    font-size: 14px;
  }

  @media (max-width: 768px) {
    justify-content: center;

    svg {
      margin-left: 0;
    }

    span {
      display: none;
    }
  }
`;

const DropdownMenu = styled.div`
  display: ${({ open }) => (open ? 'block' : 'none')};
  background-color: #1a1c2b;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  position: absolute;
  left: 0;
  top: 100%;
  width: 100%;
  z-index: 1;
  transition: opacity 0.3s ease, transform 0.3s ease;
  opacity: ${({ open }) => (open ? 1 : 0)};
  transform: ${({ open }) => (open ? 'translateY(0)' : 'translateY(-10px)')};
`;

const DropdownItem = styled(Link)`
  display: block;
  padding: 10px 20px;
  font-size: 14px;
  color: #b5b5b5;
  text-decoration: none;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: #1c1f32;
    color: #6c63ff;
  }
`;

function Sidebar({ onLogout }) {
  const [isReportDropdownOpen, setIsReportDropdownOpen] = useState(false);

  const toggleReportDropdown = () => {
    setIsReportDropdownOpen((prev) => !prev);
  };

  return (
    <SidebarContainer>
      <Logo>
        <img src="src/assets/react.svg" alt="Logo" />
        <span>Control de Cobros</span>
      </Logo>
      <Menu>
        <MenuItem>
        
          <StyledLink to="/home">
            <FaTachometerAlt />
            <span>Panel</span>
          </StyledLink>
        </MenuItem>
        <MenuItem>
          <StyledLink to="/pagos">
            <FaWallet />
            <span>Pagos</span>
          </StyledLink>
        </MenuItem>
        <MenuItem>
          <StyledLink to="/estudiantes">
            <FaUser />
            <span>Estudiantes</span>
          </StyledLink>
        </MenuItem>
        <MenuItem>
          <StyledLink to="/modulos">
            <FaLayerGroup />
            <span>Módulos</span>
          </StyledLink>
        </MenuItem>
        <MenuItem>
          <DropdownContainer>
            <DropdownButton onClick={toggleReportDropdown}>
              <FaChartPie />
              <span>Reportes</span>
              <FaChevronDown />
            </DropdownButton>
            <DropdownMenu open={isReportDropdownOpen}>
              <DropdownItem to="/informe-modulos">Informes Módulos</DropdownItem>
              <DropdownItem to="/informes-globales">Informes Generales</DropdownItem>
            </DropdownMenu>
          </DropdownContainer>
        </MenuItem>
        <MenuItem>
          <StyledLink to="/calendario">
            <FaCalendarAlt />
            <span>Calendario</span>
          </StyledLink>
        </MenuItem>
        <MenuItem>
          <StyledLink to="/configuraciones">
            <FaCog />
            <span>Configuraciones</span>
          </StyledLink>
        </MenuItem>
        <MenuItem>
          <LogoutButton onClick={onLogout}>
            <FaPowerOff />
            <span>Cerrar Sesión</span>
          </LogoutButton>
        </MenuItem>
      </Menu>
    </SidebarContainer>
  );
}

export default Sidebar;
