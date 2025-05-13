import React, { useEffect, useState } from 'react';
import { Html, useProgress } from '@react-three/drei';

const Loader = () => {
    const { progress, active } = useProgress();
    const [delayedDone, setDelayedDone] = useState(false);

    useEffect(() => {
        if (!active) {
            // Añadir una demora mínima de 1 segundo para evitar saltos bruscos
            const timeout = setTimeout(() => {
                setDelayedDone(true);
            }, 1000); // puedes ajustarlo a 1500ms si lo prefieres
            return () => clearTimeout(timeout);
        }
    }, [active]);

    if (!active && delayedDone) return null;

    return (
        <Html center>
            <div style={styles.container}>
                <div style={styles.text}>Cargando... {Math.floor(progress)}%</div>
                <div style={styles.barContainer}>
                    <div style={{ ...styles.bar, width: `${progress}%` }} />
                </div>
            </div>
        </Html>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '1rem 2rem',
        borderRadius: '10px',
        color: 'white',
        fontSize: '1.2rem',
        minWidth: '300px',
    },
    text: {
        marginBottom: '1rem',
    },
    barContainer: {
        width: '100%',
        height: '10px',
        background: '#ffffff30',
        borderRadius: '5px',
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        background: '#3DD2AE',
        transition: 'width 0.3s ease-in-out',
    },
};

export default Loader;
