import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/global.css';
import loginImage from '../Media/Login.png';
import planta1 from '../Media/1.png';
import planta3 from '../Media/3.png';
import planta2 from '../Media/2.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Por favor, ingresa tu correo y contraseña.');
            return;
        }

        try {
            const response = await fetch('https://backend-react-jvqo.onrender.com/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log("📩 Respuesta del servidor:", data);

            if (response.ok && data.message.includes("exitoso")) {
                // Guardar datos completos del usuario
                localStorage.setItem('user', JSON.stringify({
                    email: data.email,
                    username: data.username,
                    score: data.score,
                }));

                navigate('/map');
            } else {
                setError(data.error || 'Credenciales incorrectas.');
            }
        } catch (err) {
            console.error("🔥 Error en la petición:", err);
            setError('Error de conexión con el servidor.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-image-container">
                <img src={loginImage} alt="Santiago de Cali" className="login-image" />
                <h2 className="login-text">
                    <strong>Santiago de Cali</strong><br />
                    Como nunca lo habías visto
                </h2>
            </div>

            <div className="login-form-container">
                <h1 className="login-title">Bienvenido a la Sucursal del Cielo</h1>

                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        className="input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="off"
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        className="input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="off"
                    />
                    <button type="submit" className="button">Log In</button>
                </form>

                <p className="cuenta">Si no tienes cuenta, estás en la olla <br />
                    <Link to="/register" className="link">Regístrate</Link>
                </p>
            </div>

            <img src={planta1} alt="Planta decorativa" className="decorative-plant" />
            <img src={planta3} alt="Planta decorativa derecha" className="decorative-plant-right" />
            <img src={planta2} alt="Planta decorativa superior derecha" className="decorative-plant-top-right" />
        </div>
    );
};

export default Login;
