import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';
import registerImage from '../Media/Registro.png';
import planta1 from '../Media/1.png';
import planta3 from '../Media/3.png';
import planta2 from '../Media/2.png';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [gender, setGender] = useState('');
    const [username, setUsername] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('https://backend-react-jvqo.onrender.com/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, gender, score: 0 }),
            });

            const data = await response.json();
            console.log("📥 Respuesta del servidor:", data);

            if (response.ok) {
                // Guardar en localStorage también desde el registro
                localStorage.setItem('user', JSON.stringify({
                    username: data.username,
                    email: data.email,
                    score: data.score,
                }));

                setIsRegistered(true);
            } else {
                setError(data.error || 'Ocurrió un error inesperado.');
            }
        } catch (err) {
            console.error("❌ Error en la conexión con el servidor:", err);
            setError('Error de conexión con el servidor.');
        }
    };

    return (
        <div className="register-container">
            <div className="register-header">
                <h2 className="register-title">Registro</h2>
                <p className="register-subtitle">Cali es Cali, lo demás es loma</p>
            </div>

            <div className="register-image-container">
                <img src={registerImage} alt="Registro" className="register-image" />
            </div>

            {isRegistered ? (
                <div className="register-form-container">
                    <h1 className="register-title-2">¡Mira ve!</h1>
                    <p>Ya estás más que listo para ir a recorrer las calles de mi Cali bella, <span className="highlight-ois"> oís.</span></p>
                    <button className="button" onClick={() => navigate('/Login')}>Log In</button>
                </div>
            ) : (
                <div className="register-form-container">
                    <h1 className="login-title">
                        Hagamos un recorrido virtual por Cali vé, la sucursal mundial de la salsa
                    </h1>

                    {error && <p className="error-message">{error}</p>}

                    <form onSubmit={handleRegister}>
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Nombre de usuario"
                            className="input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />

                        <select
                            className="input-select"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                        >
                            <option value="">Género</option>
                            <option value="male">Masculino</option>
                            <option value="female">Femenino</option>
                            <option value="other">Otro</option>
                        </select>
                        <button className="button">Siguiente</button>
                    </form>
                </div>
            )}

            <img src={planta1} alt="Planta decorativa" className="decorative-plant" />
            <img src={planta3} alt="Planta decorativa derecha" className="decorative-plant-right" />
            <img src={planta2} alt="Planta decorativa superior derecha" className="decorative-plant-top-right" />
        </div>
    );
};

export default Register;
