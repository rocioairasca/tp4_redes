import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Card, Form, Input, Row, Col, Pagination, message, Space } from 'antd';
import { BsPencil, BsDashCircle } from 'react-icons/bs';
import {LeftCircleOutlined} from '@ant-design/icons';

const Lots = () => {
    const [lots, setLots] = useState([]);
    const [lot, setLot] = useState({ name: '', area: '' });
    const [editMode, setEditMode] = useState(false);
    const [editLotId, setEditLotId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(8); // Mostrar máximo 8 lotes por página
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/');
    }

    const goToDisabledLots = () => {
        navigate('/lots/disabled');
    };

    const fetchLots = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:4000/api/lots/all', {
                headers: { Authorization: `Bearer ${token}` },
            });
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
            message.success('Lote creado exitosamente');
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
            message.success('Lote actualizado exitosamente');
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
            fetchLots();
            message.success('Lote deshabilitado exitosamente');
        } catch (error) {
            console.error('Error deshabilitando lote:', error);
        }
    };

    useEffect(() => {
        fetchLots();
    }, [fetchLots]);

    const startIndex = (currentPage - 1) * limit;
    const currentLots = lots.slice(startIndex, startIndex + limit);

    const columns = [
        { title: '#', dataIndex: 'index', key: 'index', render: (_, __, index) => index + 1 },
        { title: 'Nombre', dataIndex: 'name', key: 'name' },
        { title: 'Área (hectáreas)', dataIndex: 'area', key: 'area' },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="primary" icon={<BsPencil />} onClick={() => handleEditClick(record._id)} />
                    <Button type="primary" danger icon={<BsDashCircle />} onClick={() => disableLot(record._id)} />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <h1 className='text-center mt-2'>Gestión de Lotes</h1>
            <Row gutter={[16, 16]} className="mt-5 p-4">
                <Col xs={24} md={8}>
                    <Card title={editMode ? 'Editar Lote' : 'Agregar Nuevo Lote'} bordered>
                        <Form layout="vertical" onFinish={editMode ? () => editLot(editLotId) : createLot}>
                            <Form.Item label="Nombre" required>
                                <Input
                                    value={lot.name}
                                    placeholder="Nombre del lote"
                                    onChange={(e) => setLot({ ...lot, name: e.target.value })}
                                />
                            </Form.Item>
                            <Form.Item label="Área" required>
                                <Input
                                    type="number"
                                    value={lot.area}
                                    placeholder="Área (hectáreas)"
                                    onChange={(e) => setLot({ ...lot, area: e.target.value })}
                                />
                            </Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                {editMode ? 'Actualizar' : 'Crear'}
                            </Button>
                        </Form>
                    </Card>
                </Col>

                <Col xs={24} md={16}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                        <Button type="default" icon={<LeftCircleOutlined />} size='large' onClick={goToDisabledLots}>
                            Ver Lotes Deshabilitados
                        </Button>
                    </div>

                    {currentLots.length === 0 ? (
                        <div className="text-center">
                            <h4>No hay lotes disponibles.</h4>
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={currentLots}
                            pagination={false}
                            rowKey="_id"
                        />
                    )}

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                        <Pagination
                            current={currentPage}
                            pageSize={limit}
                            total={lots.length}
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}
                        />
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default Lots;