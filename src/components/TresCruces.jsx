import React, {
    Suspense,
    useRef,
    useEffect,
    useState,
    useMemo,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    OrbitControls,
    useGLTF,
    Environment,
    useProgress,
    useAnimations,
} from '@react-three/drei';
import { Perf } from 'r3f-perf';
import * as THREE from 'three';
import '../styles/global.css';
import Loader from './Loader';
import UserInfo from './UserInfo';
import { useNavigate } from 'react-router-dom';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { Sky } from '@react-three/drei';

// ✅ Agrupaciones por nombre base
const clickableBases = ['Capilla', 'Cruces', 'Dominadas', 'Mancuerna'];

const infoMap = {
    'Cruces': {
        title: 'Las Tres Cruces',
        description: `
        Parce, súbase a esta loma y verá lo que es bueno! El Cerro de las Tres Cruces es el parche favorito de los que le meten al ejercicio con berraquera. 
        La subida exige, no te voy a mentir, pero cuando llegas arriba, ¡manito!, la panorámica de Cali te deja sin aliento, como cuando te comes un chontaduro con sal. 
        Muchos aprovechan esa paz que se siente en la cima para estirar el cuerpo con yoga o meditar, ¡desconectándose del bullicio de la ciudad, ve! 
        Y ni hablar de las fotos que puedes tomar, ¡pa' que tu Instagram reviente de likes!`
    },
    'Mancuerna': {
        title: 'Zona de Mancuernas',
        description: `Este cerro es más que una loma, ¡es un símbolo de nuestra fe y de que los caleños somos verracos! 
        En Semana Santa, la gente sube con una devoción que eriza la piel, pagando promesas y sintiendo la eucaristía en ese espacio tan especial. 
        Pero ojo, ¡no todo es espiritualidad! El cerro también es un punto de encuentro, un referente de nuestra identidad. 
        Y cerquita, en Normandía, ¡la comelona es de otro nivel! Desde jugos que te levantan hasta empanaditas y pandebonos pa' recargar energías 
        después de la caminada, ¡una delicia, mi llave!`
    },
    'Dominadas': {
        title: 'Zona de dominadas',
        description: `¡Ay, el Cerro de las Tres Cruces tiene más cuentos que Calle Vieja! 
        La más famosa es la del demonio Buziraco, ¡un pelao' bien pesado que dizque maldijo a Cali! 
        Pero no contaban con la astucia de un cura que mandó a poner las tres cruces pa' encerrarlo ahí, ¡pa' que no nos siguiera dando lidia! 
        Y eso no es todo, parce, también se rumora de tesoros escondidos por los españoles y de apariciones misteriosas en las noches oscuras, 
        ¡pa' que te lo pienses dos veces antes de subir solo de noche, ve!`
    },
    'Capilla': {
        title: 'Capilla del cerro',
        description: `¡Imagínese, este monumento tiene más años que andar a pie! 
        Se inauguró el 6 de enero de 1938, ¡más de 87 años marcando nuestro paisaje! 
        Las primeras cruces eran de guadua, ¡bien artesanales!, pero las de concreto que vemos hoy son más firmes 
        y ahí siguen, como un faro que nos recuerda nuestra historia.`
    }
};

const HoverMeshes = ({ scene, hoveredName, setHoveredName, setMousePosition }) => {
    const meshes = [];

    scene.traverse((child) => {
        const base = clickableBases.find(base => child.name.startsWith(base));
        if (child.isMesh && base) {
            meshes.push({ mesh: child, base });
        }
    });

    return meshes.map(({ mesh, base }, i) => {
        const clonedMaterial = mesh.material.clone();
        if (hoveredName === base) {
            clonedMaterial.color = new THREE.Color(0xffcc00);
        }

        const position = mesh.getWorldPosition(new THREE.Vector3());
        const scale = mesh.getWorldScale(new THREE.Vector3());
        const quaternion = mesh.getWorldQuaternion(new THREE.Quaternion());
        const rotation = new THREE.Euler().setFromQuaternion(quaternion);

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

const TresCrucesModel = ({ setHoveredName, setMousePosition, hoveredName }) => {
    const { scene, animations } = useGLTF('/models/cruses.glb');

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
        <group scale={0.08} position={[2, -8, 0]}>
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

const TresCruces = () => {
    const { active } = useProgress();
    const [showTitle, setShowTitle] = useState(false);
    const navigate = useNavigate();
    const [audioError, setAudioError] = useState(false);
    const audioRef = useRef(null);

    const [hoveredName, setHoveredName] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

            <Canvas camera={{ position: [-0, 10, 36.92], fov: 19 }} style={{ width: '100vw', height: '100vh' }}>
                <Suspense fallback={<Loader />}>
                    <Perf position="bottom-left" minimal showGraph={false} />

                    <Environment files="/textures/cruses_hdr.exr" background />
                    <Suspense fallback={<Loader />}>
                        <Perf position="bottom-left" minimal showGraph={false} />

                        <Sky
                            sunPosition={[0.5, 0, -1]}
                            inclination={0.2}
                            azimuth={180}
                            mieCoefficient={0.005}
                            mieDirectionalG={0.07}
                            rayleigh={3}
                            turbidity={5}
                        />

                        <Environment files="/textures/cruses_hdr.exr" background />
                        <ambientLight intensity={0.6} />
                        <TresCrucesModel
                            setHoveredName={setHoveredName}
                            setMousePosition={setMousePosition}
                            hoveredName={hoveredName}
                        />
                        <OrbitControls
                            enableZoom={true}
                            enablePan={false}
                            minDistance={10}
                            maxDistance={30}
                            minPolarAngle={Math.PI / 2}
                            maxPolarAngle={Math.PI / 2}
                        />
                    </Suspense>

                    <ambientLight intensity={0.6} />
                    <TresCrucesModel
                        setHoveredName={setHoveredName}
                        setMousePosition={setMousePosition}
                        hoveredName={hoveredName}
                    />
                    <OrbitControls
                        enableZoom={true}
                        enablePan={false}
                        minDistance={10}
                        maxDistance={30}
                        minPolarAngle={Math.PI / 2}
                        maxPolarAngle={Math.PI / 2}
                    />
                </Suspense>
            </Canvas>

            {showTitle && <h1 className="three-cruces-title">Cerro de las 3 cruces</h1>}
            <UserInfo />
            <div className="back-button" onClick={() => navigate(-1)}>← Ir al Mapa</div>
            <audio ref={audioRef} src="/Media/Song.mp3" loop preload="auto" />
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

export default TresCruces;
