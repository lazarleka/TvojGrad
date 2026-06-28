import { useState } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = (msg, options = {}) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, position: options.position || "bottom" }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800);
  };
  return { toasts, show };
}
