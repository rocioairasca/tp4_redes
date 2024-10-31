import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsPencil, BsDashCircle } from "react-icons/bs";

const Usage = () => {
    const [usages, setUsages] = useState([]);
    const [usage, setUsage] = useState({
        product: '',
        amount: '',
        unit: '',
        lots: [],
        totalArea: '',
        crop: '',
        user: '',
        date: ''
    });
    const [editMode, setEditMode] = useState(false);
    const [editUsageId, setEditUsageId] = useState(null);
    const [username, setUsername] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);
    const [totalUsages, setTotalUsages] = useState();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [unit, setUnit] = useState('');
    const [lots, setLots] = useState([]);
    const [selectedLots, setSelectedLots] = useState([]);
    const [totalHectares, setTotalHectares] = useState(0);

    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/');
    }

    const fetchUsername = useCallback(async () => {
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
    }, [navigate, token]);

    const fetchProducts = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:4000/api/products/inventory', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProducts(response.data.products); // Asegúrate de que la respuesta tiene esta estructura
        } catch (error) {
            console.error('Error al obtener los productos:', error);
        }
    }, []);

    const fetchUsages = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:4000/api/usages/history?page=${currentPage}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsages(response.data.usages);
            setTotalUsages(response.data.totalUsages);
        } catch (error) {
            console.error('Error al obtener los registros de uso:', error);
        }
    }, [currentPage, limit, token]);

    const fetchLots = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:4000/api/lots/all', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLots(response.data.lots);
        } catch (error) {
            console.error('Error al obtener los lotes:', error);
        }
    }, []);

    const createUsage = async () => {
        try {
            const updatedUsage = {
                ...usage,
                user: username, // Añade el nombre del usuario aquí
            };

            const response = await axios.post('http://localhost:4000/api/usages/register', updatedUsage, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsages([...usages, response.data]);
            setUsage({
                product: '',
                amount: '',
                unit: '',
                lots: [],
                totalArea: '',
                crop: '',
                user: '',
                date: ''
            });
            fetchUsages();
        } catch (error) {
            console.error('Error creando registro de uso:', error);
        }
    };

    const editUsage = async (id) => {
        try {
            const response = await axios.patch(`http://localhost:4000/api/usages/edit/${id}`, usage, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsages(usages.map((u) => (u._id === id ? response.data : u)));
            setEditMode(false);
            setEditUsageId(null);
            setUsage({
                product: '',
                amount: '',
                unit: '',
                lots: [],
                totalArea: '',
                crop: '',
                user: '',
                date: ''
            });
        } catch (error) {
            console.error('Error actualizando registro de uso:', error);
        }
    };

    const handleEditClick = (id) => {
        const usageToEdit = usages.find((u) => u._id === id);
        if (usageToEdit) {
            setUsage({
                product: usageToEdit.product,
                amount: usageToEdit.amount,
                unit: usageToEdit.unit,
                lots: usageToEdit.lots,
                totalArea: usageToEdit.totalArea,
                crop: usageToEdit.crop,
                user: usageToEdit.user,
                date: new Date(usageToEdit.date).toISOString().split('T')[0],
            });
            setEditUsageId(id);
            setEditMode(true);
        }
    };

    // Mapa de unidades
    const unitMap = {
        lt: 'Litros',
        kg: 'Kilogramos',
    };

    // Función para manejar el cambio en la selección del producto
    const handleProductChange = (e) => {
        const selectedProductId = e.target.value;
        const selectedProduct = products.find(prod => prod._id === selectedProductId);

        setUsage({ ...usage, product: selectedProductId });
        setUnit(selectedProduct ? unitMap[selectedProduct.unit] : ''); // Asignar la unidad del producto seleccionado
    };

    // Manejar la selección de múltiples lotes
    const handleLotSelect = (event) => {
        // Obtener los lotes seleccionados desde el evento
        const selectedOptions = Array.from(event.target.selectedOptions).map(option => JSON.parse(option.value));
    
        // Crear un conjunto único de lotes seleccionados (sin duplicados)
        const newSelectedLots = [...selectedLots, ...selectedOptions].reduce((acc, lot) => {
            if (!acc.some(existingLot => existingLot._id === lot._id)) {
                acc.push(lot);
            }
            return acc;
        }, []);
    
        // Sumar las hectáreas de todos los lotes seleccionados
        const newTotalHectares = newSelectedLots.reduce((total, lot) => total + lot.hectares, 0);
    
        // Actualizar los estados con los lotes únicos y el total de hectáreas
        setSelectedLots(newSelectedLots);
        setTotalHectares(newTotalHectares);

        setUsage(prevUsage => ({
            ...prevUsage,
            lots: newSelectedLots,
            totalArea: newTotalHectares
        }));
    };    

    const disableUsage = async (id) => {
        try {
            await axios.patch(`http://localhost:4000/api/usage/disable/${id}`, { isDisabled: true }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsages();
        } catch (error) {
            console.error('Error deshabilitando registro de uso:', error);
        }
    };

    useEffect(() => {
        fetchUsername();
        fetchUsages();
        fetchProducts();
        fetchLots();
    }, [fetchUsername, fetchUsages, fetchProducts, fetchLots]);

    const totalPages = Math.ceil(totalUsages / limit);

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
                            <Navbar.Text className="me-3">Bienvenido, {username}!</Navbar.Text>
                            <Button variant="danger outline-light" onClick={() => { localStorage.removeItem('token'); navigate('/'); }}>Cerrar sesión</Button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <h1 className='text-center mt-2'>Gestión de Registros de Uso</h1>
            <div className='mt-5 p-4'>
                <div className='row'>
                    <div className='col-3'>
                        <div className='card mb-4'>
                            <div className='card-header text-center'>{editMode ? 'Editar Registro de Uso' : 'Agregar Nuevo Registro de Uso'}</div>
                            <div className='card-body'>
                                <form onSubmit={(e) => { e.preventDefault(); editMode ? editUsage(editUsageId) : createUsage(); }}>
                                    {/* Campos del formulario para el registro de uso */}
                                    <div className='mb-3'>
                                        <label className='form-label'>Producto</label>
                                        <select
                                            className='form-control'
                                            value={usage.product}
                                            onChange={handleProductChange}
                                            required
                                        >
                                            <option value="">Seleccionar producto</option>
                                            {products.map((prod) => (
                                                <option key={prod._id} value={prod._id}>{prod.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className='mb-3'>
                                        <label className='form-label'>Cantidad</label>
                                        <input
                                            type='number'
                                            name='amount'
                                            className='form-control'
                                            value={usage.amount}
                                            onChange={(e) => setUsage({ ...usage, amount: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className='mb-3'>
                                        <label className='form-label'>Unidad</label>
                                        <input
                                            className='form-control'
                                            name='unit'
                                            value={unit}
                                            readOnly
                                        >
                                        </input>
                                    </div>
                                    <div className='mb-3'>
                                        <label className='form-label'>Seleccionar Lotes:</label>
                                        <select className='form-control' multiple onChange={handleLotSelect}>
                                            {lots.map((lot) => (
                                                <option key={lot._id} value={JSON.stringify(lot)}>
                                                    {lot.name} - {lot.hectares} hectáreas
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className='mb-3'>
                                        <label className='form-label'>Cultivo</label>
                                        <input
                                            type='text'
                                            name='crop'
                                            className='form-control'
                                            value={usage.crop}
                                            onChange={(e) => setUsage({ ...usage, crop: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className='mb-3'>
                                        <label className='form-label'>Fecha</label>
                                        <input
                                            type='date'
                                            name='date'
                                            className='form-control'
                                            value={usage.date}
                                            onChange={(e) => setUsage({ ...usage, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <Button type='submit' className='w-100'>
                                        {editMode ? 'Actualizar Registro' : 'Agregar Registro'}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className='col-9'>
                        <table className='table table-striped'>
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Unidad</th>
                                    <th>Lotes Seleccionados</th>
                                    <th>Área Total (Hectáreas)</th>
                                    <th>Cultivo</th>
                                    <th>Usuario</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usages.map((u) => (
                                    <tr key={u._id}>
                                        <td>{u.product}</td>
                                        <td>{u.amount}</td>
                                        <td>{u.unit}</td>
                                        <td>
                                            {selectedLots.map(lot => (
                                                <div key={lot._id}>{lot.name}</div>
                                            ))}
                                        </td>
                                        <td>{totalHectares}</td>
                                        <td>{u.crop}</td>
                                        <td>{u.user}</td>
                                        <td>{new Date(u.date).toLocaleDateString()}</td>
                                        <td>
                                            <Button variant="warning" onClick={() => handleEditClick(u._id)}><BsPencil /></Button>
                                            <Button variant="danger" onClick={() => disableUsage(u._id)}><BsDashCircle /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="d-flex justify-content-center align-items-center">
                            <button className="btn btn-primary me-2" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Anterior</button>
                            <span className="mx-2">Página {currentPage}</span>
                            <button className="btn btn-primary ms-2" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Siguiente</button>
                        </div>
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

export default Usage;
