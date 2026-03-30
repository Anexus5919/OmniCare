'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';

/**
 * TutorialTour — Clash-of-Clans-style guided walkthrough
 *
 * Props:
 *   steps: [{ target: '#css-selector' | null, title_en, title_hi, desc_en, desc_hi, position?: 'bottom'|'top'|'left'|'right' }]
 *   storageKey: string — localStorage key to track if tour was completed
 *   onComplete: () => void
 */
export default function TutorialTour({ steps, storageKey, onComplete }) {
  const { lang } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const [rect, setRect] = useState(null);
  const tooltipRef = useRef(null);

  // Show tour only if not completed before
  useEffect(() => {
    const done = localStorage.getItem(storageKey);
    if (!done) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  // Highlight the target element
  const highlightStep = useCallback((stepIdx) => {
    const step = steps[stepIdx];
    if (!step) return;

    if (step.target) {
      const el = document.querySelector(step.target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        // Small delay for scroll to finish
        setTimeout(() => {
          const r = el.getBoundingClientRect();
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        }, 300);
      } else {
        setRect(null);
      }
    } else {
      // No target — center the tooltip (welcome/end screens)
      setRect(null);
    }
  }, [steps]);

  useEffect(() => {
    if (visible) highlightStep(current);
  }, [current, visible, highlightStep]);

  // Recalc on resize
  useEffect(() => {
    if (!visible) return;
    const handler = () => highlightStep(current);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [visible, current, highlightStep]);

  function handleNext() {
    if (current < steps.length - 1) {
      setCurrent(c => c + 1);
    } else {
      finish();
    }
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

  // Calculate tooltip position
  const pad = 12;
  let tooltipStyle = {};

  if (rect) {
    const pos = step.position || 'bottom';
    if (pos === 'bottom') {
      tooltipStyle = { top: rect.top + rect.height + pad, left: Math.max(16, Math.min(rect.left, window.innerWidth - 360)) };
    } else if (pos === 'top') {
      tooltipStyle = { top: Math.max(16, rect.top - pad - 200), left: Math.max(16, Math.min(rect.left, window.innerWidth - 360)) };
    } else if (pos === 'right') {
      tooltipStyle = { top: rect.top, left: rect.left + rect.width + pad };
    } else if (pos === 'left') {
      tooltipStyle = { top: rect.top, left: Math.max(16, rect.left - 360 - pad) };
    }
  } else {
    // Centered (no target)
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

      {/* Highlight border around target */}
      {rect && (
        <motion.div
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

      {/* Tooltip card */}
      <motion.div
        ref={tooltipRef}
        key={current}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute w-[340px] max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-border overflow-hidden"
        style={{ ...tooltipStyle, pointerEvents: 'auto' }}
      >
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
            style={{ width: `${((current + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-5">
          {/* Step icon/number */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {step.icon && <span className="text-xl">{step.icon}</span>}
              <span className="text-[10px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full">
                {current + 1} / {steps.length}
              </span>
            </div>
            <button
              onClick={finish}
              className="text-text-light hover:text-text transition-colors p-1"
              title="Skip tour"
            >
              <FiX className="w-4 h-4" />
            </button>
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
              {lang === 'hi' ? 'छोड़ें' : 'Skip Tour'}
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
