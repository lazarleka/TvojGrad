import { useState } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = (msg) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800);
  };
  return { toasts, show };
}
