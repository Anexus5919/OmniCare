'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { seedData, getUsers } from '@/services/storageService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedData();
    const saved = localStorage.getItem('recoverai_currentUser');
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  function login(userId) {
    const users = getUsers();
    const u = users.find(u => u.id === userId);
    if (u) {
      setUser(u);
      localStorage.setItem('recoverai_currentUser', JSON.stringify(u));
    }
    return u;
  }

  /** Email + password + role login for the new auth form */
  function loginWithCredentials(email, password, role) {
    const users = getUsers();
    const u = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.role === role
    );
    if (u) {
      setUser(u);
      localStorage.setItem('recoverai_currentUser', JSON.stringify(u));
      return { success: true, user: u };
    }
    return { success: false, error: 'Invalid credentials. Please use a valid demo email for the selected role.' };
  }

  /** Prototype-level signup — creates a local user in localStorage */
  function signup({ name, email, role }) {
    const users = getUsers();
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const newUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
      avatar: initials,
      ...(role === 'patient' ? { patientId: `pat_${Date.now()}` } : {}),
      ...(role !== 'patient' ? { assignedPatients: [] } : {}),
    };
    users.push(newUser);
    localStorage.setItem('recoverai_users', JSON.stringify(users));
    setUser(newUser);
    localStorage.setItem('recoverai_currentUser', JSON.stringify(newUser));
    return { success: true, user: newUser };
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('recoverai_currentUser');
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithCredentials, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
