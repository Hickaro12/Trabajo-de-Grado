import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';
import UserInfo from './UserInfo';

import planta1 from '../Media/1.png';
import planta3 from '../Media/3.png';
import planta2 from '../Media/2.png';

const clickableNames = [
    "Gatos_de_tejada",
    "Ermita",
    "Musero_de_la_Tertulia",
    "San_Antonio",
    "Tres_Cruces"
];

const imageMap = {
    "Tres_Cruces": require('../Media/cruses.jpg'),
    "San_Antonio": require('../Media/antonio2.jpg'),
    "Musero_de_la_Tertulia": require('../Media/tertulia.jpg'),
    "Ermita": require('../Media/ermita.jpg'),
    "Gatos_de_tejada": require('../Media/gato.jpg')
};

const MapModel = ({ hoveredMesh, setHoveredMesh, setHoveredName, setMousePosition }) => {
    const { scene } = useGLTF('/models/mapa.glb');
    const navigate = useNavigate();

    useEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh && !child.userData.originalColor) {
                child.userData.originalColor = child.material.color.clone();
            }
        });
    }, [scene]);

    return (
        <group scale={[0.25, 0.25, 0.25]} position={[-10, -10, 0]}>
            <primitive object={scene} />
            {scene.children.map((child, index) =>
                child.isMesh ? (
                    <mesh
                        key={index}
                        geometry={child.geometry}
                        material={child.material}
                        onPointerMove={(e) => {
                            e.stopPropagation();
                            setHoveredMesh(child);
                            setHoveredName(child.name);
                            setMousePosition({ x: e.clientX, y: e.clientY });
                        }}
                        onPointerOver={(e) => {
                            e.stopPropagation();
                            setHoveredMesh(child);
                            setHoveredName(child.name);
                            if (clickableNames.includes(child.name)) {
                                document.body.style.cursor = 'pointer';
                            }
                        }}
                        onPointerOut={(e) => {
                            e.stopPropagation();
                            document.body.style.cursor = 'default';
                            setHoveredMesh(null);
                            setHoveredName(null);
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (clickableNames.includes(child.name)) {
                                const routes = {
                                    "Tres_Cruces": "/tres-cruces",
                                    "San_Antonio": "/san-antonio",
                                    "Gatos_de_tejada": "/gatos",
                                    "Ermita": "/bulevard",
                                    "Musero_de_la_Tertulia": "/tertulia"
                                };
                                navigate(routes[child.name] || `/${child.name.replace(/\s+/g, '-').toLowerCase()}`);
                            }
                        }}
                        material-color={
                            hoveredMesh === child
                                ? child.userData.originalColor
                                : hoveredMesh
                                    ? child.userData.originalColor.clone().multiplyScalar(0.5)
                                    : child.userData.originalColor
                        }
                    />
                ) : null
            )}
        </group>
    );
};


const HoverLabel = ({ hoveredName, mousePosition }) => {
    const imageSrc = imageMap[hoveredName];

    return hoveredName ? (
        <div
            style={{
                position: 'fixed',
                left: `${mousePosition.x + 10}px`,
                top: `${mousePosition.y + 10}px`,
                background: 'rgba(61, 210, 174, 0.8)',
                color: 'white',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '14px',
                pointerEvents: 'none',
                transform: 'translate(-50%, -100%)',
                whiteSpace: 'nowrap',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '5px'
            }}
        >
            <span>{formatName(hoveredName)}</span>
            {imageSrc && (
                <img
                    src={imageSrc}
                    alt={hoveredName}
                    style={{
                        width: '80px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '5px'
                    }}
                />
            )}
        </div>
    ) : null;
};

const formatName = (name) => {
    return name
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
};

const CameraSetup = () => {
    const { camera } = useThree();

    useEffect(() => {
        camera.position.set(0, 25, 12);
        camera.lookAt(0, 0, 0);
    }, [camera]);

    return null;
};

const Map3D = () => {
    const [hoveredMesh, setHoveredMesh] = useState(null);
    const [hoveredName, setHoveredName] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [audioError, setAudioError] = useState(false);
    const audioRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.4; // volumen al 40%
            audioRef.current
                .play()
                .then(() => console.log('🔊 Audio reproducido correctamente'))
                .catch(() => setAudioError(true));
        }
    }, []);

    return (
        <div className="map-container">
            <HoverLabel hoveredName={hoveredName} mousePosition={mousePosition} />
            <Canvas
                style={{ width: '100vw', height: '100vh' }}
                onPointerMissed={() => {
                    setHoveredMesh(null);
                    setHoveredName(null);
                }}
            >
                <ambientLight intensity={0.7} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <CameraSetup />
                <MapModel
                    hoveredMesh={hoveredMesh}
                    setHoveredMesh={setHoveredMesh}
                    setHoveredName={setHoveredName}
                    setMousePosition={setMousePosition}
                />
                <OrbitControls minDistance={5} maxDistance={120} enablePan={false} />
            </Canvas>

            <img src={planta1} alt="Planta decorativa" className="decorative-plant-M" />
            <img src={planta3} alt="Planta decorativa derecha" className="decorative-plant-right-M" />
            <img src={planta2} alt="Planta decorativa superior derecha" className="decorative-plant-top-right-M" />

            <UserInfo />
            <div className="quiz-button" onClick={() => navigate('/quiz')}>
                🎯 Pon a prueba tus conocimientos
            </div>
            <div className="explora-text">
                <div>Explora mi</div>
                <div>Cali bella</div>
            </div>

            {/* Audio de fondo */}
            <audio ref={audioRef} src="/Media/mapa.mp3" loop preload="auto" />
            {audioError && (
                <button
                    className="audio-unlock-button"
                    onClick={() => {
                        audioRef.current.volume = 0.4; // aseguramos volumen bajo también aquí
                        audioRef.current.play().then(() => setAudioError(false));
                    }}
                >
                    Activar sonido 🔊
                </button>
            )}
        </div>
    );
};

export default Map3D;
