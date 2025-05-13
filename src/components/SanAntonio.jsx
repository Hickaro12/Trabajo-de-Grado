import React, { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    OrbitControls,
    useGLTF,
    Environment,
    Sky,
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

const hoveredElements = ['Iglesia', 'Escaleras', 'farolas', 'Sillas'];

const infoMap = {
    'Iglesia': {
        title: 'Iglesia de San Antonio',
        description:
            "¡Subir a la Iglesia de San Antonio es como hacer un viaje en el tiempo con ñapa! Además de las misas pa' alimentar el espíritu, uno se encuentra con turistas y caleños que se deleitan con la vista panorámica de toda la ciudad, ¡pa' tomar fotos que dejen a todos con la boca abierta! Y la plazoleta se presta pa' parchar, pa' sentir la brisa y a veces hasta pa' disfrutar de eventos culturales y artesanales.",
    },
    'Escaleras': {
        title: 'Escalinatas al cerro',
        description:
            "¡Esta iglesia es un tesoro, parcero! Su antigüedad y su ubicación en la loma la hacen un referente de nuestra historia y nuestra fe. Para muchos caleños, visitarla es una tradición, un acto de devoción, y la vista desde arriba nos recuerda lo hermosa que es nuestra Cali. ¡Y el barrio de San Antonio que la rodea es un encanto!",
    },
    'Sillas': {
        title: 'Sillas',
        description:
            "¡La construcción original de esta iglesia se remonta al siglo XVIII, imagínate! Es uno de los templos más antiguos y queridos de Cali. Ha pasado por muchas cosas, pero siempre ha mantenido su esencia y su importancia como un faro espiritual e histórico en nuestra ciudad. ¡Su fundación marca una época importante de nuestra Cali colonial!",
    },
    'farolas': {
        title: 'Farolas coloniales',
        description:
            '¡Esta iglesia tiene más años que la cédula de mi abuela, así que imagínate las historias! Se cuentan de túneles secretos que la conectan con otros lugares antiguos de Cali, de apariciones de santos en momentos difíciles, y de milagros que la gente le atribuye a San Antonio. ¡Un lugar lleno de misterio y fe!',
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

const SanAntonioModel = ({ hoveredName, setHoveredName, setMousePosition }) => {
    const { scene, animations } = useGLTF('/models/antonio.glb');

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
        <group scale={0.08} position={[1, -6, 0]}>
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

const SanAntonio = () => {
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

            <Canvas camera={{ position: [1.36, 10, 34.92], fov: 12 }} style={{ width: '100vw', height: '100vh' }}>
                <Suspense fallback={<Loader />}>
                    <Perf position="bottom-left" minimal showGraph={false} />
                    <Environment files="/textures/cruses_hdr.exr" background />
                    <ambientLight intensity={0.6} />
                    <SanAntonioModel
                        setHoveredName={setHoveredName}
                        setMousePosition={setMousePosition}
                        hoveredName={hoveredName}
                    />
                    <OrbitControls
                        enableZoom={true}
                        enablePan={false}
                        minDistance={7}
                        maxDistance={45}
                        minPolarAngle={Math.PI / 2}
                        maxPolarAngle={Math.PI / 2}
                    />
                </Suspense>
            </Canvas>

            {showTitle && <h1 className="three-cruces-title">San Antonio</h1>}
            <UserInfo />
            <div className="back-button" onClick={() => navigate(-1)}>← Ir al Mapa</div>
            <audio ref={audioRef} src="/Media/Sanantonio.mp3" loop preload="auto" />
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

export default SanAntonio;