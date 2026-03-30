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

  function logout() {
    setUser(null);
    localStorage.removeItem('recoverai_currentUser');
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
