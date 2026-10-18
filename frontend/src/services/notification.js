/**
 * Centralized Notification Service using react-hot-toast
 * Conforms to Section 7 of UniSphere specifications
 */

import toast from 'react-hot-toast';

// Track recent notifications to prevent duplicate/noisy popups
const recentToasts = new Map();
const DEDUPE_WINDOW_MS = 1500;

function isDuplicate(message) {
  const now = Date.now();
  const lastTime = recentToasts.get(message);
  if (lastTime && now - lastTime < DEDUPE_WINDOW_MS) {
    return true;
  }
  recentToasts.set(message, now);
  // Clean up old entries
  if (recentToasts.size > 50) {
    for (const [k, v] of recentToasts.entries()) {
      if (now - v >= DEDUPE_WINDOW_MS) {
        recentToasts.delete(k);
      }
    }
  }
  return false;
}

export const notify = {
  success: (message, options = {}) => {
    if (!message || isDuplicate(`success:${message}`)) return null;
    return toast.success(message, {
      duration: 3500,
      position: 'top-right',
      style: {
        background: '#ffffff',
        color: '#0f172a',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        fontSize: '13px',
        fontWeight: '600',
        padding: '12px 16px',
      },
      iconTheme: {
        primary: '#10b981',
        secondary: '#ffffff',
      },
      ...options,
    });
  },

  error: (message, options = {}) => {
    if (!message || isDuplicate(`error:${message}`)) return null;
    return toast.error(message, {
      duration: 4500,
      position: 'top-right',
      style: {
        background: '#ffffff',
        color: '#991b1b',
        borderRadius: '12px',
        border: '1px solid #fecaca',
        boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.15)',
        fontSize: '13px',
        fontWeight: '600',
        padding: '12px 16px',
      },
      iconTheme: {
        primary: '#ef4444',
        secondary: '#ffffff',
      },
      ...options,
    });
  },

  info: (message, options = {}) => {
    if (!message || isDuplicate(`info:${message}`)) return null;
    return toast(message, {
      duration: 3500,
      position: 'top-right',
      style: {
        background: '#ffffff',
        color: '#1e3a8a',
        borderRadius: '12px',
        border: '1px solid #bfdbfe',
        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1)',
        fontSize: '13px',
        fontWeight: '600',
        padding: '12px 16px',
      },
      ...options,
    });
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#ffffff',
        color: '#0f172a',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        fontSize: '13px',
        fontWeight: '600',
        padding: '12px 16px',
      },
      ...options,
    });
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },
};

export default notify;
