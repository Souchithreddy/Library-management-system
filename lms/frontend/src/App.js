import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from './components/Toast';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';

// Student pages
import BrowsePage from './pages/student/BrowsePage';
import MyBooksPage from './pages/student/MyBooksPage';
import HistoryPage from './pages/student/HistoryPage';

// Librarian pages
import DashboardPage from './pages/librarian/DashboardPage';
import BooksPage from './pages/librarian/BooksPage';
import LoansPage from './pages/librarian/LoansPage';
import MembersPage from './pages/librarian/MembersPage';

import './index.css';

function PrivateLayout({ children, allowedRole }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--muted)' }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'librarian' ? '/librarian/dashboard' : '/student/browse'} replace />;
  }
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'librarian' ? '/librarian/dashboard' : '/student/browse'} replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Student routes */}
          <Route path="/student/browse" element={
            <PrivateLayout allowedRole="student"><BrowsePage /></PrivateLayout>
          } />
          <Route path="/student/my-books" element={
            <PrivateLayout allowedRole="student"><MyBooksPage /></PrivateLayout>
          } />
          <Route path="/student/history" element={
            <PrivateLayout allowedRole="student"><HistoryPage /></PrivateLayout>
          } />

          {/* Librarian routes */}
          <Route path="/librarian/dashboard" element={
            <PrivateLayout allowedRole="librarian"><DashboardPage /></PrivateLayout>
          } />
          <Route path="/librarian/books" element={
            <PrivateLayout allowedRole="librarian"><BooksPage /></PrivateLayout>
          } />
          <Route path="/librarian/loans" element={
            <PrivateLayout allowedRole="librarian"><LoansPage /></PrivateLayout>
          } />
          <Route path="/librarian/members" element={
            <PrivateLayout allowedRole="librarian"><MembersPage /></PrivateLayout>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
