'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ToastContainer from '@/components/common/Toast';

export default function AppLayout({ children, title = 'Dashboard', requiredRole }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
    if (!loading && user && requiredRole && user.role !== requiredRole) {
      router.replace(`/${user.role}`);
    }
  }, [user, loading, router, requiredRole]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="animate-pulse text-primary text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
