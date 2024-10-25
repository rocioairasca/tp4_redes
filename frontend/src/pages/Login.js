import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBRow,
  MDBCol,
} from 'mdb-react-ui-kit';

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
            navigate('/dashboard');
            console.log(response.data);
        } catch (error) {
            alert('Error al iniciar sesión');
            console.error(error);
        }
    };

    return (
        <MDBContainer fluid className='my-5'>

            <MDBRow className='g-0 align-items-center'>
                <MDBCol col='6'>
                    <MDBCard className='my-5 cascading-right' style={{ background: 'hsla(0, 0%, 100%, 0.55)', backdropFilter: 'blur(30px)' }}>
                        <MDBCardBody className='p-5 shadow-5 text-center'>

                            <h2 className="fw-bold mb-5">Iniciar Sesión</h2>

                            <form onSubmit={handleLogin}>
                                <MDBInput
                                    wrapperClass='mb-4'
                                    label='Correo electrónico'
                                    id='form1'
                                    type='email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <MDBInput
                                    wrapperClass='mb-4'
                                    label='Contraseña'
                                    id='form2'
                                    type='password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                <MDBBtn type="submit" className='w-100 mb-4' size='md'>Iniciar Sesión</MDBBtn>
                            </form>

                            <p className="mb-0">
                                ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
                            </p>

                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>

                <MDBCol col='6'>
                    <img src="https://mdbootstrap.com/img/new/ecommerce/vertical/004.jpg" className="w-100 rounded-4 shadow-4" alt="Background" fluid/>
                </MDBCol>
            </MDBRow>

        </MDBContainer>
    );
};

export default Login;
