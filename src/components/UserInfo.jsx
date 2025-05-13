import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from '../Media/user.jpg';
import '../styles/global.css';

const UserInfo = () => {
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const timeoutRef = useRef(null); // ⏱️ para manejar el retraso
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            setUser({ username: 'Usuario no registrado', score: 0 });
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);
            fetch('https://backend-react-jvqo.onrender.com/get-user/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: parsedUser.email }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.username && data.score !== undefined) {
                        const actualizado = {
                            email: data.email,
                            username: data.username,
                            score: data.score,
                        };
                        localStorage.setItem('user', JSON.stringify(actualizado));
                        setUser(actualizado);
                    } else {
                        setUser(parsedUser);
                    }
                })
                .catch(() => setUser(parsedUser));
        } catch (err) {
            setUser({ username: 'Usuario no registrado', score: 0 });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setMenuOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setMenuOpen(false);
        }, 200); // 👈 2 segundos de delay
    };

    if (!user) return null;

    return (
        <div
            className="user-info-box"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <img src={defaultAvatar} alt="Usuario" className="user-avatar-small" />
            <div className="user-info-text">
                <div className="user-email">{user.username}</div>
                <div className="user-score">{user.score} puntos</div>
            </div>

            {menuOpen && (
                <div className="user-menu" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    <div onClick={handleLogout}>Cerrar sesión</div>
                </div>
            )}
        </div>
    );
};

export default UserInfo;
