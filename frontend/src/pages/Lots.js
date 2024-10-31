import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { BsPencil, BsDashCircle } from 'react-icons/bs';

const Lots = () => {
    const [lots, setLots] = useState([]);
    const [lot, setLot] = useState({ name: '', area: '' });
    const [username, setUsername] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editLotId, setEditLotId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10); // Número de lotes por página
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/');
    }

    const goToDisabledLots = () => {
        navigate('/lots/disabled');
    };

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

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        navigate('/');
    }, [navigate]);

    const fetchLots = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:4000/api/lots/all', {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Response data:', response.data);
            setLots(response.data.lots || []);
        } catch (error) {
            console.error('Error al obtener lotes:', error);
        }
    }, []);

    const createLot = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:4000/api/lots/create', lot, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLots([...lots, response.data]);
            setLot({ name: '', area: '' });
        } catch (error) {
            console.error('Error creando lote:', error);
        }
    };

    const editLot = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:4000/api/lots/update/${id}`, lot, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLots(lots.map((l) => (l._id === id ? response.data : l)));
            setEditMode(false);
            setEditLotId(null);
            setLot({ name: '', area: '' });
        } catch (error) {
            console.error('Error actualizando lote:', error);
        }
    };

    const handleEditClick = (id) => {
        const lotToEdit = lots.find((l) => l._id === id);
        if (lotToEdit) {
            setLot({ name: lotToEdit.name, area: lotToEdit.area });
            setEditLotId(id);
            setEditMode(true);
        }
    };

    const disableLot = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:4000/api/lots/disable/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchLots(); // Refresca la lista de lotes después de eliminar
        } catch (error) {
            console.error('Error deshabilitando lote:', error);
        }
    };

    useEffect(() => {
        fetchUsername();
        fetchLots();
    }, [fetchLots, fetchUsername]);

    // Calcular la paginación
    const totalPages = Math.ceil(lots.length / limit);
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const currentLots = lots.slice(startIndex, endIndex);

    return (
        <div>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container fluid>
                    <Navbar.Brand as={Link} to="/dashboard" className='mb-0 h1'>Stock Manager</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                            <Nav.Link as={Link} to="/products">Productos</Nav.Link>
                            <Nav.Link as={Link} to="/lots">Lotes</Nav.Link>
                            <Nav.Link as={Link} to="/usage">Registro de Usos</Nav.Link>
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

            <h1 className='text-center mt-2'>Gestión de Lotes</h1>
            <div className='mt-5 p-4'>
                <div className='row'>
                    <div className='col-3'>
                        <div className='card mb-4'>
                            <div className='card-header text-center'>{editMode ? 'Editar Lote' : 'Agregar Nuevo Lote'}</div>
                            <div className='card-body'>
                                <form onSubmit={(e) => { e.preventDefault(); editMode ? editLot(editLotId) : createLot(); }}>
                                    <div className='mb-3'>
                                        <label className='form-label'>Nombre</label>
                                        <input
                                            type="text"
                                            name='name'
                                            className='form-control'
                                            value={lot.name}
                                            placeholder="Nombre del lote"
                                            onChange={(e) => setLot({ ...lot, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className='mb-3'>
                                        <label className='form-label'>Área</label>
                                        <input
                                            type="number"
                                            name='area'
                                            className='form-control'
                                            value={lot.area}
                                            placeholder="Área (hectáreas)"
                                            onChange={(e) => setLot({ ...lot, area: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className='d-grid gap-2 col-6 mx-auto'>
                                        <button type="submit" className='btn btn-primary'>{editMode ? 'Actualizar' : 'Crear'}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className='col'>
                        {currentLots.length === 0 ? (
                            <div className="text-center">
                                <h4>No hay lotes disponibles.</h4>
                            </div>
                        ) : (
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Nombre</th>
                                        <th scope="col">Área (hectáreas)</th>
                                        <th scope="col">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentLots.map((lot, index) => (
                                        <tr key={lot._id}>
                                            <td>{index + 1}</td>
                                            <td>{lot.name}</td>
                                            <td>{lot.area}</td>
                                            <td>
                                                <button className='btn btn-warning' onClick={() => handleEditClick(lot._id)}><BsPencil /></button>
                                                <button className='btn btn-danger' onClick={() => disableLot(lot._id)}><BsDashCircle /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <button className='btn btn-secondary' onClick={goToDisabledLots}>
                            Ver Lotes Deshabilitados
                        </button>

                    </div>

                    {/* Paginación */}
                    <div className="d-flex justify-content-center mt-4">
                        <button
                            className='btn btn-primary me-2'
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1} // Deshabilitar si está en la primera página
                        >
                            Anterior
                        </button>
                        <span className="mx-2">Página {currentPage}</span>
                        <button
                            className='btn btn-primary ms-2'
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={currentPage === totalPages} // Deshabilitar si está en la última página
                        >
                            Siguiente
                        </button>
                    </div>

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

export default Lots;