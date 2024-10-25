import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [product, setProduct] = useState({ name: '', type: '', quantity: '' });
    const [editMode, setEditMode] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/products/inventory');
            setProducts(response.data);
        } catch (error) {
            console.error('Error al obtener los productos:', error);
        }
    };

    const createProduct = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post ('http://localhost:4000/api/products/create', products, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProducts([...products, response.data]);
            setProduct({ name: '', type: '', quantity: ''});
            fetchProducts();
        } catch (error) {
            console.error('Error creando producto:', error);
        }
    };

    const editProduct = async (id) => {
        try {
            const response = await axios.put(`http://localhost:4000/api/products/update/${id}`, products);
            setProducts(products.map((a) => (a._id === id ? response.data : a)));
            setEditMode(false);
        } catch (error) {
            console.error('Error actualizando el producto:', error);
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

    return (
        <div>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand as={Link} to="/dashboard">Mi Aplicación</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                        <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                        <Nav.Link as={Link} to="/products">Productos</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <h1 className='text-center mt-5'>Gestión de Productos</h1>
            <div className='container mt-4'>
                <div className='card mb-4'>
                    <div className='card-header'>{editMode ? 'Editar Producto' : 'Agregar Nuevo Producto'}</div>
                    <div className='card-body'>
                        <form onSubmit={(e) => {e.preventDefault(); editMode ? editProduct(product._id) : createProduct();}}>
                            <div className='mb-3'>
                                <label className='form-label'>Nombre</label>
                                <input
                                    type='text'
                                    className='form-control'
                                    value={product.name}
                                    onChange={(e) => setProduct({ ...product, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className='mb-3'>
                                <label className='form-label'>Tipo</label>
                                <input
                                    type='text'
                                    className='form-control'
                                    value={product.type}
                                    onChange={(e) => setProduct({ ...product, type: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Cantidad (litros o kg)</label>
                                <input
                                type="number"
                                className="form-control"
                                value={product.quantity}
                                onChange={(e) => setProduct({ ...product, quantity: e.target.value })}
                                required
                                />
                            </div>
                            <button type='submit' className='btn btn-primary'>{editMode ? 'Actualizar' : 'Agregar'}</button>
                        </form>
                    </div>
                </div>

                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">
                                <input
                                type="checkbox"
                                onChange={(e) => {
                                    if (e.target.checked) {
                                    setSelectedProducts(product.map(a => a._id));
                                    } else {
                                    setSelectedProducts([]);
                                    }
                                }}
                                />
                            </th>
                            <th scope="col">Nombre</th>
                            <th scope="col">Tipo</th>
                            <th scope="col">Cantidad</th>
                            <th scope="col">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((a) => (
                        <tr key={a._id}>
                            <td>
                            <input
                                type="checkbox"
                                checked={selectedProducts.includes(a._id)}
                                onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectedProducts([...selectedProducts, a._id]);
                                } else {
                                    setSelectedProducts(selectedProducts.filter(id => id !== a._id));
                                }
                                }}
                            />
                            </td>
                            <td>{a.name}</td>
                            <td>{a.type}</td>
                            <td>{a.quantity}</td>
                            <td>
                            <button onClick={() => { setProduct(a); setEditMode(true); }} className="btn btn-info">Editar</button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>

                    <button className="btn btn-danger mt-3" onClick={disableProducts}>
                        Deshabilitar Productos Seleccionados
                    </button>
            </div>
        </div>
    );
};

export default Products;