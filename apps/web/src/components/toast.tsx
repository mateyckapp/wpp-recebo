'use client';

import { useState, useEffect, useRef } from 'react';

const DURATION = 4000;

type ToastVariant = 'success' | 'error';

interface ToastProps {
  title: string;
  message?: string;
  variant?: ToastVariant;
  onClose: () => void;
}

const VARIANT_STYLES: Record<ToastVariant, { border: string; bg: string; icon: string; bar: string }> = {
  success: {
    border: 'border-green-500/30',
    bg: 'bg-[#0d1a0f]',
    icon: 'text-green-400 bg-green-500/20',
    bar: 'bg-green-500',
  },
  error: {
    border: 'border-red-500/30',
    bg: 'bg-[#1a0d0d]',
    icon: 'text-red-400 bg-red-500/20',
    bar: 'bg-red-500',
  },
};

function SuccessIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function Toast({ title, message, variant = 'success', onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const styles = VARIANT_STYLES[variant];

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));

    const step = 100 / (DURATION / 50);
    intervalRef.current = setInterval(() => setProgress((p) => Math.max(0, p - step)), 50);

    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, DURATION);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    setVisible(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 w-80 rounded-xl border shadow-2xl shadow-black/40 overflow-hidden transition-all duration-300 ${styles.border} ${styles.bg} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${styles.icon}`}>
          {variant === 'success' ? <SuccessIcon /> : <ErrorIcon />}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-medium text-white">{title}</p>
          {message && <p className="text-xs text-gray-400 mt-0.5">{message}</p>}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-600 hover:text-gray-300 transition-colors mt-0.5"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="h-0.5 bg-white/[0.04]">
        <div className={`h-full transition-none ${styles.bar}`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
