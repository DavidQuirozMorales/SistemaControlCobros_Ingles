import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBell } from 'react-icons/fa';
import axios from 'axios';

const HeaderContainer = styled.header`
  width: calc(100% - 250px);
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
  background-color: #2d3142;
  border-bottom: 1px solid #242738;
  position: fixed;
  top: 0;
  left: 250px;
  z-index: 1000;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const NotificationIconWrapper = styled.div`
  position: relative;
  margin-right: 15px;
  cursor: pointer;

  .icon {
    font-size: 22px;
    color: #adb5bd;
    transition: color 0.3s ease;

    &:hover {
      color: #5dade2;
    }
  }

  .badge {
    position: absolute;
    top: -5px;
    right: -10px;
    background-color: #e74c3c;
    color: #ffffff;
    font-size: 12px;
    font-weight: bold;
    border-radius: 50%;
    padding: 2px 6px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 40px;
  right: 0;
  background: #2d3142;
  color: #ffffff;
  border-radius: 5px;
  width: 300px;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1001;
`;

const NotificationItem = styled.div`
  padding: 10px;
  border-bottom: 1px solid #424866;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #424866;
  }

  &.sin-leer {
    background: #2e7d32;
  }
`;

const NotificationActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;

  button {
    background: none;
    border: none;
    color: #adb5bd;
    font-size: 0.8rem;
    cursor: pointer;

    &:hover {
      color: #f39c12;
    }
  }
`;

const Username = styled.div`
  font-size: 1rem;
  font-weight: bold;
  color: #ffffff;
  margin-left: 15px;
`;

const Header = ({ username }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleDropdown = () => setDropdownVisible(!dropdownVisible);

  // Cargar notificaciones y contador
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notificacionesRes, countRes] = await Promise.all([
          axios.get('http://localhost:3001/api/notificaciones'),
          axios.get('http://localhost:3001/api/notificaciones/count'),
        ]);

        setNotificaciones(notificacionesRes.data);
        setUnreadCount(countRes.data.count);
      } catch (error) {
        console.error('Error al cargar datos:', error.response?.data || error.message);
      }
    };

    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Marcar notificación como leída
  const marcarComoLeida = async (id) => {
    try {
      await axios.put(`http://localhost:3001/api/notificaciones/leida/${id}`);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id_notificacion === id ? { ...n, estatus: 'leída' } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  // Eliminar notificación
  const eliminarNotificacion = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/notificaciones/${id}`);
      setNotificaciones((prev) => prev.filter((n) => n.id_notificacion !== id));
    } catch (error) {
      console.error('Error al eliminar la notificación:', error);
    }
  };

  return (
    <HeaderContainer>
      <RightSection>
        <NotificationIconWrapper onClick={toggleDropdown}>
          <FaBell className="icon" />
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </NotificationIconWrapper>
        {dropdownVisible && (
          <Dropdown>
            {notificaciones.length > 0 ? (
              notificaciones.map((noti) => (
                <NotificationItem
                  key={noti.id_notificacion}
                  className={noti.estatus === 'sin leer' ? 'sin-leer' : ''}
                >
                  <div>{noti.mensaje}</div>
                  <NotificationActions>
                    {noti.estatus === 'sin leer' && (
                      <button onClick={() => marcarComoLeida(noti.id_notificacion)}>
                        Marcar como leída
                      </button>
                    )}
                    <button onClick={() => eliminarNotificacion(noti.id_notificacion)}>
                      Eliminar
                    </button>
                  </NotificationActions>
                </NotificationItem>
              ))
            ) : (
              <div style={{ padding: '10px', textAlign: 'center' }}>No hay notificaciones</div>
            )}
          </Dropdown>
        )}
        <Username>Bienvenido, {username}</Username>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;
