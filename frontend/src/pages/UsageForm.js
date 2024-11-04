// UsageForm.js
import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Select, DatePicker, message, Drawer } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';

const { Option } = Select;

const UsageForm = ({ visible, onClose, onFetchUsages, editingUsage, products, lots, username }) => {
    const [form] = Form.useForm();
    const [unit, setUnit] = useState('');
    const [selectedLots, setSelectedLots] = useState([]);
    const [totalArea, setTotalArea] = useState(0);

    // Obtén el token del almacenamiento local
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (editingUsage) {
            form.setFieldsValue({
                ...editingUsage,
                date: dayjs(editingUsage.date),
                product: editingUsage.product?._id,
            });
            setSelectedLots(editingUsage.lots);
            setTotalArea(editingUsage.totalArea);
            setUnit(editingUsage.product?.unit || '');
        } else {
            form.resetFields();
            setSelectedLots([]);
            setTotalArea(0);
            setUnit('');
        }
        // console.log('Selected lots after setting:', selectedLots);
    }, [editingUsage, form]);

    const handleProductChange = (value) => {
        const product = products.find((p) => p._id === value);
        if (product) {
            setUnit(product.unit);
            form.setFieldValue('product', value);
        }
    };

    const handleLotChange = (selectedItems) => {
        setSelectedLots(selectedItems);
        const total = selectedItems.reduce((acc, lotId) => {
            const lot = lots.find(l => l._id === lotId);
            return acc + (lot ? lot.area : 0);
        }, 0);
        setTotalArea(total);
    };

    const handleSubmit = async () => {
        const values = form.getFieldsValue();
        try {
            const headers = {
                Authorization: `Bearer ${token}`,
            };

            if (editingUsage) {
                await axios.patch(`http://localhost:4000/api/usages/edit/${editingUsage._id}`, {
                    ...values,
                    lots: selectedLots,
                    totalArea,
                    user: username,
                }, { headers });
                message.success('Registro actualizado exitosamente');
            } else {
                await axios.post('http://localhost:4000/api/usages/register', {
                    ...values,
                    user: username,
                    totalArea,
                }, { headers });
                message.success('Registro de uso creado exitosamente');
            }
            onFetchUsages();
            onClose();
        } catch (error) {
            message.error('Error al guardar el registro: ' + error.response.data.message);
        }
    };

    return (
        <Drawer
            title={editingUsage ? "Editar Uso de Producto" : "Registrar Uso de Producto"}
            placement="right"
            onClose={onClose}
            open={visible}
        >
            <Form layout="vertical" form={form} onFinish={handleSubmit}>
                <Form.Item label="Producto" name="product" rules={[{ required: true }]}>
                    <Select onChange={handleProductChange}>
                        {products.map((product) => (
                            <Option key={product._id} value={product._id}>
                                {product.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label="Cantidad" name="amount" rules={[{ required: true }]}>
                    <Input type="number" />
                </Form.Item>

                <Form.Item label="Unidad">
                    <Input value={unit} readOnly />
                </Form.Item>

                <Form.Item label="Seleccionar Lotes" name="lots">
                    <Select
                        mode="multiple"
                        value={selectedLots.map(lot => lot._id)} // Mapea los IDs
                        onChange={handleLotChange}
                    >
                        {lots.map((lot) => (
                            <Option key={lot._id} value={lot._id}>
                                {lot.name} - {lot.area}ha
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label="Cultivo Previo" name="prevCrop">
                    <Input />
                </Form.Item>

                <Form.Item label="Cultivo Actual" name="crop">
                    <Input />
                </Form.Item>

                <Form.Item label="Fecha" name="date" rules={[{ required: true }]}>
                    <DatePicker />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<PlusCircleOutlined />}>
                        {editingUsage ? "Actualizar Registro de Uso" : "Registrar Uso de Producto"}
                    </Button>
                </Form.Item>
            </Form>
        </Drawer>
    );
};

export default UsageForm;


