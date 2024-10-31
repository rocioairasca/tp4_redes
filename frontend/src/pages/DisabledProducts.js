import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { BsArrowBarLeft, BsPlusCircle } from "react-icons/bs";

const DisabledProducts = () => {
    const [disabledProducts, setDisabledProducts] = useState([]);
    const [username, setUsername] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [limit] = useState(10);

    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/');
    }

    const fetchUsername = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }
            const response = await axios.get('http://localhost:4000/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsername(response.data.name);
        } catch (error) {
            console.error('Error al obtener el nombre de usuario:', error);
            if (error.response && error.response.status === 401) {
                navigate('/');
            }
        }
    }, [navigate]);

    const fetchDisabledProducts = useCallback(async (page = 1) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }
            const response = await axios.get(`http://localhost:4000/api/products/disabled?page=${page}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDisabledProducts(response.data.products);
            setTotalPages(response.data.totalPages);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error al obtener los productos deshabilitados:', error);
            setDisabledProducts([]);
        }
    }, [navigate, limit]);

    const enableProduct = async (id) => {
        try {
            // Obtén el token del local storage
            const token = localStorage.getItem('token');

            // Controla si el token existe
            if (!token) {
                console.error('Token no encontrado. Redirigiendo al inicio...');
                navigate('/'); // Redirige si no hay token
                return;
            }

            // Realiza la solicitud PATCH
            await axios.patch(`http://localhost:4000/api/products/enable/${id}`,
                { disabled: false },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // Actualiza la lista de productos deshabilitados
            fetchDisabledProducts();
        } catch (error) {
            // Muestra el error en consola
            console.error('Error al habilitar el producto:', error);
        }
    };


    useEffect(() => {
        fetchUsername();
        fetchDisabledProducts(currentPage);
    }, [fetchDisabledProducts, fetchUsername, currentPage]);

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
                            <Button variant="danger outline-light" onClick={() => {
                                localStorage.removeItem('token');
                                navigate('/');
                            }}>Cerrar sesión</Button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <h1 className='text-center mt-2'>Productos Deshabilitados</h1>
            <div className='mt-5 p-4'>
                <button className='btn btn-primary' onClick={() => navigate('/products')}>
                    <BsArrowBarLeft /> Productos
                </button>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Nombre</th>
                            <th scope="col">Tipo</th>
                            <th scope="col">Cantidad Total</th>
                            <th scope="col">Cantidad Disponible</th>
                            <th scope='col'>Precio</th>
                            <th scope='col'>Fecha de Adquisición</th>
                            <th scope="col">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(disabledProducts) && disabledProducts.map((prod, index) => (
                            <tr key={prod._id}>
                                <td>{index + 1}</td>
                                <td>{prod.name}</td>
                                <td>{prod.type}</td>
                                <td>{prod.totalQuantity} {prod.unit === 'lt' ? 'L' : 'Kg'}</td>
                                <td>{prod.availableQuantity} {prod.unit === 'lt' ? 'L' : 'Kg'}</td>
                                <td>${prod.price ? prod.price.toFixed(2) : 'N/A'}</td>
                                <td>{new Date(prod.acquisitionDate).toLocaleDateString()}</td>
                                <td>
                                    <button className='btn btn-success' onClick={() => enableProduct(prod._id)}><BsPlusCircle /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="d-flex justify-content-center align-items-center">
                    <button 
                        className='btn btn-primary me-2' 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                        disabled={currentPage === 1}
                    >
                        Anterior
                    </button>
                    <span className="mx-2">Página {currentPage}</span>
                    <button 
                        className='btn btn-primary me-2' 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                        disabled={currentPage === totalPages}
                    >
                        Siguiente
                    </button>
                </div>
            </div>

            <footer>
                <div className='container p-3 mt-5 border-top'>
                    <small className='d-block text-muted text-center'>&copy; 2024 - Stock Manager</small>
                </div>
            </footer>
        </div>
    );
};

export default DisabledProducts;

