import React, { useState, useEffect } from 'react';
import { getBooks, getGenres, borrowBook } from '../../api';
import { useToast } from '../../components/Toast';

export default function BrowsePage() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [loading, setLoading] = useState(false);
  const [borrowing, setBorrowing] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getBooks({ q: search, genre });
      setBooks(res.data.books);
    } catch { }
    setLoading(false);
  };

  useEffect(() => {
    getGenres().then(r => setGenres(r.data.genres)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, genre]);

  const handleBorrow = async (book) => {
    setBorrowing(book.id);
    try {
      await borrowBook(book.id);
      toast(`"${book.title}" borrowed! Due in 14 days.`, 'success');
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to borrow', 'error');
    }
    setBorrowing(null);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Browse Books</h2>
          <p>Search and borrow from our catalogue</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <span>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title, author, ISBN…"
          />
        </div>
        <select
          value={genre}
          onChange={e => setGenre(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, background: 'var(--white)' }}
        >
          <option value="">All Genres</option>
          {genres.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading">Loading books…</div>
          ) : books.length === 0 ? (
            <div className="empty"><div className="empty-icon">📚</div><p>No books found</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Genre</th>
                  <th>Available</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {books.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div className="book-spine">
                        <div className="book-title">{b.title}</div>
                        <div className="book-author">{b.author}</div>
                      </div>
                    </td>
                    <td>
                      {b.genre ? <span className="badge badge-blue">{b.genre}</span> : '—'}
                    </td>
                    <td>
                      {b.available_copies > 0
                        ? <span className="badge badge-green">{b.available_copies} / {b.total_copies}</span>
                        : <span className="badge badge-red">Unavailable</span>}
                    </td>
                    <td>
                      <button
                        className="btn btn-amber btn-sm"
                        onClick={() => handleBorrow(b)}
                        disabled={b.available_copies < 1 || borrowing === b.id}
                      >
                        {borrowing === b.id ? '…' : 'Borrow'}
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
