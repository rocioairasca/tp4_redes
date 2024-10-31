import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster, toast } from 'sonner';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4000/api/auth/login', {
                email,
                password,
            });
            localStorage.setItem('token', response.data.token);
            toast.success('Inicio de sesión exitoso');

            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
            
            console.log(response.data);
        } catch (error) {
            toast.error('Error al iniciar sesión');
            console.error(error);
        }
    };

    return (
        <div className='d-flex justify-content-center align-items-center vh-100'>
            <Toaster />

            <div className='row'>
                <div className='col'>
                    <div className='card text-center' style={{ width: '500px', height: '400px', display: 'flex', justifyContent: 'space-between'}}>
                        <div class="card-header">
                            <ul class="nav nav-tabs card-header-tabs">
                                <li class="nav-item">
                                    <a class="nav-link active" aria-current="true" href="/">Iniciar Sesión</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="/register">Registro</a>
                                </li>
                            </ul>
                        </div>

                        <h2 className="card-title mt-4">Iniciar Sesión</h2>
                        
                        <div className='card-body d-flex flex-column justify-content-center'>

                            <form onSubmit={handleLogin}>
                                <div className='input-group mb-3'>
                                    <span className='input-group-text'>Correo Electrónico</span>
                                    <input
                                        placeholder='Ingrese un correo electrónico'
                                        className='form-control'
                                        type='text'
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className='input-group mb-3'>
                                    <span className='input-group-text'>Contraseña</span>
                                    <input
                                        placeholder='Ingrese su contraseña'
                                        className='form-control'
                                        type='password'
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className='btn btn-primary w-100 mt-5'>Iniciar Sesión</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
