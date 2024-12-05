import React, { useState } from 'react';
import styled from 'styled-components'; // Añadimos keyframes aquí
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';



const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  position: relative;
  overflow: hidden;

  /* Fondo degradado con tonos suaves y difuminados */
  background: linear-gradient(135deg, #1a1a2e, #2a3b5f, #3c5c8f, #6c63ff);
  background-size: 200% 200%;
  animation: gradientAnimation 10s ease infinite;

  /* Opcional: agrega un desenfoque general */
  filter: blur(0);
`;


const LoginWrapper = styled.div`
  display: flex;
  width: 800px;
  height: 500px;
  background-color: #25273c; /* Fondo oscuro del contenedor */
  border-radius: 12px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
  overflow: hidden;
`;

const LeftPanel = styled.div`
  flex: 1;
  background-color: #6c63ff; /* Color primario del lado izquierdo */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #ffffff;
`;

const LogoWrapper = styled.div`
  position: relative;
  width: 155px; /* Ajuste del tamaño del círculo */
  height: 155px;
  background-color: #ffffff; /* Fondo blanco */
  border-radius: 50%; /* Hace que sea un círculo */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2); /* Sombra más sutil */
`;

const Logo = styled.img`
  width: 152px; /* Logotipo ligeramente más grande */
`;

const WelcomeMessage = styled.h2`
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
`;

const SubMessage = styled.p`
  font-size: 1rem;
  text-align: center;
  margin-top: 10px;
`;

const RightPanel = styled.div`
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #25273c; /* Fondo oscuro del formulario */
`;

const Title = styled.h2`
  margin-bottom: 10px;
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: bold;
`;

const Subtitle = styled.p`
  margin-bottom: 20px;
  color: #b5b5b5;
  font-size: 0.9rem;
`;

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background: none;
  color: #ffffff;
  border: 1px solid #44475a;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #6c63ff;
  }

  &::placeholder {
    color: #7e7e8e;
  }
`;

const PasswordToggleIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #7e7e8e;
  cursor: pointer;

  &:hover {
    color: #ffffff;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #6c63ff;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #5a54d1;
  }
`;

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', {
        username,
        password,
      });

      if (response.data.success) {
        localStorage.setItem('adminName', response.data.username);
        onLogin(response.data.username);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error al intentar hacer login', error);
    }
  };

  return (
    <Container>
      <LoginWrapper>
        {/* Panel izquierdo */}
        <LeftPanel>
  <LogoWrapper>
    <Logo src="src/assets/images/tecnm.png" alt="TecNM Logo" />
  </LogoWrapper>
  <WelcomeMessage>Bienvenido</WelcomeMessage>
  <SubMessage>"Sistema de control de cobros de cursos de inglés en el TecNM/Instituto Tecnológico de Tuxtepec"</SubMessage>
</LeftPanel>

        {/* Panel derecho */}
        <RightPanel>
          <Title>Iniciar Sesion</Title>
          <Subtitle>Ingrese los detalles de la cuenta</Subtitle>
          <form onSubmit={handleSubmit}>
            <InputContainer>
              <Input
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </InputContainer>
            <InputContainer>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordToggleIcon onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </PasswordToggleIcon>
            </InputContainer>
            <Button type="submit">Iniciar Sesion</Button>
          </form>
        </RightPanel>
      </LoginWrapper>
    </Container>
  );
};

export default Login;
