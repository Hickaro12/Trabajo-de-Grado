import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, useProgress } from '@react-three/drei';
import { Perf } from 'r3f-perf';
import * as THREE from 'three';
import '../styles/global.css';
import Loader from './Loader';
import UserInfo from './UserInfo';
import { useNavigate } from 'react-router-dom';

// 📋 Información de cada gato (todas las claves en minúscula)
const infoGatos = {
    gato1: {
        nombre: 'Gato de Tejada',
        descripcion: 'El parque de los Gatos de Tejada es un espacio vibrante donde familias y amantes del arte disfrutan caminando entre las esculturas de gatos con diseños únicos creados por diversos artistas locales. Este lugar se ha convertido en un símbolo de la creatividad caleña y un punto de orgullo para la ciudad, demostrando cómo el arte urbano puede transformar espacios públicos. Aunque de creación reciente (finales de los 90 e inicios del siglo XXI), los gatos ya forman parte de la identidad de Cali, inspirando historias y anécdotas entre sus visitantes.'
    },
    gato2: {
        nombre: 'Cálida',
        descripcion: 'Representa la calidez y el espíritu acogedor de la ciudad de Cali y su gente.'
    },
    gato3: {
        nombre: 'Gata Florecida Panamericana',
        descripcion: 'Simboliza la diversidad y la riqueza natural de la región, con un diseño que evoca flores y elementos de la identidad panamericana.'
    },
    gato4: {
        nombre: 'La Gata Presa',
        descripcion: 'Omar Rayo: Esta gata encontró en la abstracción geométrica, el blanco, negro y rojo, su forma de expresión y su lenguaje. Ella afirma, como lo ha hecho antes el maestro Rayo: «En mi caso los colores puros son letras de un alfabeto que me pertenece. Entonces, el color es una redundancia, me quedo con la cosa pura, con la cosa directa y elemental». Argumento que se convierte en su más poderosa arma de conquista.'
    },
    gato6: {
        nombre: 'Yara, la diosa de las aguas',
        descripcion: 'María Teresa Negreiros: De las profundidades de la selva amazónica llega para tratar de conquistar al Gato del Río. Yara está convencida que el agua de los dos ríos, el Amazonas y Cali, pueden confluir en un romance interminable al son del cadencioso sonido del agua.'
    },
    gato7: {
        nombre: 'Mac',
        descripcion: 'Mario Gordillo: La cándida hija de la luz, equilibrista de la vida, luz permanente, pretende iluminar el camino del Gato del Río para así conquistar su corazón a espera de una luz de pasión.'
    },
    gato8: {
        nombre: 'Ilustrada',
        descripcion: 'Lucy Tejada: Esta gata realizada como homenaje a Tejadita trata de evocar su alegría y goce por la naturaleza, conjugando elementos de mar y aire con los rostros plácidos y alegres de los niños y el vuelo festivo de las mariposas. ¿Podrá el gato resistirse a tanta ternura?'
    },
    gato9: {
        nombre: 'Presa',
        descripcion: 'Simboliza fuerza, vitalidad o la conexión con la naturaleza local.'
    },
    gato10: {
        nombre: 'No hay gato',
        descripcion: 'Wilson Díaz: Irrumpe entre nosotros la más intelectual de todas las gatas, aquella que después de mucho investigar ha encontrado que el Gato no se menciona en la Biblia. Con su inteligencia, esta gata conceptual, pretende captar la atención del Gato del Río.'
    },
    gato11: {
        nombre: 'Entrañable',
        descripcion: 'Ever Astudillo: Ella, recubierta con grafito que le da una apariencia sólida y pesada contrasta con la sinuosidad y movimiento que denota. Las imágenes lunares, luna llena y cuarto creciente, citan el paisaje nocturno como tema y propician el romance.'
    },
    gato12: {
        nombre: 'Sucia',
        descripcion: 'Rosemberg Sandoval: Desafiando el gusto, el dinero, el mito del arte y los viajes obligatorios a Norteamérica y Europa, esta minina entra a disputar el amor del felino más famoso de Cali'
    },
    gato13: {
        nombre: 'Melosa',
        descripcion: 'Evoca dulzura, afecto y la conexión cariñosa que la gente puede sentir hacia estas esculturas.'
    },
    gato14: {
        nombre: 'Vellocino de oro',
        descripcion: 'José Horacio Martínez: Esta gata elaborada en laminilla de oro de 22 Kilates motiva que las personas se acerquen a ella, seducidas con el resplandor del efímero brillo. ¿Será que el gato del río, se rinde a los encantos de esta gata de oropel y opulencia?'
    },
    gato15: {
        nombre: 'Siete Vidas',
        descripcion: 'Hace referencia a la creencia popular sobre la capacidad de los gatos para sobrevivir a múltiples percances, simbolizando quizás la resiliencia o la vitalidad.'
    },
    gato17: {
        nombre: 'Bandida',
        descripcion: 'Nadín Ospina: Un ejercicio lúdico a través de la imagen de famosos gatos de la cultura pop. El Gato con Botas, Félix el Gato, The Cat in a Hat, el Gato de Pinocho, O’ Malley el Aristogato, Garfield, Tom, el gato Silvestre, Snow Ball el Gato de los Simpson. Estas imágenes dentro de un diseño colorido y arquetípicamente pop conforman una pieza festiva y juguetona.'
    },
    gato18: {
        nombre: 'Gata Ingrid'
    },
    gato16: {
        nombre: 'Ceremonial',
        descripcion: 'Pedro Alcántara Herrá: Esta gata se caracteriza por el uso de elementos desprendidos de nuestra trietnia cultural, en la que se funden formas tradicionales de la pintura con diseños de origen precolombino evidenciados en las formas de animales que la circundan.'
    },
    gato19: {
        nombre: 'Coqueta',
        descripcion: 'Maripaz Jaramillo: Esta minina quiere demostrar la coquetería y la independencia que tienen los gatos. “El nombre ‘La Gata Coqueta’ es en memoria del maestro Tejada que hizo ese bello gato para la ciudad de Cali, y el cual seguramente necesita una compañera muy coqueta y atrevida que esté a la altura de tan querido felino», afirma la artista Maripaz Jaramillo.',
    },
    gato20: {
        nombre: 'Kuriyáku',
        descripcion: 'Este nombre tiene raíces indígenas y representa una conexión con la historia ancestral y la naturaleza local.',
    },
    gato21: {
        nombre: 'Gachuza',
        descripcion: 'Angela Villegas: Ella, quiere defenderse de la agresión del medio ambiente, de los gatos callejeros que la ven irresistible por su color rojo y coquetería maléfica, pero a su vez, como el puerco espín, está alerta, sólo tiene ojos para su gato, el del Río.'
    },
    gato22: {
        nombre: 'Anabella, la gata súperestrella',
        descripcion: 'Diego Pombo: Es una diva, una vedette. Ella es bella, caleña, fina, educada, inteligente y sensual. A pesar de su fama y tras el triunfo alcanzado en escenarios y pasarelas de París, New York, California, Las Vegas, Toronto y Japón, para Anabella lo más importante de la vida es el amor y como buena caleña nunca',
    },
};

const HoverLabel = ({ hoveredName, mousePosition }) => {
    if (!hoveredName) return null;

    const gatoInfo = infoGatos[hoveredName.toLowerCase()] || { nombre: hoveredName };

    return (
        <div
            style={{
                position: 'fixed',
                left: `${mousePosition.x + 15}px`,
                top: `${mousePosition.y - 60}px`,
                background: 'rgba(61, 210, 174, 0.8)',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                maxWidth: '250px',
                pointerEvents: 'none',
                zIndex: 9999,
            }}
        >
            <strong style={{ fontSize: '16px' }}>{gatoInfo.nombre}</strong>
            {gatoInfo.descripcion && (
                <p style={{ fontSize: '12px', margin: '8px 0' }}>{gatoInfo.descripcion}</p>
            )}
        </div>
    );
};

const GatosModel = ({ setHoveredName, setMousePosition, setPositions }) => {
    const { scene } = useGLTF('/models/gatos.glb');

    useEffect(() => {
        scene.updateMatrixWorld(true);

        const gatos = [];

        scene.traverse((child) => {
            if (child.isMesh && /^gato\d+$/i.test(child.name)) {
                const pos = new THREE.Vector3();
                child.getWorldPosition(pos);

                gatos.push({
                    name: child.name,
                    position: [pos.x, pos.y, pos.z],
                });
            }
        });

        gatos.sort((a, b) => {
            const numA = parseInt(a.name.replace(/\D/g, ''), 10);
            const numB = parseInt(b.name.replace(/\D/g, ''), 10);
            return numA - numB;
        });

        setPositions(gatos);
    }, [scene, setPositions]);

    return (
        <group scale={0.15} position={[0, -2, -65]}>
            {scene.children.map((child, index) => {
                if (child.isMesh && /^gato\d+$/i.test(child.name)) {
                    return (
                        <mesh
                            key={index}
                            geometry={child.geometry}
                            material={child.material.clone()}
                            position={child.position}
                            rotation={child.rotation}
                            scale={child.scale}
                            onPointerOver={(e) => {
                                e.stopPropagation();
                                document.body.style.cursor = 'pointer';
                                setHoveredName(child.name);
                                setMousePosition({ x: e.clientX, y: e.clientY });
                            }}
                            onPointerOut={() => {
                                document.body.style.cursor = 'default';
                                setHoveredName(null);
                            }}
                        />
                    );
                }
                return null;
            })}
            <primitive object={scene} />
        </group>
    );
};

const CameraController = ({ positions, targetIndex, autoFollow, orbitControlsRef }) => {
    const { camera } = useThree();

    const fixedX = 0;
    const cameraY = 1; // 📍 Cámara baja
    const targetY = 1; // 📍 Mira recto hacia el frente
    const offsetBehind = 8;

    useFrame(() => {
        if (positions.length === 0 || !orbitControlsRef.current) return;
        const target = positions[targetIndex];
        if (!target) return;

        if (autoFollow) {
            const targetPos = new THREE.Vector3(fixedX, cameraY, target.position[2] + offsetBehind);

            if (camera.position.distanceTo(targetPos) > 0.01) {
                camera.position.lerp(targetPos, 0.08);
            } else {
                camera.position.copy(targetPos);
            }

            orbitControlsRef.current.target.set(0, targetY, target.position[2]);
        }
    });

    return null;
};

const Gatos = () => {
    const { active } = useProgress();
    const [showTitle, setShowTitle] = useState(false);
    const [showScrollHint, setShowScrollHint] = useState(true); // ✅ NUEVO
    const navigate = useNavigate();
    const [audioError, setAudioError] = useState(false);
    const audioRef = useRef(null);

    const [hoveredName, setHoveredName] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const [positions, setPositions] = useState([]);
    const [targetIndex, setTargetIndex] = useState(0);
    const [autoFollow, setAutoFollow] = useState(false);
    const orbitControlsRef = useRef();

    useEffect(() => {
        if (!active && audioRef.current) {
            audioRef.current
                .play()
                .then(() => console.log('🔊 Audio reproducido correctamente'))
                .catch(() => setAudioError(true));

            const timeoutStart = setTimeout(() => {
                setShowTitle(true);
                const timeoutHide = setTimeout(() => setShowTitle(false), 4000);
                return () => clearTimeout(timeoutHide);
            }, 500);

            return () => clearTimeout(timeoutStart);
        }
    }, [active]);

    useEffect(() => {
        const timer = setTimeout(() => setShowScrollHint(false), 30000); // ✅ NUEVO
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleWheel = (e) => {
            e.preventDefault();
            setAutoFollow(true);

            setTargetIndex((prev) => {
                if (e.deltaY > 0) {
                    const next = prev + 1;
                    if (next >= positions.length) return prev;
                    return next;
                } else {
                    const next = Math.max(prev - 1, 0);
                    return next;
                }
            });
        };
        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, [positions]);

    const handleStart = () => setAutoFollow(false);
    const handleEnd = () => { };

    return (
        <div className="map-container">
            {showScrollHint && (
                <div className="scroll-hint">
                    Para moverse, por favor haz scroll con el mouse
                </div>
            )}
            <HoverLabel hoveredName={hoveredName} mousePosition={mousePosition} />

            <Canvas camera={{ position: [0, 1, 15], fov: 45 }} style={{ width: '100vw', height: '100vh' }}>
                <Suspense fallback={<Loader />}>
                    <Perf position="bottom-left" minimal showGraph={false} />
                    <Environment files="/textures/gatos.exr" background />
                    <CameraController
                        positions={positions}
                        targetIndex={targetIndex}
                        autoFollow={autoFollow}
                        orbitControlsRef={orbitControlsRef}
                    />
                    <GatosModel
                        setHoveredName={setHoveredName}
                        setMousePosition={setMousePosition}
                        setPositions={setPositions}
                    />
                    <OrbitControls
                        ref={orbitControlsRef}
                        enableZoom={false}
                        enablePan={false}
                        enableRotate={true}
                        onStart={handleStart}
                        onEnd={handleEnd}
                        minPolarAngle={Math.PI / 3}
                        maxPolarAngle={(2 * Math.PI) / 3}
                    />
                </Suspense>
            </Canvas>

            {showTitle && <h1 className="three-cruces-title">Gatos de Tejada</h1>}

            <UserInfo />
            <div className="back-button" onClick={() => navigate(-1)}>← Ir al Mapa</div>
            <audio ref={audioRef} src="/Media/Gatos.mp3" loop preload="auto" />
            {audioError && (
                <button
                    className="audio-unlock-button"
                    onClick={() => {
                        audioRef.current.play().then(() => {
                            setAudioError(false);
                        });
                    }}
                >
                    Activar sonido 🔊
                </button>
            )}
        </div>
    );
};

export default Gatos;