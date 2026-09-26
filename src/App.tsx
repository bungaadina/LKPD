/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthViews } from './components/AuthViews';
import { AdminViews } from './components/AdminViews';
import { GuruViews } from './components/GuruViews';
import { SiswaViews } from './components/SiswaViews';
import { GraduationCap } from 'lucide-react';

function DashboardRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-3 bg-emerald-600 text-white rounded-xl animate-bounce">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Memuat Aplikasi LKPD...</h3>
            <p className="text-xs text-slate-400">Menghubungkan ke database digital terpusat</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthViews />;
  }

  switch (user.role) {
    case 'admin':
      return <AdminViews />;
    case 'guru':
      return <GuruViews />;
    case 'siswa':
      return <SiswaViews />;
    default:
      return <AuthViews />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardRouter />
    </AuthProvider>
  );
}
