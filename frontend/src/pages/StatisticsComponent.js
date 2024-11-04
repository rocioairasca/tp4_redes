import React, { useState } from 'react';
import { Card, Spin, Button, Row, Col } from 'antd';
import axios from 'axios';

const StatisticsComponent = () => {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const cleanResponse = (response) => {
        if (typeof response === 'object') {
            return response;
        }
        try {
            const cleanedData = response
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            return JSON.parse(cleanedData);
        } catch (error) {
            console.error("Error al limpiar la respuesta:", error);
            return null;
        }
    };

    const fetchStatistics = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:4000/api/ia/stream-stats');
            const cleanedData = cleanResponse(response.data);
            if (cleanedData) {
                setStatistics(cleanedData);
            } else {
                setError('Error al procesar los datos');
            }
        } catch (err) {
            setError('Error al obtener estadísticas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <Button onClick={fetchStatistics} type="primary" size='large' style={{ marginBottom: '20px' }}>
                Obtener Estadísticas
            </Button>

            {loading ? (
                <Spin tip="Cargando..." />
            ) : error ? (
                <div>{error}</div>
            ) : statistics ? (
                <Row gutter={[16, 16]}>
                    <Col span={8}>
                        <Card title="Producto Más Caro" bordered={false}>
                            <p>Nombre: {statistics.productoMasCaro.name}</p>
                            <p>Precio: ${statistics.productoMasCaro.price}</p>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="Producto Más Barato" bordered={false}>
                            <p>Nombre: {statistics.productoMasBarato.name}</p>
                            <p>Precio: ${statistics.productoMasBarato.price}</p>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="Cantidad de Productos en Polvo" bordered={false}>
                            <p>{statistics.cantidadTipoPolvo}</p>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="Cantidad de Productos en Líquido" bordered={false}>
                            <p>{statistics.cantidadTipoLiquido}</p>
                        </Card>
                    </Col>
                </Row>
            ) : (
                <p>No hay estadísticas para mostrar</p>
            )}
        </div>
    );
};

export default StatisticsComponent;








