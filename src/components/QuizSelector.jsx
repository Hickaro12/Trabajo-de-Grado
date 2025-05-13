// src/components/QuizSelector.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';
import planta1 from '../Media/1.png';
import planta2 from '../Media/2.png';
import planta3 from '../Media/3.png';

const QuizSelector = () => {
    const navigate = useNavigate();

    const handleDifficulty = (level) => {
        navigate(`/quiz/${level}`);
    };

    return (
        <div className="quiz-selector-wrapper">
            <h1 className="quiz-title">Vení pone a prueba tus conocimientos</h1>

            <div className="quiz-buttons-container">
                <button className="quiz-button-facilongo" onClick={() => handleDifficulty('facilongo')}>
                    Facilongo
                </button>
                <button className="quiz-button-majomenos" onClick={() => handleDifficulty('majomenos')}>
                    Majomenos
                </button>
                <button className="quiz-button-berraco" onClick={() => handleDifficulty('berraco')}>
                    Berraco
                </button>
            </div>

            <div className="quiz-back-button" onClick={() => navigate('/map')}>
                ← Ir Atrás
            </div>

            <img src={planta1} alt="Planta decorativa" className="decorative-plant-M" />
            <img src={planta3} alt="Planta decorativa derecha" className="decorative-plant-right-M" />
            <img src={planta2} alt="Planta decorativa superior derecha" className="decorative-plant-top-right-M" />
        </div>
    );
};

export default QuizSelector;
