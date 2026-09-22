import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function Dashboard() {
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/students/me/progress')
      .then(({ subjects: fetchedSubjects }) => setSubjects(fetchedSubjects))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading your progress…</div>;

  return (
    <div className="page">
      <h1>Your progress</h1>
      {error && <p className="form-error">{error}</p>}
      {!error && subjects.length === 0 && (
        <p className="empty-state">
          No subjects found for your grade yet. Check back once your school's curriculum is
          loaded.
        </p>
      )}
      <div className="card-grid">
        {subjects.map((subject) => (
          <div key={subject.subject_id} className="card subject-card">
            <h2>{subject.subject_name}</h2>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${subject.average_mastery}%` }}
              />
            </div>
            <p className="subject-meta">
              {subject.average_mastery}% mastery · {subject.topics_started} topic(s) started
            </p>
            <ul className="topic-list">
              {subject.topics.map((topic) => (
                <li key={topic.id} className="topic-item">
                  <div>
                    <p className="topic-name">{topic.name}</p>
                    <p className="topic-chapter">{topic.chapter}</p>
                  </div>
                  <div className="topic-actions">
                    <span className="topic-mastery">{topic.mastery_level}%</span>
                    {topic.has_quiz && (
                      <Link to={`/quiz/${topic.id}`} className="btn btn-ghost btn-small">
                        Take quiz
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
