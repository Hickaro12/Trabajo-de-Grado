import React, { useEffect, useState } from 'react';
import '../styles/global.css';
import defaultAvatar from '../Media/user.jpg';

const Navbar = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Obtener el usuario del localStorage o establecer valores por defecto
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            setUser({ email: 'Usuario no registrado', score: 0 }); // Valor por defecto si no hay usuario
        }
    }, []);

    // Mientras el usuario está cargando
    if (!user) {
        return <nav className="navbar">Cargando...</nav>;
    }

    return (
        <nav className="navbar">
            <div className="user-info">
                <img src={defaultAvatar} alt="Usuario" className="user-avatar" />
                <div className="user-details">
                    <span className="user-name">{user.email}</span>
                    <span className="user-score">{user.score} puntos</span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
