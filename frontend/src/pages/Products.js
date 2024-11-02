import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Form, Input, Select, Pagination, Space, Typography, Drawer } from 'antd';
import { BsPencil, BsDashCircle } from "react-icons/bs";
import { PlusCircleOutlined, LeftCircleOutlined } from '@ant-design/icons';
import { notification } from 'antd';

const { Title } = Typography;
const { Option } = Select;

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
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editProductId, setEditProductId] = useState(null);
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(8);
    const [totalProducts, setTotalProducts] = useState();

    const goToDisabledProducts = () => {
        navigate('/products/disabled');
    };

    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/');
    }

    const openNotification = (type, message, description) => {
        notification[type]({
            message: message,
            description: description,
            placement: 'bottomRight', // Puedes cambiar la posición según tus preferencias
        });
    };

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
            handleDrawerClose();
            fetchProducts();
            openNotification('success', 'Producto Agregado', 'El producto se ha agregado correctamente.');
        } catch (error) {
            console.error('Error creando producto:', error);
            openNotification('error', 'Error al Agregar Producto', error.message);
        }
    };

    const editProduct = async (id) => {
        console.log("ID recibido en editProduct:", id);
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
            setEditProductId(null);
            setProduct({
                name: '',
                type: '',
                totalQuantity: '',
                availableQuantity: '',
                unit: '',
                price: '',
                acquisitionDate: ''
            });
            handleDrawerClose();
            openNotification('success', 'Producto Modificado', 'El producto se ha modificado correctamente.');
        } catch (error) {
            openNotification('error', 'Error al Modificar Producto', error.message);
            if (error.response) {
                console.error('Error de respuesta del servidor:', error.response.data);
                console.error('Código de estado:', error.response.status);
            } else {
                console.error('Error:', error.message);
            }
        }
    };

    const disableProducts = async (id) => {
        try {
            console.log('Deshabilitando producto con ID:', id); // Verifica el ID
            const response = await axios.patch(`http://localhost:4000/api/products/disable/${id}`,
                { isDisabled: true },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Respuesta del servidor:', response.data);
            fetchProducts(); 
            openNotification('success', 'Producto Deshabilitado', 'El producto se ha deshabilitado correctamente.');
        } catch (error) {
            console.error('Error deshabilitando producto:', error);
            openNotification('error', 'Error al Deshabilitar Producto', error.message);
        }

    };

    const handleDrawerClose = () => {
        setIsDrawerOpen(false);
        setProduct({
            name: '',
            type: '',
            totalQuantity: '',
            availableQuantity: '',
            unit: '',
            price: '',
            acquisitionDate: ''
        });
        setEditMode(false);
        setEditProductId(null);
    };

    const handleFormSubmit = async () => {
        if (editMode) {
            await editProduct(editProductId);
        } else {
            await createProduct();
        }
        fetchProducts();
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
                acquisitionDate: new Date(prodToEdit.acquisitionDate).toISOString().split('T')[0],
            });
            setEditProductId(id);
            setEditMode(true);
            setIsDrawerOpen(true);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [navigate, fetchProducts]);

    const columns = [
        { title: '#', dataIndex: 'index', key: 'index', render: (_, __, index) => index + 1 },
        { title: 'Nombre', dataIndex: 'name', key: 'name' },
        { title: 'Tipo', dataIndex: 'type', key: 'type' },
        {
            title: 'Cantidad Total',
            dataIndex: 'totalQuantity',
            key: 'totalQuantity',
            render: (text, record) => (
                <span>
                    {record.totalQuantity} {record.unit === 'lt' ? 'Lt' : 'Kg'}
                </span>
            )
        },
        {
            title: 'Cantidad Disponible',
            dataIndex: 'availableQuantity',
            key: 'availableQuantity',
            render: (text, record) => (
                <span>
                    {record.availableQuantity} {record.unit === 'lt' ? 'Lt' : 'Kg'}
                </span>
            )
        },
        {
            title: 'Precio',
            dataIndex: 'price',
            key: 'price',
            render: (text, record) => (
                <span>
                    ${parseFloat(record.price).toFixed(2)}
                </span>
            )
        },
        {
            title: 'Fecha de Adquisición',
            dataIndex: 'acquisitionDate',
            key: 'acquisitionDate',
            render: (text, record) => {
                const date = new Date(record.acquisitionDate);
                const formattedDate = date.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                return formattedDate;
            }
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="primary" icon={<BsPencil />} onClick={() => handleEditClick(record._id)} />
                    <Button type="primary" danger icon={<BsDashCircle />} onClick={() => disableProducts(record._id)} />
                </Space>

            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2} className='text-center'>Gestión de Productos</Title>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <Button type="primary" icon={<PlusCircleOutlined />} size='large' onClick={() => setIsDrawerOpen(true)}>
                    Agregar Producto
                </Button>
                <Button type="default" icon={<LeftCircleOutlined />} size='large' onClick={goToDisabledProducts}>
                    Ver Productos Deshabilitados
                </Button>
            </div>

            <Table
                dataSource={products}
                columns={columns}
                pagination={false}
                rowKey="_id"
                style={{ width: '100%' }}
            />

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                <Pagination
                    current={currentPage}
                    pageSize={limit}
                    total={totalProducts}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                />
            </div>

            <Drawer
                title={editMode ? 'Editar Producto' : 'Agregar Producto'}
                width={400}
                onClose={handleDrawerClose}
                visible={isDrawerOpen}
            >
                <Form layout="vertical" onFinish={handleFormSubmit}>
                    <Form.Item label="Nombre" required>
                        <Input
                            value={product.name}
                            onChange={(e) => setProduct({ ...product, name: e.target.value })}
                        />
                    </Form.Item>
                    <Form.Item label="Tipo" required>
                        <Select
                            value={product.type}
                            onChange={(value) => setProduct({ ...product, type: value })}
                        >
                            <Option value="Líquido">Líquido</Option>
                            <Option value="Polvo">Polvo</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Cantidad Total" required>
                        <Input
                            type="number"
                            value={product.totalQuantity}
                            onChange={(e) => setProduct({ ...product, totalQuantity: e.target.value })}
                        />
                    </Form.Item>
                    <Form.Item label="Unidad" required>
                        <Select
                            value={product.unit}
                            onChange={(value) => setProduct({ ...product, unit: value })}
                        >
                            <Option value="lt">Litros</Option>
                            <Option value="kg">Kilogramos</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Precio" required>
                        <Input
                            type="number"
                            value={product.price}
                            onChange={(e) => setProduct({ ...product, price: e.target.value })}
                        />
                    </Form.Item>
                    <Form.Item label="Fecha de Adquisición" required>
                        <Input
                            type="date"
                            value={product.acquisitionDate}
                            onChange={(e) => setProduct({ ...product, acquisitionDate: e.target.value })}
                        />
                    </Form.Item>
                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Button type="primary" htmlType="submit" icon={<PlusCircleOutlined />} size='large'>
                                {editMode ? 'Guardar Cambios' : 'Agregar'}
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Drawer>
        </div>
    );
};

export default Products;