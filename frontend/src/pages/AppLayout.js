import React, { useEffect, useState } from 'react';
import {
    BarChartOutlined,
    FormOutlined,
} from '@ant-design/icons';
import { FiLogOut } from "react-icons/fi";
import { RiPlantLine } from "react-icons/ri";
import { BsBox } from "react-icons/bs";
import { Layout, Menu, theme, Button } from 'antd';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Content, Footer, Sider } = Layout;

const siderStyle = {
    overflow: 'auto',
    height: '100vh',
    position: 'fixed',
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: 'thin',
    scrollbarGutter: 'stable',
};

const items = [
    { key: '1', icon: <BarChartOutlined />, label: <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>Dashboard</Link> },
    { key: '2', icon: <FormOutlined />, label: <Link to="/usage" style={{ textDecoration: 'none', color: 'inherit' }}>Registros de Uso</Link> },
    { key: '3', icon: <BsBox />, label: <Link to="/products" style={{ textDecoration: 'none', color: 'inherit' }}>Productos</Link> },
    { key: '4', icon: <RiPlantLine />, label: <Link to="/lots" style={{ textDecoration: 'none', color: 'inherit' }}>Lotes</Link> },
];

const AppLayout = () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
        }
        fetchUsername();
    }, [navigate]);

    // Función para obtener el nombre de usuario
    const fetchUsername = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:4000/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsername(response.data.name);
        } catch (error) {
            console.error('Error al obtener el nombre de usuario:', error);
        }
    };

    // Función de cierre de sesión
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };


    return (
        <Layout hasSider>
            <Sider style={siderStyle}>
                <div className="logo" style={{ padding: '16px', textAlign: 'center', backgroundColor: '#001529' }}>
                    <h4 style={{ color: 'white', margin: 0 }}>Stock Manager</h4>
                </div>
                <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']} items={items} />

                <div style={{ position: 'absolute', bottom: 16, left: '16px', right: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <p style={{ margin: 0, marginRight: 8 }}>Bienvenido, {username}!</p>
                        <Button color="danger" variant="solid" icon={<FiLogOut />} onClick={handleLogout} size='large'></Button>
                    </div>
                </div>
            </Sider>

            <Layout style={{ marginInlineStart: 200 }}>

                <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
                    <div
                        style={{
                            padding: 24,
                            textAlign: 'center',
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Outlet />
                    </div>
                </Content>

                <Footer style={{ position: 'fixed', bottom: 0, width: '100%', textAlign: 'center' }}>
                    Copyright ©{new Date().getFullYear()} - Stock Manager
                </Footer>

            </Layout>
        </Layout>
    );
};

export default AppLayout;


