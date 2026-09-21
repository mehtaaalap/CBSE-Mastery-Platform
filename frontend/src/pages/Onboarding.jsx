import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

const GRADES = [6, 7, 8, 9, 10, 11, 12];

export default function Onboarding() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [account, setAccount] = useState({ fullName: '', email: '', password: '' });
  const [studentProfile, setStudentProfile] = useState({ grade: 9, schoolName: '' });
  const [parentProfile, setParentProfile] = useState({ phone: '', studentEmail: '' });

  async function handleAccountSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register({ ...account, role });
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (role === 'student') {
        await api.put('/students/me', {
          grade: Number(studentProfile.grade),
          schoolName: studentProfile.schoolName,
        });
        navigate('/dashboard');
      } else {
        await api.put('/parents/me', { phone: parentProfile.phone });
        if (parentProfile.studentEmail) {
          await api.post('/parents/students/link', {
            studentEmail: parentProfile.studentEmail,
          });
        }
        navigate('/parent');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>Create your account</h1>
        <p className="step-indicator">Step {step} of 2</p>
        {error && <p className="form-error">{error}</p>}

        {step === 1 && (
          <form onSubmit={handleAccountSubmit}>
            <div className="role-toggle">
              <button
                type="button"
                className={role === 'student' ? 'role-btn active' : 'role-btn'}
                onClick={() => setRole('student')}
              >
                I'm a student
              </button>
              <button
                type="button"
                className={role === 'parent' ? 'role-btn active' : 'role-btn'}
                onClick={() => setRole('parent')}
              >
                I'm a parent
              </button>
            </div>
            <label>
              Full name
              <input
                value={account.fullName}
                onChange={(e) => setAccount({ ...account, fullName: e.target.value })}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={account.email}
                onChange={(e) => setAccount({ ...account, email: e.target.value })}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                minLength={8}
                value={account.password}
                onChange={(e) => setAccount({ ...account, password: e.target.value })}
                required
              />
            </label>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Continue'}
            </button>
          </form>
        )}

        {step === 2 && role === 'student' && (
          <form onSubmit={handleProfileSubmit}>
            <label>
              Grade
              <select
                value={studentProfile.grade}
                onChange={(e) => setStudentProfile({ ...studentProfile, grade: e.target.value })}
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    Class {g}
                  </option>
                ))}
              </select>
            </label>
            <label>
              School name
              <input
                value={studentProfile.schoolName}
                onChange={(e) =>
                  setStudentProfile({ ...studentProfile, schoolName: e.target.value })
                }
                required
              />
            </label>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Finish setup'}
            </button>
          </form>
        )}

        {step === 2 && role === 'parent' && (
          <form onSubmit={handleProfileSubmit}>
            <label>
              Phone number
              <input
                value={parentProfile.phone}
                onChange={(e) => setParentProfile({ ...parentProfile, phone: e.target.value })}
              />
            </label>
            <label>
              Link your child's account (email)
              <input
                type="email"
                placeholder="Optional — can be added later"
                value={parentProfile.studentEmail}
                onChange={(e) =>
                  setParentProfile({ ...parentProfile, studentEmail: e.target.value })
                }
              />
            </label>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Finish setup'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
