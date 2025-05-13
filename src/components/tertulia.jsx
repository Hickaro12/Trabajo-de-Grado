import React, { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import {
    OrbitControls,
    useGLTF,
    Environment,
    useProgress,
    useAnimations
} from '@react-three/drei';
import { Perf } from 'r3f-perf';
import * as THREE from 'three';
import '../styles/global.css';
import Loader from './Loader';
import UserInfo from './UserInfo';
import { useNavigate } from 'react-router-dom';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

const hoveredElements = ['Mausoleo', 'Museo1', 'Museo2', 'Fuente'];

const infoMap = {
    'Mausoleo': {
        title: 'Mausoleo',
        description:
            "¡Este museo es un parche cultural de otro nivel, mi papá! Aquí uno se encuentra con exposiciones de arte moderno y contemporáneo que te hacen decir '¡qué chimba!'. Pero no solo es mirar cuadros, ¡aquí hay talleres pa' meterle mano al arte, charlas pa' aprender de todo, y cine que te hace pensar diferente! Y ni hablar del jardín de esculturas, ¡un espacio al aire libre pa' relajarse y ver arte bajo el sol de Cali!",
    },
    'Museo1': {
        title: 'Museo de Arte',
        description:
            "¡La Tertulia es un orgullo caleño, vea! Es uno de los museos de arte moderno más importantes de Colombia, ¡pa' que lo sepas! Ha formado a mucha gente, ha impulsado a nuestros artistas y nos ha conectado con lo que se está haciendo en el arte mundial. Para nosotros, es un símbolo de que en Cali la cultura se mueve.",
    },
    'Fuente': {
        title: 'Fuente',
        description:
            "Aunque el museo es más moderno, ¡también tiene sus cositas! Hay quien dice sentir una energía especial en algunas obras, como si tuvieran su propia historia. Y también se comenta sobre cómo llegaron algunas de las primeras piezas a la colección, ¡con unos cuentos medio misteriosos que le dan su toque! ¡Pa' que veas que hasta el arte tiene su chispa!",
    },
    'Museo2': {
        title: 'Museo Histórico',
        description:
            "¡Este museo nació del berraquito de unas mujeres pilosas en 1956, lideradas por Maritza Uribe de Urdinola! Empezaron con las actividades en diferentes lugares, ¡echando raíz poco a poco!, hasta que en 1968 se inauguró este edificio bacano a la orilla del río. ¡Un lugar con una arquitectura que ya es un ícono de Cali!",
    }
};


const HoverLabel = ({ hoveredName, mousePosition }) => {
    const data = infoMap[hoveredName];
    if (!data) return null;

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
                maxWidth: '200px',
                pointerEvents: 'none',
                zIndex: 9999
            }}
        >
            <strong style={{ fontSize: '16px' }}>{data.title}</strong>
            <p style={{ fontSize: '12px', margin: '8px 0' }}>{data.description}</p>
            {data.image && (
                <img
                    src={data.image}
                    alt={data.title}
                    style={{ width: '100%', borderRadius: '5px', marginTop: '5px' }}
                />
            )}
        </div>
    );
};

const HoverMeshes = ({ scene, hoveredName, setHoveredName, setMousePosition }) => {
    const meshes = [];
    scene.traverse((child) => {
        const base = hoveredElements.find(b => child.name.startsWith(b));
        if (child.isMesh && base) {
            meshes.push({ mesh: child, base });
        }
    });

    return meshes.map(({ mesh, base }, i) => {
        const position = mesh.getWorldPosition(new THREE.Vector3());
        const scale = mesh.getWorldScale(new THREE.Vector3());
        const rotation = new THREE.Euler().setFromQuaternion(
            mesh.getWorldQuaternion(new THREE.Quaternion())
        );

        const clonedMaterial = mesh.material.clone();
        if (hoveredName === base) {
            clonedMaterial.color = new THREE.Color(0xffcc00);
        }

        return (
            <mesh
                key={`hover-${i}`}
                geometry={mesh.geometry}
                material={clonedMaterial}
                position={position}
                rotation={rotation}
                scale={scale}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    document.body.style.cursor = 'pointer';
                    setHoveredName(base);
                    setMousePosition({ x: e.clientX, y: e.clientY });
                }}
                onPointerMove={(e) => {
                    setMousePosition({ x: e.clientX, y: e.clientY });
                }}
                onPointerOut={() => {
                    document.body.style.cursor = 'default';
                    setHoveredName(null);
                }}
            />
        );
    });
};

const PersonajeAnimado = ({ original, animations, position, name }) => {
    const personajeClonado = useMemo(() => clone(original), [original]);
    const { actions, names } = useAnimations(animations, personajeClonado);

    useEffect(() => {
        if (actions && names.length > 0) {
            names.forEach((clipName) => {
                const action = actions[clipName];
                if (action) {
                    action.reset().fadeIn(0.5).play();
                    action.setLoop(THREE.LoopRepeat, Infinity);
                    console.log(`🎬 Animando: ${name} con: ${clipName}`);
                }
            });
        }
    }, [actions, names]);

    return <primitive object={personajeClonado} position={position} />;
};

const TertuliaModel = ({ hoveredName, setHoveredName, setMousePosition }) => {
    const { scene, animations } = useGLTF('/models/tertulia.glb');

    const personajes = useMemo(() => {
        return scene.children.filter(obj => obj.name.startsWith('Armature'));
    }, [scene]);

    const entorno = useMemo(() => {
        const cloneScene = scene.clone(true);
        personajes.forEach((p) => {
            const idx = cloneScene.children.findIndex(c => c.name === p.name);
            if (idx !== -1) cloneScene.children.splice(idx, 1);
        });
        return cloneScene;
    }, [scene, personajes]);

    return (
        <group scale={0.08} position={[1, -1, 0]}>
            <primitive object={entorno} />
            {personajes.map((original, i) => (
                <PersonajeAnimado
                    key={i}
                    original={original}
                    animations={animations}
                    position={original.position.toArray()}
                    name={original.name}
                />
            ))}
            <HoverMeshes
                scene={scene}
                hoveredName={hoveredName}
                setHoveredName={setHoveredName}
                setMousePosition={setMousePosition}
            />
        </group>
    );
};

const Tertulia = () => {
    const { active } = useProgress();
    const [showTitle, setShowTitle] = useState(false);
    const [hoveredName, setHoveredName] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [audioError, setAudioError] = useState(false);
    const navigate = useNavigate();
    const audioRef = useRef(null);

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

    return (
        <div className="map-container">
            <HoverLabel hoveredName={hoveredName} mousePosition={mousePosition} />

            <Canvas camera={{ position: [1.36, 10, 34.92], fov: 5 }} style={{ width: '100vw', height: '100vh' }}>
                <Suspense fallback={<Loader />}>
                    <Perf position="bottom-left" minimal showGraph={false} />
                    <Environment files="/textures/tertulia.exr" background />
                    <ambientLight intensity={0.6} />
                    <TertuliaModel
                        setHoveredName={setHoveredName}
                        setMousePosition={setMousePosition}
                        hoveredName={hoveredName}
                    />
                    <OrbitControls
                        enableZoom={true}
                        enablePan={false}
                        minDistance={7}
                        maxDistance={45}
                        minPolarAngle={Math.PI / 2.5}
                        maxPolarAngle={Math.PI / 2}
                    />
                </Suspense>
            </Canvas>

            {showTitle && <h1 className="three-cruces-title">Tertulia</h1>}
            <UserInfo />
            <div className="back-button" onClick={() => navigate(-1)}>← Ir al Mapa</div>
            <audio ref={audioRef} src="/Media/Tertulia.mp3" loop preload="auto" />
            {audioError && (
                <button
                    className="audio-unlock-button"
                    onClick={() => {
                        audioRef.current.play().then(() => setAudioError(false));
                    }}
                >
                    Activar sonido 🔊
                </button>
            )}
        </div>
    );
};

export default Tertulia;
