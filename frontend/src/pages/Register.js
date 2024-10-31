import React, { useState } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'sonner';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4000/api/auth/register', {
                name,
                email,
                password,
            });
            toast.success('Registro exitoso');
            console.log(response.data);
        } catch (error) {
            toast.error('Error al registrar');
            console.error(error);
        }
    };

    return (
        <div className='d-flex justify-content-center align-items-center vh-100'>
            <Toaster />
            <div className='row'>
                <div className='col'>
                    <div className='card text-center' style={{ width: '500px', height: '400px', display: 'flex', justifyContent: 'space-between' }}>
                        <div className="card-header">
                            <ul className="nav nav-tabs card-header-tabs">
                                <li className="nav-item">
                                    <a className="nav-link" href="/">Iniciar Sesión</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link active" aria-current="true" href="/register">Registro</a>
                                </li>
                            </ul>
                        </div>

                        <h2 className="card-title mt-4">Registro</h2>
                        
                        <div className='card-body d-flex flex-column justify-content-center'>
                            <form onSubmit={handleRegister}>
                                <div className='input-group mb-3'>
                                    <span className='input-group-text'>Usuario</span>
                                    <input
                                        placeholder='Ingrese su nombre de usuario'
                                        className='form-control'
                                        type='text'
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className='input-group mb-3'>
                                    <span className='input-group-text'>Correo Electrónico</span>
                                    <input
                                        placeholder='Ingrese su correo electrónico'
                                        className='form-control'
                                        type='email'
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
                                <button type="submit" className='btn btn-primary w-100 mt-5'>Registrarse</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Register;
