import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsPencil, BsDashCircle } from "react-icons/bs";

const Lots = () => {
    const [lots, setLots] = useState([]);
    const [lot, setLot] = useState({ name: '', area: '' });
    const [editMode, setEditMode] = useState(false);
    const [editLotId, setEditLotId] = useState(null);
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const fetchUsername = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        try {
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

    const fetchLots = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        try {
            const response = await axios.get('http://localhost:4000/api/lots/all', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLots(response.data);
        } catch (error) {
            console.error('Error al obtener los lotes:', error);
        }
    }, [navigate]);

    const createLot = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        try {
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
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        try {
            const response = await axios.put(`http://localhost:4000/api/lots/update/${id}`, lot, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLots(lots.map((a) => (a._id === id ? response.data : a)));
            setEditMode(false);
            setEditLotId(null);
            setLot({ name: '', area: '' });
        } catch (error) {
            console.error('Error editando lote:', error);
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
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        try {
            await axios.delete(`http://localhost:4000/api/lots/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLots(lots.filter((l) => l._id !== id));
        } catch (error) {
            console.error('Error deshabilitando lote:', error);
        }
    };

    useEffect(() => {
        fetchUsername();
        fetchLots();
    }, [fetchUsername, fetchLots]);

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
                            <Nav.Link as={Link} to="/lots">Lotes</Nav.Link>
                        </Nav>
                        <Nav className="ms-auto">
                            <Navbar.Text className="me-3">
                                Bienvenido, {username}!
                            </Navbar.Text>
                            <Button variant="danger outline-light" onClick={() => { localStorage.removeItem('token'); navigate('/'); }}>Cerrar sesión</Button>
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
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    editMode ? editLot(editLotId) : createLot();
                                }}>
                                    <div className='mb-3'>
                                        <label className='form-label'>Nombre</label>
                                        <input
                                            type='text'
                                            className='form-control'
                                            value={lot.name}
                                            onChange={(e) => setLot({ ...lot, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className='mb-3'>
                                        <label className='form-label'>Área (hectáreas)</label>
                                        <input
                                            type='number'
                                            className='form-control'
                                            value={lot.area}
                                            onChange={(e) => setLot({ ...lot, area: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className='d-grid gap-2 col-6 mx-auto'>
                                        <button type='submit' className='btn btn-primary'>{editMode ? 'Actualizar' : 'Agregar'}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className='col'>
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
                                {lots.map((l, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{l.name}</td>
                                        <td>{l.area}</td>
                                        <td>
                                            <button className='btn btn-warning' onClick={() => handleEditClick(l._id)}>
                                                <BsPencil />
                                            </button>
                                            <button className='btn btn-danger' onClick={() => disableLot(l._id)}>
                                                <BsDashCircle />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
