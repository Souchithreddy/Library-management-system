import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const studentLinks = [
  { to: '/student/browse', icon: '📚', label: 'Browse Books' },
  { to: '/student/my-books', icon: '📖', label: 'My Books' },
  { to: '/student/history', icon: '📋', label: 'Borrow History' },
];

const librarianLinks = [
  { to: '/librarian/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/librarian/books', icon: '📚', label: 'Manage Books' },
  { to: '/librarian/loans', icon: '📋', label: 'Loans' },
  { to: '/librarian/members', icon: '👥', label: 'Members' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === 'librarian' ? librarianLinks : studentLinks;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="logo">
        <h1>📖 LibraryOS</h1>
        <p>Management System</p>
      </div>

      <nav className="nav">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="user-chip">
        <div className="uname">{user?.name}</div>
        <div className="urole">{user?.role}</div>
        <button
          onClick={handleLogout}
          className="btn btn-ghost btn-sm"
          style={{ marginTop: 10, width: '100%', color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.15)' }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
