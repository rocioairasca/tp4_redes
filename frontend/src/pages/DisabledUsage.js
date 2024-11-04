import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Pagination, message, Space } from 'antd';
import { BsPlusCircle } from "react-icons/bs";
import { LeftCircleOutlined } from '@ant-design/icons';

const DisabledUsage = () => {
    const [disabledUsages, setDisabledUsages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [limit] = useState(8);

    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/');
    }

    const fetchDisabledUsages = useCallback(async (page = 1) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }
            const response = await axios.get(`http://localhost:4000/api/usages/disabled?page=${page}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDisabledUsages(response.data.usages);
            setTotalPages(response.data.totalPages);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error al obtener los usos deshabilitados:', error);
            setDisabledUsages([]);
        }
    }, [navigate, limit]);

    const enableUsage = async (id) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Token no encontrado. Redirigiendo al inicio...');
                navigate('/');
                return;
            }

            await axios.patch(`http://localhost:4000/api/usages/enable/${id}`, { disabled: false }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            fetchDisabledUsages();
            message.success('Uso habilitado exitosamente');
        } catch (error) {
            console.error('Error al habilitar el uso:', error);
        }
    };

    useEffect(() => {
        fetchDisabledUsages(currentPage);
    }, [fetchDisabledUsages, currentPage]);

    const columns = [
        { title: '#', dataIndex: 'index', key: 'index', render: (_, __, index) => index + 1 },
        { title: 'Producto', dataIndex: 'product', key: 'product' },
        { title: 'Cantidad', dataIndex: 'amount', key: 'amount' },
        { title: 'Cultivo', dataIndex: 'crop', key: 'crop' },
        {
            title: 'Fecha',
            dataIndex: 'date',
            key: 'date',
            render: (text) => new Date(text).toLocaleDateString(), // Formato de fecha
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" icon={<BsPlusCircle />} onClick={() => enableUsage(record._id)} />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <h1 className='text-center mt-2'>Registros de Usos Deshabilitados</h1>
            <div className='mt-5 p-4'>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginBottom: '16px' }}>
                    <Button type="default" icon={<LeftCircleOutlined />} size='large' onClick={() => navigate('/usage')}>
                        Registro de Usos
                    </Button>
                </div>
                <Table
                    columns={columns}
                    dataSource={disabledUsages}
                    pagination={false}
                    rowKey="_id"
                    bordered
                />

                {/* Paginación centrada */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                    <Pagination
                        current={currentPage}
                        pageSize={limit}
                        total={totalPages}
                        onChange={(page) => setCurrentPage(page)}
                        showSizeChanger={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default DisabledUsage;
