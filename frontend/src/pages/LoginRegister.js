import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Input, Button, message, Tabs, Card } from 'antd';

const LoginRegister = () => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('login');
    const navigate = useNavigate();

    const handleLogin = async (values) => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:4000/api/auth/login', {
                email: values.email,
                password: values.password,
            });
            localStorage.setItem('token', response.data.token);
            message.success('Inicio de sesión exitoso');
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (error) {
            message.error('Error al iniciar sesión');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (values) => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:4000/api/auth/register', {
                name: values.name,
                email: values.email,
                password: values.password,
            });
            message.success('Registro exitoso');
            console.log(response.data);
        } catch (error) {
            message.error('Error al registrar');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <Card style={{ width: 500 }}>
                <Tabs 
                    activeKey={activeTab} 
                    onChange={(key) => setActiveTab(key)}
                    centered
                >
                    <Tabs.TabPane tab="Iniciar Sesión" key="login">
                        <Form
                            name="login"
                            layout="vertical"
                            onFinish={handleLogin}
                            autoComplete="off"
                        >
                            <Form.Item
                                label="Correo Electrónico"
                                name="email"
                                rules={[{ required: true, message: 'Ingrese su correo electrónico' }]}
                            >
                                <Input placeholder="Ingrese un correo electrónico" />
                            </Form.Item>

                            <Form.Item
                                label="Contraseña"
                                name="password"
                                rules={[{ required: true, message: 'Ingrese su contraseña' }]}
                            >
                                <Input.Password placeholder="Ingrese su contraseña" />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    style={{ width: '100%' }}
                                >
                                    Iniciar Sesión
                                </Button>
                            </Form.Item>
                        </Form>
                    </Tabs.TabPane>

                    <Tabs.TabPane tab="Registro" key="register">
                        <Form
                            name="register"
                            layout="vertical"
                            onFinish={handleRegister}
                            autoComplete="off"
                        >
                            <Form.Item
                                label="Usuario"
                                name="name"
                                rules={[{ required: true, message: 'Ingrese su nombre de usuario' }]}
                            >
                                <Input placeholder="Ingrese su nombre de usuario" />
                            </Form.Item>

                            <Form.Item
                                label="Correo Electrónico"
                                name="email"
                                rules={[{ required: true, message: 'Ingrese su correo electrónico' }]}
                            >
                                <Input placeholder="Ingrese su correo electrónico" />
                            </Form.Item>

                            <Form.Item
                                label="Contraseña"
                                name="password"
                                rules={[{ required: true, message: 'Ingrese su contraseña' }]}
                            >
                                <Input.Password placeholder="Ingrese su contraseña" />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    style={{ width: '100%' }}
                                >
                                    Registrarse
                                </Button>
                            </Form.Item>
                        </Form>
                    </Tabs.TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default LoginRegister;

