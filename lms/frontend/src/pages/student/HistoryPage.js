import React, { useState, useEffect } from 'react';
import { myHistory, payFine } from '../../api';
import { useToast } from '../../components/Toast';

export default function HistoryPage() {
  const [loans, setLoans] = useState([]);
  const [filter, setFilter] = useState('all'); // all | active | returned | overdue
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await myHistory();
      setLoans(res.data.loans);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handlePayFine = async (loan) => {
    setPayingId(loan.id);
    try {
      await payFine(loan.id);
      toast(`Fine of ₹${loan.fine_amount.toFixed(0)} paid!`, 'success');
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Payment failed', 'error');
    }
    setPayingId(null);
  };

  const filtered = loans.filter(l => {
    if (filter === 'all') return true;
    if (filter === 'active') return l.status === 'active';
    if (filter === 'returned') return l.status === 'returned';
    if (filter === 'overdue') return l.status === 'overdue';
    return true;
  });

  const totalFine = loans.reduce((s, l) => s + (l.fine_amount || 0), 0);
  const pendingFine = loans.filter(l => !l.fine_paid && l.fine_amount > 0)
    .reduce((s, l) => s + l.fine_amount, 0);

  const statusBadge = (l) => {
    if (l.status === 'returned') return <span className="badge badge-gray">Returned</span>;
    if (l.status === 'overdue') return <span className="badge badge-red">⚠ {l.overdue_days}d overdue</span>;
    return <span className="badge badge-green">Active</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Borrow History</h2>
          <p>Complete record of all your borrows and returns</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Total Borrowed</div>
          <div className="stat-value">{loans.length}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Total Fines</div>
          <div className="stat-value">₹{totalFine.toFixed(0)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Fine</div>
          <div className="stat-value">₹{pendingFine.toFixed(0)}</div>
        </div>
      </div>

      <div className="tabs">
        {[['all', 'All'], ['active', 'Active'], ['overdue', 'Overdue'], ['returned', 'Returned']].map(([val, label]) => (
          <button
            key={val}
            className={`tab-btn${filter === val ? ' active' : ''}`}
            onClick={() => setFilter(val)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading">Loading history…</div>
          ) : filtered.length === 0 ? (
            <div className="empty"><div className="empty-icon">📋</div><p>No records found</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Borrowed</th>
                  <th>Due</th>
                  <th>Returned</th>
                  <th>Status</th>
                  <th>Fine (₹)</th>
                  <th>Fine Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id} className={l.status === 'overdue' ? 'overdue' : ''}>
                    <td>
                      <div className="book-spine">
                        <div className="book-title">{l.book_title}</div>
                        <div className="book-author">{l.book_author}</div>
                      </div>
                    </td>
                    <td>{l.issued_at}</td>
                    <td>{l.due_date}</td>
                    <td>{l.returned_at || <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                    <td>{statusBadge(l)}</td>
                    <td className="fine-mono">
                      {l.fine_amount > 0 ? `₹${l.fine_amount.toFixed(0)}` : '—'}
                    </td>
                    <td>
                      {l.fine_amount > 0 && l.returned_at ? (
                        l.fine_paid
                          ? <span className="badge badge-green">Paid</span>
                          : (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handlePayFine(l)}
                              disabled={payingId === l.id}
                            >
                              {payingId === l.id ? '…' : `Pay ₹${l.fine_amount.toFixed(0)}`}
                            </button>
                          )
                      ) : <span style={{ color: 'var(--muted)' }}>—</span>}
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
