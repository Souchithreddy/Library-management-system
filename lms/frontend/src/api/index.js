import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Auth
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');

// Books
export const getBooks = (params) => api.get('/books/', { params });
export const getBook = (id) => api.get(`/books/${id}`);
export const addBook = (data) => api.post('/books/', data);
export const updateBook = (id, data) => api.put(`/books/${id}`, data);
export const deleteBook = (id) => api.delete(`/books/${id}`);
export const getGenres = () => api.get('/books/genres');

// Loans
export const borrowBook = (book_id) => api.post('/loans/borrow', { book_id });
export const returnBook = (loan_id) => api.post(`/loans/return/${loan_id}`);
export const payFine = (loan_id) => api.post(`/loans/pay-fine/${loan_id}`);
export const myHistory = () => api.get('/loans/my-history');
export const activeLoans = () => api.get('/loans/active');
export const allLoans = () => api.get('/loans/all');
export const getStats = () => api.get('/loans/stats');
export const getMembers = () => api.get('/loans/members');

export default api;
