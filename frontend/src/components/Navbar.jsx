import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        CBSE Mastery
      </Link>
      <div className="navbar-links">
        {user ? (
          <>
            <span className="navbar-user">{user.email}</span>
            <button onClick={logout} className="btn btn-ghost">
              Log out
            </button>
          </>
        ) : (
          <Link to="/login" className="btn btn-ghost">
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
}
