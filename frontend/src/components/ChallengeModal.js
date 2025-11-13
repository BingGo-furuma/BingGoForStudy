import React, { useEffect, useMemo, useState } from 'react';
import './ChallengeModal.css';

const formatPercentage = (value) => `${Math.round(value * 100)}%`;

const ChallengeModal = ({ task, onClose, onSubmit }) => {
  const [responses, setResponses] = useState({});
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setResponses({});
    setResult(null);
    setIsSubmitting(false);
  }, [task]);

  const isReady = useMemo(() => {
    if (!task) {
      return false;
    }
    return task.questions.every((question) => responses[question.id]);
  }, [task, responses]);

  if (!task) {
    return null;
  }

  const handleChange = (questionId, optionId) => {
    setResponses((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isReady || !task) {
      return;
    }
    setIsSubmitting(true);
    try {
      const evaluation = await onSubmit(task, responses);
      setResult(evaluation);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="challenge-modal__backdrop" role="dialog" aria-modal="true">
      <div className="challenge-modal">
        <header className="challenge-modal__header">
          <div>
            <p className="challenge-modal__eyebrow">マス #{task.id}</p>
            <h2 className="challenge-modal__title">{task.title}</h2>
          </div>
          <button type="button" className="challenge-modal__close" onClick={onClose}>
            ✕
          </button>
        </header>
        <div className="challenge-modal__body">
          <p className="challenge-modal__description">{task.description}</p>
          <form onSubmit={handleSubmit} className="challenge-modal__form">
            {task.questions.map((question) => (
              <fieldset key={question.id} className="challenge-modal__question">
                <legend>{question.prompt}</legend>
                {question.options.map((option) => (
                  <label key={option.id} className="challenge-modal__option">
                    <input
                      type="radio"
                      name={question.id}
                      value={option.id}
                      checked={responses[question.id] === option.id}
                      onChange={() => handleChange(question.id, option.id)}
                      disabled={Boolean(result)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
                {result && (
                  <p className="challenge-modal__explanation">
                    {result.explanation || question.explanation}
                  </p>
                )}
              </fieldset>
            ))}
            <div className="challenge-modal__actions">
              {!result ? (
                <button type="submit" disabled={!isReady || isSubmitting}>
                  {isSubmitting ? '採点中…' : '解答を提出'}
                </button>
              ) : (
                <button type="button" onClick={onClose}>
                  閉じる
                </button>
              )}
            </div>
          </form>
        </div>
        {result && (
          <footer className="challenge-modal__footer">
            <p>
              正答率: <strong>{formatPercentage(result.score)}</strong> ／ 合否:{' '}
              <strong>{result.passed ? '合格' : '未達'}</strong>
            </p>
            <p>
              正解数: <strong>{result.correct}</strong> / {result.total} ／ 獲得ポイント:{' '}
              <strong>{result.awardedPoints}</strong>
            </p>
            <p className="challenge-modal__feedback">{result.feedback}</p>
          </footer>
        )}
      </div>
    </div>
  );
};

export default ChallengeModal;
