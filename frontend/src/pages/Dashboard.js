// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const Dashboard = ({name}) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
    fetchUsername();
  }, [navigate]);

   // Función para obtener el nombre de usuario
   const fetchUsername = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsername(response.data.name);
    } catch (error) {
      console.error('Error al obtener el nombre de usuario:', error);
    }
  };

  // Función de cierre de sesión
  const handleLogout = () => {
    // Elimina el token de autenticación (aquí asumimos que está en localStorage)
    localStorage.removeItem('token');
    // Redirige al usuario a la página de inicio de sesión
    navigate('/');
  };

  return (
    <div>
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container fluid>
                <Navbar.Brand as={Link} to="/dashboard" className='mb-0 h1'>
                  Stock Manager
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                    <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                    <Nav.Link as={Link} to="/products">Productos</Nav.Link>
                    </Nav>
                    <Nav className="ms-auto">
                    <Navbar.Text className="me-3">
                        Bienvenido, {username}!
                    </Navbar.Text>
                    <Button variant="danger outline-light" onClick={handleLogout}>Cerrar sesión</Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
      
      <Container className="mt-4">
        
      </Container>

      <footer>
        <div className='container p-3 mt-5 border-top'>
          <small className='d-block text-muted text-center'>&copy; 2024 - Stock Manager</small>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
