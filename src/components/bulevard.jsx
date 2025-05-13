import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, useProgress } from '@react-three/drei';
import { Perf } from 'r3f-perf';
import * as THREE from 'three';
import '../styles/global.css';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';
import UserInfo from './UserInfo';

const infoMap = {
    centro: {
        nombre: 'Centro',
        descripcion: "¡Este bulevar es un logro, parcero! Antes era una zona olvidada, pero ahora es un lugar de encuentro que nos llena de orgullo. Revitalizó el centro, dándonos un espacio seguro y bonito pa' parchar, pa' relajarnos y pa' sentirnos más unidos como caleños. ¡Es un símbolo de que Cali se transforma pa' bien!"
    },
    ermita: {
        nombre: 'Ermita',
        descripcion: "¡Este bulevar es lo mejor, mi llave! Aquí uno viene a caminar, a trotar pa' mantener el flow, a montar cicla con la brisa del río en la cara. Pero la cosa no para ahí, ¡aquí siempre hay eventos! Conciertos que te ponen a bailar salsa hasta el amanecer, ferias artesanales pa' comprar detallitos únicos, y actividades deportivas pa' mover el esqueleto. ¡Este es el corazón de Cali latiendo con alegría!"
    },
    edificio: {
        nombre: 'Edificio',
        descripcion: "¡Este bulevar es un logro, parcero! Antes era una zona olvidada, pero ahora es un lugar de encuentro que nos llena de orgullo. Revitalizó el centro, dándonos un espacio seguro y bonito pa' parchar, pa' relajarnos y pa' sentirnos más unidos como caleños. ¡Es un símbolo de que Cali se transforma pa' bien!"
    },
    publicidad: {
        nombre: 'Publicidad',
        descripcion: "¡Ay, mi llave, y ni hablar de la comelona y el azote de baldosa! Alrededor del bulevar, ¡la oferta gastronómica es pa' chuparse los dedos! Desde los restaurantes elegantes pa' una noche especial hasta los puestos de empanadas y aborrajados que te salvan el hambre a cualquier hora. Y cuando cae la noche, ¡el bulevar se prende con el sabor de la salsa! La Calle de la Salsa, cerquita, es un hervidero de melomanía y bailadores que te contagian la alegría. ¡Aquí la rumba es seria, mi llave!"
    },
    sillas: {
        nombre: 'Sillas',
        descripcion: "La construcción de este bulevar fue un proceso, ¡cómo hacer un buen sancocho, lleva su tiempo! Pero la parte más importante se dio a finales del siglo pasado y principios de este, ¡cuando se recuperó la orilla del río pa' darnos este espacio tan bacano! ¡Una transformación que le cambió la cara al centro de Cali!"
    }
};


const HoverLabel = ({ hoveredName, mousePosition }) => {
    if (!hoveredName) return null;
    const data = infoMap[hoveredName.toLowerCase()] || { nombre: hoveredName };
    return (
        <div style={{ position: 'fixed', left: `${mousePosition.x + 15}px`, top: `${mousePosition.y - 60}px`, background: 'rgba(61, 210, 174, 0.8)', color: 'white', padding: '12px', borderRadius: '8px', maxWidth: '250px', pointerEvents: 'none', zIndex: 9999 }}>
            <strong>{data.nombre}</strong>
            {data.descripcion && <p style={{ marginTop: '5px', fontSize: '13px' }}>{data.descripcion}</p>}
        </div>
    );
};

const BulevardModel = ({ setHoveredName, setMousePosition, setPositions }) => {
    const { scene } = useGLTF('/models/bulevard.glb');
    const [meshes, setMeshes] = useState([]);

    useEffect(() => {
        const keyMeshes = {};
        const targets = Object.keys(infoMap);

        scene.traverse((child) => {
            if (child.isMesh) {
                const name = child.name.toLowerCase();

                if (name.includes('cube.054')) {
                    if (!keyMeshes['edificio']) keyMeshes['edificio'] = [];
                    keyMeshes['edificio'].push(child);
                    child.visible = false;
                } else if (name.includes('object_7')) {
                    if (!keyMeshes['ermita']) keyMeshes['ermita'] = [];
                    keyMeshes['ermita'].push(child);
                    child.visible = false;
                } else {
                    const key = targets.find(k => name.includes(k));
                    if (key) {
                        if (!keyMeshes[key]) keyMeshes[key] = [];
                        keyMeshes[key].push(child);
                        child.visible = false;
                    }
                }
            }
        });

        const positions = Object.entries(keyMeshes).map(([key, meshList]) => {
            const box = new THREE.Box3();
            meshList.forEach(m => box.expandByObject(m));
            const center = new THREE.Vector3();
            box.getCenter(center);
            return { name: key.toLowerCase(), position: center.clone() };
        });

        positions.sort((a, b) => a.name === 'centro' ? -1 : 1);
        setPositions(positions);

        const flatMeshes = Object.entries(keyMeshes).flatMap(([key, meshList]) =>
            meshList.map((m) => {
                const worldPos = new THREE.Vector3();
                m.getWorldPosition(worldPos);
                const worldQuat = new THREE.Quaternion();
                m.getWorldQuaternion(worldQuat);
                const worldScale = new THREE.Vector3();
                m.getWorldScale(worldScale);
                return {
                    name: key,
                    geometry: m.geometry,
                    material: m.material.clone(),
                    position: worldPos,
                    rotation: new THREE.Euler().setFromQuaternion(worldQuat),
                    scale: worldScale
                };
            })
        );

        setMeshes(flatMeshes);
    }, [scene]);

    return (
        <>
            <group scale={0.15} position={[0, -2, -65]}>
                <primitive object={scene} />
            </group>
            {meshes.map((mesh, i) => (
                <mesh
                    key={i}
                    geometry={mesh.geometry}
                    material={mesh.material}
                    position={mesh.position}
                    rotation={mesh.rotation}
                    scale={mesh.scale}
                    onPointerOver={(e) => {
                        e.stopPropagation();
                        document.body.style.cursor = 'pointer';
                        setHoveredName(mesh.name);
                        setMousePosition({ x: e.clientX, y: e.clientY });
                    }}
                    onPointerOut={() => {
                        document.body.style.cursor = 'default';
                        setHoveredName(null);
                    }}
                />
            ))}
        </>
    );
};

const CameraController = ({ positions, targetIndex, autoFollow, orbitControlsRef }) => {
    const { camera } = useThree();
    const fixedX = 0;
    const cameraY = 1.5;
    const targetY = 1;
    const offsetBehind = 20;

    useFrame(() => {
        if (!positions.length) return;
        const target = positions[targetIndex];
        if (!target) return;

        const targetPos = new THREE.Vector3(fixedX, cameraY, target.position.z + offsetBehind);
        if (autoFollow && camera.position.distanceTo(targetPos) > 0.1) {
            camera.position.lerp(targetPos, 0.08);
        } else if (autoFollow) {
            camera.position.copy(targetPos);
        }

        if (orbitControlsRef.current) {
            orbitControlsRef.current.target.set(0, targetY, target.position.z);
        }
    });

    return null;
};

const Bulevard = () => {
    const { active } = useProgress();
    const [hoveredName, setHoveredName] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [positions, setPositions] = useState([]);
    const [targetIndex, setTargetIndex] = useState(0);
    const [autoFollow, setAutoFollow] = useState(true);
    const orbitControlsRef = useRef();
    const navigate = useNavigate();
    const [showTitle, setShowTitle] = useState(false);
    const [showScrollHint, setShowScrollHint] = useState(true); // ✅ NUEVO

    useEffect(() => {
        if (!active) {
            setShowTitle(true);
            const timeout = setTimeout(() => setShowTitle(false), 4000);
            return () => clearTimeout(timeout);
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
                if (e.deltaY > 0 && prev === 0) return 1; // Centro → Ermita
                if (e.deltaY < 0 && prev === 1) return 0; // Ermita → Centro
                return prev;
            });

            setTimeout(() => setAutoFollow(false), 1500);
        };
        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, []);

    return (
        <div className="map-container">
            {showScrollHint && (
                <div className="scroll-hint">
                    Para moverse, por favor haz scroll con el mouse
                </div>
            )}
            <HoverLabel hoveredName={hoveredName} mousePosition={mousePosition} />
            <Canvas camera={{ position: [0, 1.5, 25], fov: 30 }} style={{ width: '100vw', height: '100vh' }} onPointerMissed={() => setHoveredName(null)}>
                <Suspense fallback={<Loader />}>
                    <Environment files="/textures/gatos.exr" background />
                    <Perf position="bottom-left" minimal showGraph={false} />
                    <CameraController {...{ positions, targetIndex, autoFollow, orbitControlsRef }} />
                    <BulevardModel {...{ setHoveredName, setMousePosition, setPositions }} />
                    <OrbitControls
                        ref={orbitControlsRef}
                        enableZoom={false}
                        enablePan={false}
                        enableRotate={true}
                        minPolarAngle={Math.PI / 3.2}
                        maxPolarAngle={(2 * Math.PI) / 3}
                    />
                </Suspense>
            </Canvas>
            {showTitle && <h1 className="three-cruces-title">Bulevar del Río</h1>}
            <UserInfo />
            <div className="back-button" onClick={() => navigate(-1)}>← Ir al Mapa</div>
        </div>
    );
};

export default Bulevard;
