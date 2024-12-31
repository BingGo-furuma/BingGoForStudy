import React, { useState } from 'react';

const QuestionModal = ({ questions, onComplete }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);

    const handleAnswer = (answer) => {
        setAnswers([...answers, answer]);
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            onComplete(answers);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', color: 'white' }}>
            <h3>{questions[currentQuestion].text}</h3>
            <div>
                {questions[currentQuestion].options.map((option, index) => (
                    <button key={index} onClick={() => handleAnswer(option)}>
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuestionModal;
