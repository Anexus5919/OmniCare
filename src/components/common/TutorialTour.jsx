'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiX, FiGlobe } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';

/**
 * TutorialTour — Clash-of-Clans-style guided walkthrough
 *
 * Props:
 *   steps: [{ target, title_en, title_hi, desc_en, desc_hi, icon, position }]
 *   storageKey: string — localStorage key to track completion
 *   onComplete: () => void
 */
export default function TutorialTour({ steps, storageKey, onComplete }) {
  const { lang, toggleLanguage } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const [rect, setRect] = useState(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const done = localStorage.getItem(storageKey);
    if (!done) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const highlightStep = useCallback((stepIdx) => {
    const step = steps[stepIdx];
    if (!step) return;

    if (step.target) {
      const el = document.querySelector(step.target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(() => {
          const r = el.getBoundingClientRect();
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        }, 350);
      } else {
        setRect(null);
      }
    } else {
      setRect(null);
    }
  }, [steps]);

  useEffect(() => {
    if (visible) highlightStep(current);
  }, [current, visible, highlightStep]);

  useEffect(() => {
    if (!visible) return;
    const handler = () => highlightStep(current);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [visible, current, highlightStep]);

  function handleNext() {
    if (current < steps.length - 1) setCurrent(c => c + 1);
    else finish();
  }

  function handleBack() {
    if (current > 0) setCurrent(c => c - 1);
  }

  function finish() {
    setVisible(false);
    localStorage.setItem(storageKey, 'true');
    onComplete?.();
  }

  if (!visible || !steps || steps.length === 0) return null;

  const step = steps[current];
  const title = lang === 'hi' ? step.title_hi : step.title_en;
  const desc = lang === 'hi' ? step.desc_hi : step.desc_en;
  const isFirst = current === 0;
  const isLast = current === steps.length - 1;

  // Smart tooltip positioning — always stays within viewport
  const tooltipW = 340;
  const tooltipH = 240; // approximate max height
  const pad = 14;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;

  let tooltipStyle = {};

  if (rect) {
    // Clamp left so tooltip doesn't overflow horizontally
    const clampLeft = (l) => Math.max(16, Math.min(l, vw - tooltipW - 16));

    // Try preferred position, fall back if it goes off-screen
    const spaceBelow = vh - (rect.top + rect.height + pad);
    const spaceAbove = rect.top - pad;
    const spaceRight = vw - (rect.left + rect.width + pad);
    const spaceLeft = rect.left - pad;

    const preferred = step.position || 'bottom';

    if (preferred === 'bottom' && spaceBelow >= tooltipH) {
      tooltipStyle = { top: rect.top + rect.height + pad, left: clampLeft(rect.left) };
    } else if (preferred === 'top' && spaceAbove >= tooltipH) {
      tooltipStyle = { top: rect.top - pad - tooltipH, left: clampLeft(rect.left) };
    } else if (preferred === 'right' && spaceRight >= tooltipW + 20) {
      tooltipStyle = { top: Math.max(16, Math.min(rect.top, vh - tooltipH - 16)), left: rect.left + rect.width + pad };
    } else if (preferred === 'left' && spaceLeft >= tooltipW + 20) {
      tooltipStyle = { top: Math.max(16, Math.min(rect.top, vh - tooltipH - 16)), left: rect.left - tooltipW - pad };
    }
    // Fallback: try each direction
    else if (spaceBelow >= tooltipH) {
      tooltipStyle = { top: rect.top + rect.height + pad, left: clampLeft(rect.left) };
    } else if (spaceAbove >= tooltipH) {
      tooltipStyle = { top: rect.top - pad - tooltipH, left: clampLeft(rect.left) };
    } else if (spaceRight >= tooltipW + 20) {
      tooltipStyle = { top: Math.max(16, Math.min(rect.top, vh - tooltipH - 16)), left: rect.left + rect.width + pad };
    } else if (spaceLeft >= tooltipW + 20) {
      tooltipStyle = { top: Math.max(16, Math.min(rect.top, vh - tooltipH - 16)), left: rect.left - tooltipW - pad };
    }
    // Ultimate fallback: overlay centered
    else {
      tooltipStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  } else {
    tooltipStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  }

  return (
    <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: 'auto' }}>
      {/* Overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - 6}
                y={rect.top - 6}
                width={rect.width + 12}
                height={rect.height + 12}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.6)"
          mask="url(#tour-mask)"
        />
      </svg>

      {/* Highlight border */}
      {rect && (
        <motion.div
          key={`highlight-${current}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute border-2 border-primary rounded-xl pointer-events-none"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: '0 0 0 4px rgba(59,130,160,0.3), 0 0 20px rgba(59,130,160,0.2)',
          }}
        />
      )}

      {/* Tooltip */}
      <motion.div
        ref={tooltipRef}
        key={current}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bg-white rounded-2xl shadow-2xl border border-border overflow-hidden"
        style={{ ...tooltipStyle, width: tooltipW, maxWidth: '90vw', pointerEvents: 'auto' }}
      >
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
            style={{ width: `${((current + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-5">
          {/* Header row: icon, step counter, language toggle, close */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {step.icon && <span className="text-xl">{step.icon}</span>}
              <span className="text-[10px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full">
                {current + 1} / {steps.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Language toggle inside tour */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted hover:bg-slate-200 transition-colors text-[10px] font-semibold text-text"
                title={lang === 'en' ? 'हिंदी में देखें' : 'View in English'}
              >
                <FiGlobe className="w-3 h-3" />
                {lang === 'en' ? 'हिंदी' : 'EN'}
              </button>
              <button
                onClick={finish}
                className="text-text-light hover:text-text transition-colors p-1"
                title="Skip tour"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <h3 className="text-base font-bold text-text mb-2">{title}</h3>
          <p className="text-sm text-text-light leading-relaxed">{desc}</p>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-5">
            <button
              onClick={finish}
              className="text-xs text-text-light hover:text-text font-medium transition-colors"
            >
              {lang === 'hi' ? 'टूर छोड़ें' : 'Skip Tour'}
            </button>

            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-text-light bg-muted rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <FiChevronLeft className="w-3.5 h-3.5" />
                  {lang === 'hi' ? 'पीछे' : 'Back'}
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-primary rounded-xl hover:shadow-lg transition-all"
              >
                {isLast
                  ? (lang === 'hi' ? 'शुरू करें!' : 'Get Started!')
                  : (lang === 'hi' ? 'अगला' : 'Next')
                }
                {!isLast && <FiChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
