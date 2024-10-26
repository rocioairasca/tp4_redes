 import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';



const Products = () => {
    const [products, setProducts] = useState([]);
    const [product, setProduct] = useState({ 
        name: '',
        type: '',
        totalQuantity: '',
        availableQuantity: '',
        unit: '',
        price: '',
        acquisitionDate: ''
    });
    const [editMode, setEditMode] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);
    const [totalProducts, setTotalProducts] = useState();

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

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        navigate('/');
    }, [navigate]);

    const fetchProducts = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }
            const response = await axios.get(`http://localhost:4000/api/products/inventory?page=${currentPage}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(response.data);
            setProducts(response.data.products);
            setTotalProducts(response.data.totalProducts);
        } catch (error) {
            console.error('Error al obtener los productos:', error);
        }
    }, [navigate, currentPage, limit]);

    const createProduct = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }
            const response = await axios.post('http://localhost:4000/api/products/create', product, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProducts([...products, response.data]);
            setProduct({ 
                name: '',
                type: '',
                totalQuantity: '',
                availableQuantity: '',
                unit: '',
                price: '',
                acquisitionDate: ''
            });
            fetchProducts(); // Podrías omitir esto si ya has actualizado los productos
        } catch (error) {
            console.error('Error creando producto:', error);
        }
    };

    const editProduct = async (id) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            if (!product.name || !product.type || !product.totalQuantity || !product.availableQuantity || !product.unit || !product.price || !product.acquisitionDate) {
                console.error('Todos los campos son obligatorios.');
                return; // Salir si hay campos obligatorios vacíos
            }

            const response = await axios.put(`http://localhost:4000/api/products/update/${id}`, product, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setProducts(products.map((a) => (a._id === id ? response.data : a)));
            setEditMode(false);
            setProduct({ 
                name: '',
                type: '',
                totalQuantity: '',
                availableQuantity: '',
                unit: '',
                price: '',
                acquisitionDate: ''
            });
        } catch (error) {
            if (error.response) {
                console.error('Error de respuesta del servidor:', error.response.data);
                console.error('Código de estado:', error.response.status);
            } else {
                console.error('Error:', error.message);
            }
        }
    };

    const handleEditClick = (id) => {
        const prodToEdit = products.find((prod) => prod._id === id);
        if (prodToEdit) {
            setProduct({
                name: prodToEdit.name,
                type: prodToEdit.type,
                totalQuantity: prodToEdit.totalQuantity,
                availableQuantity: prodToEdit.availableQuantity,
                unit: prodToEdit.unit,
                price: prodToEdit.price,
                acquisitionDate: prodToEdit.acquisitionDate,
            });
            setEditMode(true); // Cambia a modo edición
        }
    };

    const disableProducts = async () => {
        await Promise.all(
            selectedProducts.map(async (id) => {
                await axios.patch(`http://localhost:4000/api/products/disable/${id}`, { disabled: true });
            })
        );
        fetchProducts();
        setSelectedProducts([]);
    };

    useEffect(() => {
        fetchUsername();
        fetchProducts();
    }, [navigate, fetchProducts, fetchUsername]);

    const totalPages = Math.ceil(totalProducts / limit); // Asegúrate de que `products` contenga la lista completa de productos

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

            <h1 className='text-center mt-2'>Gestión de Productos</h1>
            <div className='mt-5 p-4'>
                <div className='row'>
                    <div className='col-3'>
                        <div className='card mb-4'>
                            <div className='card-header text-center'>{editMode ? 'Editar Producto' : 'Agregar Nuevo Producto'}</div>
                            <div className='card-body'>
                                <form onSubmit={(e) => {e.preventDefault(); editMode ? editProduct() : createProduct();}}>
                                    <div className='mb-3'>
                                        <label className='form-label'>Nombre</label>
                                        <input
                                            type='text'
                                            name='name'
                                            className='form-control'
                                            value={product.name}
                                            onChange={(e) => setProduct({ ...product, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className='mb-3'>
                                        <label className='form-label'>Tipo</label>
                                        <select
                                            className='form-control'
                                            name='type'
                                            value={product.type}
                                            onChange={(e) => setProduct({ ...product, type: e.target.value })}
                                            required
                                        >
                                            <option value="">Seleccionar tipo</option>
                                            <option value="liquido">Líquido</option>
                                            <option value="polvo">Polvo</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Cantidad Total</label>
                                        <input
                                            type="number"
                                            name='totalQuantity'
                                            className="form-control"
                                            value={product.totalQuantity}
                                            onChange={(e) => setProduct({ ...product, totalQuantity: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Unidad</label>
                                        <select
                                            className="form-control"
                                            name='unit'
                                            value={product.unit}
                                            onChange={(e) => setProduct({ ...product, unit: e.target.value })}
                                            required
                                        >
                                            <option value="">Seleccionar unidad</option>
                                            <option value="lt">Litros</option>
                                            <option value="kg">Kilogramos</option>
                                        </select>
                                    </div>
                                    <div className='mb-3'>
                                        <label className='form-label'>Precio</label>
                                        <input
                                            type='number'
                                            name='price'
                                            className='form-control'
                                            value={product.price}
                                            onChange={(e) => setProduct({ ...product, price: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className='mb-3'>
                                        <label className='form-label'>Fecha de Adquisición</label>
                                        <input
                                            type='date'
                                            name='acquisitionDate'
                                            className='form-control'
                                            value={product.acquisitionDate}
                                            onChange={(e) => setProduct({ ...product, acquisitionDate: e.target.value })}
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
                                    <th scope="col">Tipo</th>
                                    <th scope="col">Cantidad Total</th>
                                    <th scope="col">Cantidad Disponible</th>
                                    <th scope='col'>Precio</th>
                                    <th scope='col'>Fecha de Adquisición</th>
                                    <th scope="col">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((prod, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{prod.name}</td>
                                        <td>{prod.type}</td>
                                        <td style={{ textAlign: 'center' }}>{prod.totalQuantity} {prod.unit === 'lt' ? 'L' : 'Kg'}</td>
                                        <td style={{ textAlign: 'center' }}>{prod.availableQuantity} {prod.unit === 'lt' ? 'L' : 'Kg'}</td>
                                        <td>${prod.price ? prod.price.toFixed(2) : 'N/A'}</td> {/* Muestra el Precio */}
                                        <td style={{ textAlign: 'center' }}>{new Date(prod.acquisitionDate).toLocaleDateString()}</td> {/* Muestra la Fecha de Adquisición */}
                                        <td>
                                            <button className='btn btn-warning' onClick={() => handleEditClick(prod._id)}>
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button className='btn btn-danger' onClick={() => disableProducts(prod._id)}>
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        <div className="d-flex justify-content-center align-items-center">
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

                <button className="btn btn-danger mt-3" onClick={disableProducts}>
                    Deshabilitar Productos Seleccionados
                </button>
            </div>

            <footer>
                <div className='container p-3 mt-5 border-top'>
                <small className='d-block text-muted text-center'>&copy; 2024 - Stock Manager</small>
                </div>
            </footer>
        </div>
    );
};

export default Products;