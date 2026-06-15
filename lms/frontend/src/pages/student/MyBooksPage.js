import React, { useState, useEffect } from 'react';
import { myHistory, returnBook, payFine } from '../../api';
import { useToast } from '../../components/Toast';

export default function MyBooksPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    try {
      const res = await myHistory();
      setLoans(res.data.loans.filter(l => !l.returned_at));
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleReturn = async (loan) => {
    setActionId(loan.id);
    try {
      const res = await returnBook(loan.id);
      const fine = res.data.loan.fine_amount;
      toast(
        fine > 0
          ? `"${loan.book_title}" returned. Fine: ₹${fine.toFixed(0)}`
          : `"${loan.book_title}" returned — no fine!`,
        fine > 0 ? 'error' : 'success'
      );
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to return', 'error');
    }
    setActionId(null);
  };

  const active = loans.filter(l => !l.returned_at);
  const overdue = active.filter(l => l.status === 'overdue');

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>My Books</h2>
          <p>Currently borrowed ({active.length} book{active.length !== 1 ? 's' : ''}, max 3)</p>
        </div>
      </div>

      {overdue.length > 0 && (
        <div className="alert alert-error">
          ⚠ You have {overdue.length} overdue book{overdue.length > 1 ? 's' : ''}. Fine: ₹5/day.
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading">Loading…</div>
          ) : active.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📖</div>
              <p>You have no borrowed books right now</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Borrowed</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Fine (₹)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {active.map(l => (
                  <tr key={l.id} className={l.status === 'overdue' ? 'overdue' : ''}>
                    <td>
                      <div className="book-spine">
                        <div className="book-title">{l.book_title}</div>
                        <div className="book-author">{l.book_author}</div>
                      </div>
                    </td>
                    <td>{l.issued_at}</td>
                    <td>{l.due_date}</td>
                    <td>
                      {l.status === 'overdue'
                        ? <span className="badge badge-red">⚠ {l.overdue_days}d overdue</span>
                        : <span className="badge badge-green">On time</span>}
                    </td>
                    <td className="fine-mono">
                      {l.fine_amount > 0 ? `₹${l.fine_amount.toFixed(0)}` : '—'}
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleReturn(l)}
                        disabled={actionId === l.id}
                      >
                        {actionId === l.id ? '…' : 'Return'}
                      </button>
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
