import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Pagination, Typography } from 'antd';
import { BsPlusCircle } from "react-icons/bs";
import { LeftCircleOutlined } from '@ant-design/icons';
import { notification } from 'antd';

const { Title } = Typography;

const DisabledProducts = () => {
    const [disabledProducts, setDisabledProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [limit] = useState(8);
    const navigate = useNavigate();

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

    const fetchDisabledProducts = useCallback(async (page = 1) => {
        try {
            const response = await axios.get(`http://localhost:4000/api/products/disabled?page=${page}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDisabledProducts(response.data.products);
            setTotalProducts(response.data.totalCount);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error al obtener los productos deshabilitados:', error);
            setDisabledProducts([]);
        }
    }, [limit, token]);

    const enableProduct = async (id) => {
        try {
            await axios.patch(`http://localhost:4000/api/products/enable/${id}`, { disabled: false }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            openNotification('success', 'Producto Habilitado', 'El producto se ha habilitado correctamente.');
            fetchDisabledProducts();
        } catch (error) {
            console.error('Error al habilitar el producto:', error);
            openNotification('error', 'Error al Habilitar Producto', error.message);
        }
    };

    useEffect(() => {
        fetchDisabledProducts(currentPage);
    }, [fetchDisabledProducts, currentPage]);

    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Nombre',
            dataIndex: 'name',
        },
        {
            title: 'Tipo',
            dataIndex: 'type',
        },
        {
            title: 'Cantidad Total',
            dataIndex: 'totalQuantity',
            render: (text, record) => `${record.totalQuantity} ${record.unit === 'lt' ? 'L' : 'Kg'}`,
        },
        {
            title: 'Cantidad Disponible',
            dataIndex: 'availableQuantity',
            render: (text, record) => `${record.availableQuantity} ${record.unit === 'lt' ? 'L' : 'Kg'}`,
        },
        {
            title: 'Precio',
            dataIndex: 'price',
            render: (text) => `$${text ? text.toFixed(2) : 'N/A'}`,
        },
        {
            title: 'Fecha de Adquisición',
            dataIndex: 'acquisitionDate',
            render: (text) => new Date(text).toLocaleDateString('es-ES'),
        },
        {
            title: 'Acciones',
            render: (text, record) => (
                <Space size="middle">
                    <Button type="primary" icon={<BsPlusCircle />} onClick={() => enableProduct(record._id)} />
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2} className='text-center'>Productos Deshabilitados</Title>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <Button type="default" icon={<LeftCircleOutlined />} size='large' onClick={() => navigate('/products')}>
                    Productos
                </Button>
            </div>
            <Table
                dataSource={disabledProducts}
                columns={columns}
                pagination={false}
                rowKey="_id"
                style={{ marginTop: '16px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                <Pagination
                    current={currentPage}
                    pageSize={limit}
                    total={totalProducts}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                    style={{ marginTop: '16px', textAlign: 'center' }}
                />
            </div>
        </div>
    );
};

export default DisabledProducts;


