import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Pagination, Space, Typography, message, Modal} from 'antd';
import { PlusCircleOutlined, LeftCircleOutlined } from '@ant-design/icons';
import { BsPencil, BsDashCircle } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import UsageForm from './UsageForm';

const { Title } = Typography;

const Usage = () => {
    const [usages, setUsages] = useState([]);
    const [products, setProducts] = useState([]);
    const [lots, setLots] = useState([]);
    const [username, setUsername] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalUsages, setTotalUsages] = useState(0);
    const [visible, setVisible] = useState(false);
    const [editingUsage, setEditingUsage] = useState(null);
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const [limit] = useState(8);

    const goToDisabledUsage = () => {
        navigate('/usage/disabled');
    };

    const fetchUsages = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:4000/api/usages/history?page=${currentPage}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsages(response.data.usages);
            setTotalUsages(response.data.totalUsages);
        } catch (error) {
            console.error('Error al obtener los registros de uso:', error);
        }
    }, [currentPage, token]);

    const fetchProducts = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/products/inventory', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProducts(response.data.products);
        } catch (error) {
            message.error('Error al cargar productos');
        }
    }, [token]);

    const fetchLots = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/lots/all', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLots(response.data.lots);
        } catch (error) {
            message.error('Error al cargar lotes');
        }
    }, [token]);

    const fetchUsername = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsername(response.data.name);
        } catch (error) {
            message.error('Error al cargar el usuario');
        }
    }, [token]);

    useEffect(() => {
        fetchUsages();
        fetchProducts();
        fetchLots();
        fetchUsername();
    }, [fetchUsages, fetchProducts, fetchLots, fetchUsername]);

    const handleEdit = (record) => {
        setEditingUsage(record);
        setVisible(true);
    };

    const handleAdd = () => {
        setEditingUsage(null);
        setVisible(true);
    };

    const disableUsage = async (recordId) => {
        Modal.confirm({
            title: '¿Estás seguro de que quieres deshabilitar este registro?',
            onOk: async () => {
                try {
                    await axios.patch(`http://localhost:4000/api/usages/disable/${recordId}`, {}, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    message.success('Registro deshabilitado con éxito');
                    fetchUsages(); // Recargar la lista de registros después de deshabilitar
                } catch (error) {
                    message.error('Error al deshabilitar el registro');
                }
            },
        });
    };

    const columns = [
        { title: '#', dataIndex: 'index', key: 'index', render: (_, __, index) => index + 1 },
        { title: "Producto", dataIndex: ['product', 'name'] },
        { title: "Cantidad", dataIndex: "amount", render: (amount, record) => `${amount} ${record.product.unit}` },
        { title: 'Lotes', dataIndex: 'lots', render: (lotIds) => lotIds.map(id => lots.find(l => l._id === id)?.name).join(', ') },
        { title: "Área Total", dataIndex: "totalArea", render: (text) => `${text} ha` },
        { title: "Cultivo Previo", dataIndex: "prevCrop" },
        { title: "Cultivo Actual", dataIndex: "crop" },
        { title: "Usuario", dataIndex: "user" },
        { title: "Fecha", render: (text, record) => dayjs(record.date).format('DD-MM-YYYY') },
        {
            title: "Acciones",
            render: (_, record) => (
                <Space>
                    <Button type="primary" icon={<BsPencil />} onClick={() => handleEdit(record)} />
                    <Button type="primary" danger icon={<BsDashCircle />} onClick={() => disableUsage(record._id)} />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Title level={2}>Gestión de Registros de Uso</Title>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <Button type="primary" icon={<PlusCircleOutlined />} size='large' onClick={handleAdd}>
                    Agregar Registro
                </Button>
                <Button type="default" icon={<LeftCircleOutlined />} size='large' onClick={goToDisabledUsage}>
                    Ver Registros Deshabilitados
                </Button>
            </div>

            <Table
                dataSource={usages}
                columns={columns}
                rowKey={(record) => record._id}
                pagination={false}
            />

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                <Pagination
                    current={currentPage}
                    pageSize={limit}
                    total={totalUsages}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                />
            </div>

            <UsageForm
                visible={visible}
                onClose={() => setVisible(false)}
                onFetchUsages={fetchUsages}
                editingUsage={editingUsage}
                products={products}
                lots={lots}
                username={username}
            />
        </div>
    );
};

export default Usage;
