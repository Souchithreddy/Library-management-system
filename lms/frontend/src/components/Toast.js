import React, { useState, useCallback } from 'react';

let toastFn = null;

export function useToast() {
  return { toast: (msg, type = 'success') => toastFn && toastFn(msg, type) };
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  toastFn = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
      ))}
    </div>
  );
}
