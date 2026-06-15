import React, { useState, useEffect, useRef } from 'react';
import { getBooks, addBook, updateBook, deleteBook } from '../../api';
import { useToast } from '../../components/Toast';

const EMPTY_FORM = { title: '', author: '', isbn: '', genre: '', total_copies: 1 };

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // null | { book? }
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const overlayRef = useRef();
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getBooks({ q: search });
      setBooks(res.data.books);
    } catch { }
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  const openAdd = () => { setForm(EMPTY_FORM); setError(''); setModal({}); };
  const openEdit = (book) => {
    setForm({ title: book.title, author: book.author, isbn: book.isbn, genre: book.genre || '', total_copies: book.total_copies });
    setError('');
    setModal({ book });
  };

  const handleSave = async () => {
    if (!form.title || !form.author || !form.isbn) { setError('Title, author and ISBN are required'); return; }
    setSaving(true); setError('');
    try {
      if (modal.book) {
        await updateBook(modal.book.id, form);
        toast('Book updated');
      } else {
        await addBook({ ...form, total_copies: parseInt(form.total_copies) });
        toast('Book added');
      }
      setModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error saving book');
    }
    setSaving(false);
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Delete "${book.title}"?`)) return;
    try {
      await deleteBook(book.id);
      toast('Book deleted');
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Delete failed', 'error');
    }
  };

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="page-header">
        <div><h2>Manage Books</h2><p>Add, edit, and remove catalogue entries</p></div>
        <button className="btn btn-amber" onClick={openAdd}>＋ Add Book</button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <span>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search books…" />
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? <div className="loading">Loading…</div> : books.length === 0 ? (
            <div className="empty"><div className="empty-icon">📚</div><p>No books found</p></div>
          ) : (
            <table>
              <thead>
                <tr><th>Book</th><th>ISBN</th><th>Genre</th><th>Copies</th><th>Available</th><th>Actions</th></tr>
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
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{b.isbn}</td>
                    <td>{b.genre ? <span className="badge badge-blue">{b.genre}</span> : '—'}</td>
                    <td>{b.total_copies}</td>
                    <td>
                      {b.available_copies > 0
                        ? <span className="badge badge-green">{b.available_copies}</span>
                        : <span className="badge badge-red">0</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(b)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      <div
        className={`modal-overlay${modal !== null ? ' open' : ''}`}
        ref={overlayRef}
        onClick={e => { if (e.target === overlayRef.current) setModal(null); }}
      >
        <div className="modal">
          <h3>{modal?.book ? 'Edit Book' : 'Add New Book'}</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-row">
            <div className="form-group"><label>Title *</label><input value={form.title} onChange={e => upd('title', e.target.value)} placeholder="Book title" /></div>
            <div className="form-group"><label>Author *</label><input value={form.author} onChange={e => upd('author', e.target.value)} placeholder="Author name" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>ISBN *</label><input value={form.isbn} onChange={e => upd('isbn', e.target.value)} placeholder="978-..." disabled={!!modal?.book} /></div>
            <div className="form-group"><label>Genre</label><input value={form.genre} onChange={e => upd('genre', e.target.value)} placeholder="e.g. Technology" /></div>
          </div>
          <div className="form-group"><label>Total Copies</label><input type="number" min="1" value={form.total_copies} onChange={e => upd('total_copies', e.target.value)} /></div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
