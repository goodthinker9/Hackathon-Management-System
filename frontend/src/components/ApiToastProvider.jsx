import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ToastContext = createContext(() => {});

export function ApiToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const timer = useRef(null);
  const showToast = useCallback((text) => {
    setMessage(text);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(''), 5000);
  }, []);

  useEffect(() => {
    const onApiError = (event) => showToast(event.detail);
    window.addEventListener('api-error', onApiError);
    return () => {
      window.removeEventListener('api-error', onApiError);
      window.clearTimeout(timer.current);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {message && (
        <div className="api-toast" role="alert" aria-live="assertive">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage('')} aria-label="Dismiss notification">×</button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
