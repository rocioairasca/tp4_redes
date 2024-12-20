import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Pagination, message, Space } from 'antd';
import { BsPlusCircle } from "react-icons/bs";
import {LeftCircleOutlined} from '@ant-design/icons';

const DisabledLots = () => {
    const [disabledLots, setDisabledLots] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [limit] = useState(8);

    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/');
    }

    const fetchDisabledLots = useCallback(async (page = 1) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }
            const response = await axios.get(`http://localhost:4000/api/lots/disabled?page=${page}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDisabledLots(response.data.lots);
            setTotalPages(response.data.totalPages);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error al obtener los lotes deshabilitados:', error);
            setDisabledLots([]);
        }
    }, [navigate, limit]);

    const enableLot = async (id) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Token no encontrado. Redirigiendo al inicio...');
                navigate('/');
                return;
            }

            await axios.patch(`http://localhost:4000/api/lots/enable/${id}`, { disabled: false }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            fetchDisabledLots();
            message.success('Lote habilitado exitosamente');
        } catch (error) {
            console.error('Error al habilitar el lote:', error);
        }
    };

    useEffect(() => {
        fetchDisabledLots(currentPage);
    }, [fetchDisabledLots, currentPage]);

    const columns = [
        { title: '#', dataIndex: 'index', key: 'index', render: (_, __, index) => index + 1 },
        { title: 'Nombre', dataIndex: 'name', key: 'name' },
        { title: 'Área (hectáreas)', dataIndex: 'area', key: 'area' },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" icon={<BsPlusCircle />} onClick={() => enableLot(record._id)} />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <h1 className='text-center mt-2'>Lotes Deshabilitados</h1>
            <div className='mt-5 p-4'>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginBottom: '16px' }}>
                    <Button type="default" icon={<LeftCircleOutlined />} size='large' onClick={() => navigate('/lots')}>
                        Lotes
                    </Button>
                </div>
                <Table
                    columns={columns}
                    dataSource={disabledLots}
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

export default DisabledLots;

