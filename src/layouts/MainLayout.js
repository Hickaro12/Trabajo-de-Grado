import React from 'react';
import '../styles/global.css';

const MainLayout = ({ children }) => {
    return (
        <div className="layout">
            <main>{children}</main>
        </div>
    );
};

export default MainLayout;
