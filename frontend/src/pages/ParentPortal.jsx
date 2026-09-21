import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function ParentPortal() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [linkEmail, setLinkEmail] = useState('');
  const [linking, setLinking] = useState(false);

  function loadStudents() {
    setLoading(true);
    return api
      .get('/parents/students')
      .then(({ students: fetchedStudents }) => setStudents(fetchedStudents))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadStudents();
  }, []);

  async function handleLink(e) {
    e.preventDefault();
    setError('');
    setLinking(true);
    try {
      await api.post('/parents/students/link', { studentEmail: linkEmail });
      setLinkEmail('');
      await loadStudents();
    } catch (err) {
      setError(err.message);
    } finally {
      setLinking(false);
    }
  }

  return (
    <div className="page">
      <h1>Your children</h1>
      {error && <p className="form-error">{error}</p>}

      <form className="card link-form" onSubmit={handleLink}>
        <label>
          Link a student by email
          <input
            type="email"
            value={linkEmail}
            onChange={(e) => setLinkEmail(e.target.value)}
            placeholder="student@example.com"
            required
          />
        </label>
        <button className="btn btn-primary" type="submit" disabled={linking}>
          {linking ? 'Linking…' : 'Link student'}
        </button>
      </form>

      {loading ? (
        <div className="page-loading">Loading…</div>
      ) : students.length === 0 ? (
        <p className="empty-state">No students linked yet. Link one above to see their progress.</p>
      ) : (
        <div className="card-grid">
          {students.map((student) => (
            <div key={student.id} className="card subject-card">
              <h2>{student.full_name}</h2>
              <p className="subject-meta">
                Class {student.grade} · {student.relationship}
              </p>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${student.overall_mastery}%` }}
                />
              </div>
              <p className="subject-meta">{student.overall_mastery}% overall mastery</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
