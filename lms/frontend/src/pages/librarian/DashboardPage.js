import React, { useState, useEffect } from 'react';
import { getStats, activeLoans, returnBook } from '../../api';
import { useToast } from '../../components/Toast';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loans, setLoans] = useState([]);
  const { toast } = useToast();

  const load = async () => {
    try {
      const [sr, lr] = await Promise.all([getStats(), activeLoans()]);
      setStats(sr.data);
      setLoans(lr.data.loans);
    } catch { }
  };

  useEffect(() => { load(); }, []);

  const handleReturn = async (loan) => {
    try {
      const res = await returnBook(loan.id);
      const fine = res.data.loan.fine_amount;
      toast(fine > 0 ? `Returned. Fine: ₹${fine.toFixed(0)}` : 'Returned — no fine.', 'success');
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Error', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>Dashboard</h2><p>Library overview</p></div>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-label">Total Books</div><div className="stat-value">{stats.total_books}</div></div>
          <div className="stat-card blue"><div className="stat-label">Available</div><div className="stat-value">{stats.available_books}</div></div>
          <div className="stat-card"><div className="stat-label">Active Loans</div><div className="stat-value">{stats.active_loans}</div></div>
          <div className="stat-card red"><div className="stat-label">Overdue</div><div className="stat-value">{stats.overdue_loans}</div></div>
          <div className="stat-card"><div className="stat-label">Members</div><div className="stat-value">{stats.total_members}</div></div>
          <div className="stat-card green"><div className="stat-label">Fines Collected (₹)</div><div className="stat-value">{stats.fines_collected}</div></div>
          <div className="stat-card red"><div className="stat-label">Fines Pending (₹)</div><div className="stat-value">{stats.fines_pending}</div></div>
        </div>
      )}

      <h3 style={{ marginBottom: 14, fontWeight: 700, color: 'var(--navy)', fontSize: 17 }}>Active Loans</h3>
      <div className="card">
        <div className="table-wrap">
          {loans.length === 0 ? (
            <div className="empty"><div className="empty-icon">📋</div><p>No active loans</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Book</th><th>Student</th><th>Issued</th><th>Due</th><th>Status</th><th>Fine</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loans.map(l => (
                  <tr key={l.id} className={l.status === 'overdue' ? 'overdue' : ''}>
                    <td>
                      <div className="book-spine">
                        <div className="book-title">{l.book_title}</div>
                        <div className="book-author">{l.book_author}</div>
                      </div>
                    </td>
                    <td><div style={{ fontWeight: 600 }}>{l.student_name}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{l.student_email}</div></td>
                    <td>{l.issued_at}</td>
                    <td>{l.due_date}</td>
                    <td>
                      {l.status === 'overdue'
                        ? <span className="badge badge-red">⚠ {l.overdue_days}d</span>
                        : <span className="badge badge-green">On time</span>}
                    </td>
                    <td className="fine-mono">{l.fine_amount > 0 ? `₹${l.fine_amount.toFixed(0)}` : '—'}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => handleReturn(l)}>Return</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
