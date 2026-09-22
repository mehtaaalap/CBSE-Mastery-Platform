import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';

export default function QuizPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .post(`/students/topics/${topicId}/quiz/start`)
      .then(({ attemptId: newAttemptId, questions: newQuestions }) => {
        setAttemptId(newAttemptId);
        setQuestions(newQuestions);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [topicId]);

  function selectOption(questionId, option) {
    setSelected((prev) => ({ ...prev, [questionId]: option }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const answers = questions.map((q) => ({
        questionId: q.id,
        selectedOption: selected[q.id] || null,
      }));
      const data = await api.post(`/students/quiz-attempts/${attemptId}/submit`, { answers });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="page-loading">Loading quiz…</div>;

  if (error && !result) {
    return (
      <div className="page">
        <p className="form-error">{error}</p>
        <Link to="/dashboard">Back to dashboard</Link>
      </div>
    );
  }

  if (result) {
    return (
      <div className="page">
        <h1>Quiz results</h1>
        <p className="subject-meta">
          {result.correctCount} / {result.totalQuestions} correct — mastery now {result.score}%
        </p>
        <div className="card-grid">
          {result.results.map((r, i) => {
            const question = questions.find((q) => q.id === r.questionId);
            return (
              <div key={r.questionId} className="card subject-card">
                <p>
                  <strong>Q{i + 1}.</strong> {question?.question_text}
                </p>
                <p className={r.isCorrect ? 'quiz-result-correct' : 'quiz-result-incorrect'}>
                  Your answer: {r.selectedOption || '—'}
                  {r.isCorrect ? ' ✓ correct' : ` ✗ correct answer: ${r.correctOption}`}
                </p>
              </div>
            );
          })}
        </div>
        <button className="btn btn-primary quiz-submit" onClick={() => navigate('/dashboard')}>
          Back to dashboard
        </button>
      </div>
    );
  }

  const allAnswered = questions.every((q) => selected[q.id]);

  return (
    <div className="page">
      <h1>Quick quiz</h1>
      {questions.map((q, i) => (
        <div key={q.id} className="card quiz-question">
          <p>
            <strong>Q{i + 1}.</strong> {q.question_text}
          </p>
          <div className="quiz-options">
            {Object.entries(q.options).map(([key, text]) => (
              <label key={key} className="quiz-option">
                <input
                  type="radio"
                  name={q.id}
                  checked={selected[q.id] === key}
                  onChange={() => selectOption(q.id, key)}
                />
                {key}. {text}
              </label>
            ))}
          </div>
        </div>
      ))}
      {error && <p className="form-error">{error}</p>}
      <button
        className="btn btn-primary quiz-submit"
        disabled={!allAnswered || submitting}
        onClick={handleSubmit}
      >
        {submitting ? 'Submitting…' : 'Submit quiz'}
      </button>
    </div>
  );
}
