import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserInfo from './UserInfo';
import preguntas from '../utils/preguntas';
import '../styles/global.css';
import planta3 from '../Media/3.png';

const Quiz = () => {
    const { dificultad } = useParams();
    const navigate = useNavigate();

    const [quizPreguntas, setQuizPreguntas] = useState([]);
    const [indexActual, setIndexActual] = useState(0);
    const [puntaje, setPuntaje] = useState(0);
    const [finalizado, setFinalizado] = useState(false);
    const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);

    const totalPorDificultad = {
        facilongo: 10,
        majomenos: 20,
        berraco: 30,
    };

    useEffect(() => {
        const total = totalPorDificultad[dificultad] || 10;
        const barajadas = [...preguntas].sort(() => Math.random() - 0.5).slice(0, total);
        setQuizPreguntas(barajadas);
    }, [dificultad]);

    const handleRespuesta = async (respuesta) => {
        setRespuestaSeleccionada(respuesta);

        if (!quizPreguntas[indexActual]) return;

        const correcta = quizPreguntas[indexActual].respuestaCorrecta;
        const esCorrecta = respuesta === correcta;

        if (esCorrecta) {
            const nuevoPuntaje = puntaje + 10;
            setPuntaje(nuevoPuntaje);

            const user = JSON.parse(localStorage.getItem('user'));
            const actualizado = { ...user, score: user.score + 10 };
            localStorage.setItem('user', JSON.stringify(actualizado));

            try {
                await fetch('https://backend-react-jvqo.onrender.com/update-score/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: user.email,
                        score: actualizado.score,
                    }),
                });
            } catch (err) {
                console.error('❌ Error actualizando el puntaje en el servidor:', err);
            }
        }

        if (indexActual + 1 < quizPreguntas.length) {
            setTimeout(() => {
                setIndexActual((prev) => prev + 1);
                setRespuestaSeleccionada(null);
            }, 300);
        } else {
            setFinalizado(true);
        }
    };

    if (!quizPreguntas.length) return <div>Cargando preguntas...</div>;

    return (
        <div className="quiz-container">
            <div className="quiz-header-deco">
                <h1 className="quiz-logo-text">Quiz</h1>
            </div>

            <UserInfo />

            <div className="quiz-wrapper">
                <div className="quiz-progress-right">
                    {indexActual + 1}/{quizPreguntas.length}
                </div>

                {finalizado ? (
                    <div className="quiz-final">
                        <h2>¡Quiz finalizado!</h2>
                        <p>Puntaje total: {puntaje} puntos</p>
                        <button onClick={() => navigate('/map')} className="quiz-nav-button">
                            Volver al mapa
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="quiz-box">
                            <h2 className="quiz-question-title">Pregunta {indexActual + 1}</h2>
                            <p className="quiz-question-text">{quizPreguntas[indexActual].pregunta}</p>

                            <div className="quiz-options">
                                {quizPreguntas[indexActual].opciones.map((op, i) => (
                                    <label key={i} className="quiz-option-label">
                                        <input
                                            type="radio"
                                            name={`respuesta-${indexActual}`}
                                            value={op}
                                            checked={respuestaSeleccionada === op}
                                            onChange={() => handleRespuesta(op)}
                                            className="quiz-radio"
                                        />
                                        {op}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="quiz-nav-buttons">
                            <button
                                onClick={() => {
                                    if (indexActual > 0) {
                                        setIndexActual((prev) => prev - 1);
                                        setRespuestaSeleccionada(null);
                                    }
                                }}
                                disabled={indexActual === 0}
                                className="quiz-nav-button"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => {
                                    if (indexActual + 1 < quizPreguntas.length) {
                                        setIndexActual((prev) => prev + 1);
                                        setRespuestaSeleccionada(null);
                                    }
                                }}
                                className="quiz-nav-button"
                            >
                                Siguiente
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="quiz-back-button" onClick={() => navigate('/map')}>
                ← Ir Atrás
            </div>
            <img src={planta3} alt="Planta decorativa derecha" className="decorative-plant-right-M" />
        </div>
    );
};

export default Quiz;
