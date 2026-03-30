'use client';

import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = false, onClick, padding = 'p-6' }) {
  const Component = hover ? motion.div : 'div';
  const hoverProps = hover
    ? { whileHover: { y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }, transition: { duration: 0.2 } }
    : {};

  return (
    <Component
      className={`bg-card rounded-2xl border border-border shadow-sm ${padding} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      {...hoverProps}
    >
      {children}
    </Component>
  );
}
