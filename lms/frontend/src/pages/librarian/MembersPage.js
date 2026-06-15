import React, { useState, useEffect } from 'react';
import { getMembers, allLoans } from '../../api';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [memberLoans, setMemberLoans] = useState([]);
  const [loansLoading, setLoansLoading] = useState(false);

  useEffect(() => {
    getMembers()
      .then(r => setMembers(r.data.members))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const viewMember = async (member) => {
    setSelected(member);
    setLoansLoading(true);
    try {
      const res = await allLoans();
      setMemberLoans(res.data.loans.filter(l => l.student_id === member.id));
    } catch {}
    setLoansLoading(false);
  };

  const statusBadge = (l) => {
    if (l.status === 'returned') return <span className="badge badge-gray">Returned</span>;
    if (l.status === 'overdue') return <span className="badge badge-red">⚠ Overdue</span>;
    return <span className="badge badge-green">Active</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>Members</h2><p>Registered students and their loan summaries</p></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.6fr' : '1fr', gap: 24 }}>
        {/* Members list */}
        <div className="card">
          <div className="table-wrap">
            {loading ? (
              <div className="loading">Loading members…</div>
            ) : members.length === 0 ? (
              <div className="empty"><div className="empty-icon">👥</div><p>No members found</p></div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Active Loans</th>
                    <th>Pending Fine</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => (
                    <tr
                      key={m.id}
                      style={{ cursor: 'pointer', background: selected?.id === m.id ? 'var(--cream)' : '' }}
                    >
                      <td>
                        <div style={{ fontWeight: 600 }}>{m.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{m.email}</div>
                      </td>
                      <td>
                        <span className={`badge ${m.overdue_loans > 0 ? 'badge-red' : m.active_loans > 0 ? 'badge-blue' : 'badge-gray'}`}>
                          {m.active_loans}
                          {m.overdue_loans > 0 ? ` (${m.overdue_loans} overdue)` : ''}
                        </span>
                      </td>
                      <td className="fine-mono">
                        {m.pending_fine > 0
                          ? <span style={{ color: 'var(--red)' }}>₹{m.pending_fine.toFixed(0)}</span>
                          : '—'}
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => viewMember(m)}>
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Member detail */}
        {selected && (
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>{selected.name}</h3>
                    <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>{selected.email}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>
                      Member since {new Date(selected.created_at).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕ Close</button>
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                  <div style={{ flex: 1, background: 'var(--cream)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active Loans</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)' }}>{selected.active_loans}</div>
                  </div>
                  <div style={{ flex: 1, background: 'var(--cream)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Overdue</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: selected.overdue_loans > 0 ? 'var(--red)' : 'var(--navy)' }}>{selected.overdue_loans}</div>
                  </div>
                  <div style={{ flex: 1, background: 'var(--cream)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pending Fine</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: selected.pending_fine > 0 ? 'var(--red)' : 'var(--navy)' }}>₹{selected.pending_fine}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="table-wrap">
                {loansLoading ? (
                  <div className="loading">Loading history…</div>
                ) : memberLoans.length === 0 ? (
                  <div className="empty"><div className="empty-icon">📋</div><p>No borrow history</p></div>
                ) : (
                  <table>
                    <thead>
                      <tr><th>Book</th><th>Issued</th><th>Due</th><th>Returned</th><th>Status</th><th>Fine</th></tr>
                    </thead>
                    <tbody>
                      {memberLoans.map(l => (
                        <tr key={l.id} className={l.status === 'overdue' ? 'overdue' : ''}>
                          <td>
                            <div className="book-spine">
                              <div className="book-title">{l.book_title}</div>
                            </div>
                          </td>
                          <td>{l.issued_at}</td>
                          <td>{l.due_date}</td>
                          <td>{l.returned_at || '—'}</td>
                          <td>{statusBadge(l)}</td>
                          <td className="fine-mono">
                            {l.fine_amount > 0
                              ? <span style={{ color: l.fine_paid ? 'var(--green)' : 'var(--red)' }}>
                                  ₹{l.fine_amount.toFixed(0)}{l.fine_paid ? ' ✓' : ''}
                                </span>
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
