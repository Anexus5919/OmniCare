'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiMail, FiLock, FiArrowRight,
  FiHeart, FiActivity, FiEye, FiEyeOff, FiChevronDown,
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

/* ── Role options ── */
const roleOptions = [
  { key: 'patient',   label: 'Patient',   icon: FiUser,     hint: 'rajesh@demo.com' },
  { key: 'doctor',    label: 'Doctor',     icon: FiActivity, hint: 'drmeera@demo.com' },
  { key: 'caregiver', label: 'Caregiver',  icon: FiHeart,    hint: 'priya@demo.com' },
];

/* ── Floating particles ── */
function Particles() {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    setParticles(
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        dur: 10 + Math.random() * 14,
        delay: Math.random() * 10,
        size: 2 + Math.random() * 4,
      }))
    );
  }, []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {particles.map(p => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            bottom: '-10px',
            width: p.size,
            height: p.size,
            '--dur': `${p.dur}s`,
            '--delay': `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Role dropdown ── */
function RoleSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = roleOptions.find(r => r.key === value);

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-slate-500 mb-1.5 tracking-wide uppercase">
        Role
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white/70 hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-left"
      >
        {selected ? (
          <span className="flex items-center gap-2 text-sm font-medium text-text">
            <selected.icon className="w-4 h-4 text-primary" />
            {selected.label}
          </span>
        ) : (
          <span className="text-sm text-slate-400">Select your role</span>
        )}
        <FiChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1.5 w-full bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden"
          >
            {roleOptions.map(r => (
              <li key={r.key}>
                <button
                  type="button"
                  onClick={() => { onChange(r.key); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-primary-50 transition-colors text-left ${
                    value === r.key ? 'bg-primary-50 text-primary font-semibold' : 'text-text'
                  }`}
                >
                  <r.icon className="w-4 h-4" />
                  {r.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Auth form field ── */
function Field({ icon: Icon, label, type = 'text', value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1.5 tracking-wide uppercase">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white/70 text-sm text-text placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow(!show)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {show ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   MAIN LOGIN PAGE
   ════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const [mode, setMode] = useState('signin');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loginWithCredentials, signup, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace(`/${user.role}`);
  }, [user, router]);

  function switchMode(newMode) {
    setMode(newMode);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!role) { setError('Please select a role.'); return; }
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!password.trim()) { setError('Please enter a password.'); return; }
    if (mode === 'signup' && !name.trim()) { setError('Please enter your name.'); return; }

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 600));

    if (mode === 'signin') {
      const result = loginWithCredentials(email, password, role);
      if (result.success) {
        router.push(`/${result.user.role}`);
      } else {
        setError(result.error);
        setIsSubmitting(false);
      }
    } else {
      const result = signup({ name, email, role });
      if (result.success) {
        router.push(`/${result.user.role}`);
      } else {
        setError(result.error);
        setIsSubmitting(false);
      }
    }
  }

  const selectedRoleHint = roleOptions.find(r => r.key === role)?.hint;

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* ── Background image ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/background.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(8,30,50,0.85)] via-[rgba(12,42,62,0.68)] to-[rgba(12,42,62,0.3)]" />

      <Particles />

      {/* ── Content — single viewport, no scroll ── */}
      <div className="relative z-10 h-full flex flex-col md:flex-row">

        {/* LEFT — Auth panel (shifted right from edge for industry-standard feel) */}
        <div className="flex-1 md:flex-none md:w-[480px] lg:w-[520px] flex flex-col justify-center px-6 sm:px-12 md:pl-20 md:pr-12 lg:pl-28 lg:pr-14 py-6 overflow-y-auto">

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <div className="flex items-center gap-4 mb-2">
              <img src="/logo.png" alt="OmniCare" className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl shadow-lg" />
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Omni<span className="text-secondary">Care</span>
              </h1>
            </div>
            <p className="text-sm lg:text-base text-white/50 leading-relaxed">
              Smart Post-Discharge Recovery Companion
            </p>
          </motion.div>

          {/* Auth card with beam border */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="beam-border auth-glow"
          >
            <div className="glass-panel rounded-[1.25rem] p-6 sm:p-7">

              {/* Tab switcher */}
              <div className="flex mb-5 bg-slate-100/80 rounded-xl p-1">
                {['signin', 'signup'].map(m => (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={`relative flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                      mode === m ? 'text-text' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {mode === m && (
                      <motion.div
                        layoutId="authTab"
                        className="absolute inset-0 bg-white rounded-lg shadow-sm"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{m === 'signin' ? 'Sign In' : 'Sign Up'}</span>
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <RoleSelect value={role} onChange={setRole} />

                <AnimatePresence mode="wait">
                  {mode === 'signup' && (
                    <motion.div
                      key="name"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Field
                        icon={FiUser}
                        label="Full Name"
                        value={name}
                        onChange={setName}
                        placeholder="Dr. Jane Smith"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <Field
                  icon={FiMail}
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                />
                <Field
                  icon={FiLock}
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter any password"
                />

                {mode === 'signin' && selectedRoleHint && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2"
                  >
                    Demo: try <span className="font-medium text-primary">{selectedRoleHint}</span> with any password
                  </motion.p>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-sm text-danger bg-red-50 rounded-lg px-3 py-2 border border-red-100"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                      </svg>
                      {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                    </span>
                  ) : (
                    <>
                      {mode === 'signin' ? 'Sign In' : 'Create Account'}
                      <FiArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-slate-400 mt-4">
                {mode === 'signin' ? (
                  <>Don&apos;t have an account?{' '}
                    <button onClick={() => switchMode('signup')} className="text-primary font-medium hover:underline">Sign up</button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button onClick={() => switchMode('signin')} className="text-primary font-medium hover:underline">Sign in</button>
                  </>
                )}
              </p>
            </div>
          </motion.div>

          {/* Quick demo access */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4"
          >
            <p className="text-xs text-white/40 mb-2 uppercase tracking-wider font-medium">Quick Demo Access</p>
            <div className="flex gap-2">
              {roleOptions.map(r => (
                <button
                  key={r.key}
                  onClick={() => {
                    setRole(r.key);
                    setEmail(r.hint);
                    setPassword('demo');
                    setMode('signin');
                    setError('');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-medium transition-all backdrop-blur-sm border border-white/10"
                >
                  <r.icon className="w-3 h-3" />
                  {r.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT — Empty cinematic space, background image breathes */}
        <div className="hidden md:block flex-1" />
      </div>
    </div>
  );
}
