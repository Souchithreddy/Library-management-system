import React, { useState, useEffect } from 'react';
import { allLoans, returnBook, payFine } from '../../api';
import { useToast } from '../../components/Toast';

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [actionId, setActionId] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await allLoans();
      setLoans(res.data.loans);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleReturn = async (loan) => {
    setActionId(loan.id);
    try {
      const res = await returnBook(loan.id);
      const fine = res.data.loan.fine_amount;
      toast(fine > 0 ? `Returned. Fine: ₹${fine.toFixed(0)}` : 'Returned — no fine.', 'success');
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Error', 'error');
    }
    setActionId(null);
  };

  const handlePayFine = async (loan) => {
    setActionId(loan.id);
    try {
      await payFine(loan.id);
      toast(`Fine of ₹${loan.fine_amount.toFixed(0)} marked as paid`, 'success');
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Error', 'error');
    }
    setActionId(null);
  };

  const filtered = loans.filter(l => {
    if (tab === 'all') return true;
    if (tab === 'active') return l.status === 'active';
    if (tab === 'overdue') return l.status === 'overdue';
    if (tab === 'returned') return l.status === 'returned';
    return true;
  });

  const counts = {
    all: loans.length,
    active: loans.filter(l => l.status === 'active').length,
    overdue: loans.filter(l => l.status === 'overdue').length,
    returned: loans.filter(l => l.status === 'returned').length,
  };

  const statusBadge = (l) => {
    if (l.status === 'returned') return <span className="badge badge-gray">Returned</span>;
    if (l.status === 'overdue') return <span className="badge badge-red">⚠ {l.overdue_days}d overdue</span>;
    return <span className="badge badge-green">Active</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>Loans & Returns</h2><p>Full loan history and fine management</p></div>
      </div>

      <div className="tabs">
        {[['all', 'All'], ['active', 'Active'], ['overdue', 'Overdue'], ['returned', 'Returned']].map(([val, label]) => (
          <button
            key={val}
            className={`tab-btn${tab === val ? ' active' : ''}`}
            onClick={() => setTab(val)}
          >
            {label} <span style={{ marginLeft: 4, background: 'var(--cream2)', padding: '1px 7px', borderRadius: 10, fontSize: 11 }}>{counts[val]}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading">Loading loans…</div>
          ) : filtered.length === 0 ? (
            <div className="empty"><div className="empty-icon">📋</div><p>No loans found</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Student</th>
                  <th>Issued</th>
                  <th>Due</th>
                  <th>Returned</th>
                  <th>Status</th>
                  <th>Fine (₹)</th>
                  <th>Actions</th>
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
                    <td>
                      <div style={{ fontWeight: 600 }}>{l.student_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{l.student_email}</div>
                    </td>
                    <td>{l.issued_at}</td>
                    <td>{l.due_date}</td>
                    <td>{l.returned_at || <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                    <td>{statusBadge(l)}</td>
                    <td className="fine-mono">
                      {l.fine_amount > 0
                        ? <span style={{ color: l.fine_paid ? 'var(--green)' : 'var(--red)' }}>
                            ₹{l.fine_amount.toFixed(0)} {l.fine_paid ? '✓' : ''}
                          </span>
                        : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {!l.returned_at && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleReturn(l)}
                            disabled={actionId === l.id}
                          >
                            {actionId === l.id ? '…' : 'Return'}
                          </button>
                        )}
                        {l.returned_at && l.fine_amount > 0 && !l.fine_paid && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handlePayFine(l)}
                            disabled={actionId === l.id}
                          >
                            {actionId === l.id ? '…' : 'Pay Fine'}
                          </button>
                        )}
                      </div>
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
