import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Award,
  BookOpen,
  Calendar,
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Search,
  ChevronLeft,
  GraduationCap,
  Sparkles,
  LogOut,
  Clock,
  ExternalLink,
  Menu,
  X,
  LayoutDashboard
} from 'lucide-react';

export const GuruViews: React.FC = () => {
  const { token, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'siswa-binaan'>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Dashboard Stats
  const [stats, setStats] = useState<any>({ totalSiswaBinaan: 0, totalEvaluasiDiberikan: 0, recentEvaluations: [] });
  const [loadingStats, setLoadingStats] = useState(true);

  // Student Binaan List
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Student Detailed Profile
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Master events for evaluation linking
  const [eventsList, setEventsList] = useState<any[]>([]);

  // Add/Edit Evaluation Form Modal
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [editingEval, setEditingEval] = useState<any>(null);
  const [evalKategori, setEvalKategori] = useState<'akademik' | 'perilaku' | 'pengembangan_diri'>('akademik');
  const [evalKomentar, setEvalKomentar] = useState('');
  const [evalEventId, setEvalEventId] = useState('');
  const [evalError, setEvalError] = useState('');

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/v1/guru/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await fetch('/api/v1/guru/siswa', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStudents(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchStudentDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/v1/guru/siswa/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStudentDetail(data.data);
      } else {
        alert(data.error?.message || 'Gagal memuat detail siswa.');
        setSelectedStudentId(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/v1/master/events-list');
      const data = await res.json();
      if (data.success) {
        setEventsList(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') fetchStats();
    if (activeTab === 'siswa-binaan') {
      fetchStudents();
      fetchEvents();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentDetail(selectedStudentId);
    }
  }, [selectedStudentId]);

  const handleOpenAddEval = () => {
    setEditingEval(null);
    setEvalKategori('akademik');
    setEvalKomentar('');
    setEvalEventId(eventsList[0]?.id || '');
    setEvalError('');
    setIsEvalModalOpen(true);
  };

  const handleOpenEditEval = (evaluation: any) => {
    setEditingEval(evaluation);
    setEvalKategori(evaluation.kategori);
    setEvalKomentar(evaluation.komentar);
    setEvalEventId(evaluation.eventId || '');
    setEvalError('');
    setIsEvalModalOpen(true);
  };

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvalError('');

    if (evalKomentar.trim().length < 20) {
      setEvalError('Komentar evaluasi minimal harus 20 karakter sesuai standar kurikulum (RULE-08 violated).');
      return;
    }

    const payload = {
      siswaId: selectedStudentId,
      kategori: evalKategori,
      komentar: evalKomentar,
      eventId: evalEventId || null
    };

    const endpoint = editingEval
      ? `/api/v1/guru/evaluasi/${editingEval.id}`
      : '/api/v1/guru/evaluasi';
    const method = editingEval ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setIsEvalModalOpen(false);
        if (selectedStudentId) fetchStudentDetail(selectedStudentId);
      } else {
        setEvalError(data.error?.message || 'Gagal menyimpan evaluasi.');
      }
    } catch (err) {
      setEvalError('Koneksi server gagal.');
    }
  };

  const handleDeleteEvaluation = async (evalId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus evaluasi ini?')) return;
    try {
      const res = await fetch(`/api/v1/guru/evaluasi/${evalId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if (selectedStudentId) fetchStudentDetail(selectedStudentId);
      } else {
        alert(data.error?.message || 'Gagal menghapus evaluasi.');
      }
    } catch (err) {
      alert('Koneksi server gagal.');
    }
  };

  // Student filtering
  const filteredStudents = students.filter(s =>
    s.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.nis?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Side Panel for Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transform ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static transition-transform duration-300 ease-in-out border-r border-slate-800`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-md font-bold tracking-tight text-white">
              LKPD Guru
            </span>
          </div>
          <button 
            className="md:hidden p-1 text-slate-400 hover:text-white"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <button
            onClick={() => { setActiveTab('dashboard'); setSelectedStudentId(null); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dashboard' && !selectedStudentId
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/10'
                : 'hover:bg-slate-800 hover:text-white text-slate-400'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </button>

          <button
            onClick={() => { setActiveTab('siswa-binaan'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'siswa-binaan' || selectedStudentId
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/10'
                : 'hover:bg-slate-800 hover:text-white text-slate-400'
            }`}
          >
            <Users className="h-4 w-4" />
            Binaan LKPD
          </button>
        </nav>

        {/* Sidebar Footer Account & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 px-2 py-1.5 mb-2">
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs uppercase">
              {user?.nama?.substring(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-xs font-semibold text-white truncate">{user?.nama}</span>
              <span className="block text-[9px] uppercase text-slate-500 tracking-wider">Guru Pembimbing</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <LogOut className="h-4 w-4 text-slate-400" />
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden animate-fade-in"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Row for Desktop and Mobile */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-bold tracking-tight text-slate-900 hidden md:inline">
              LKPD Guru Portal
            </span>
            <span className="text-sm font-bold tracking-tight text-slate-900 md:hidden">
              LKPD Guru
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="block text-xs font-semibold text-slate-900">{user?.nama}</span>
              <span className="block text-[10px] uppercase text-slate-400 tracking-wider">Wali Kelas Binaan</span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors md:flex hidden"
              title="Log Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Main Container */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">

        {/* Selected Student Profile Detail */}
        {selectedStudentId && studentDetail ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedStudentId(null)}
                className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Kembali ke Daftar Binaan
              </button>

              <button
                onClick={handleOpenAddEval}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Tambah Evaluasi Baru
              </button>
            </div>

            {/* Profile Overview Banner */}
            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-bold text-xl font-serif">
                  {studentDetail.profile.nama.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{studentDetail.profile.nama}</h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="font-mono">NIS: {studentDetail.profile.nis}</span>
                    <span>·</span>
                    <span className="font-semibold">{studentDetail.profile.kelas}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-slate-500 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-8">
                <div>
                  <span className="block text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Email</span>
                  <span className="text-slate-800 font-medium">{studentDetail.profile.email}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Kontak</span>
                  <span className="text-slate-800 font-mono font-medium">{studentDetail.profile.kontak || '-'}</span>
                </div>
              </div>
            </div>

            {/* Main Details Grid: Grades, Events, and Evaluations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left & Middle Column: Grades & Events */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Grades */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-emerald-600" />
                      Rekapitulasi Nilai Akademik
                    </span>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                        <th className="px-6 py-3">Mata Pelajaran / Event</th>
                        <th className="px-6 py-3">Periode</th>
                        <th className="px-6 py-3 text-right">Nilai Akhir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {studentDetail.nilai.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-slate-400">Belum ada data nilai akademik.</td>
                        </tr>
                      ) : (
                        studentDetail.nilai.map((n: any) => (
                          <tr key={n.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-3.5 font-medium text-slate-900">{n.mapelOrEvent}</td>
                            <td className="px-6 py-3.5 text-slate-500">{n.periode}</td>
                            <td className="px-6 py-3.5 text-right font-mono font-bold text-slate-900 tabular-nums">{n.nilai.toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Events */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <Award className="h-4 w-4 text-emerald-600" />
                      Aktivitas & Kompetensi yang Diikuti
                    </span>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                        <th className="px-6 py-3">Nama Event</th>
                        <th className="px-6 py-3">Penyelenggara / Tempat</th>
                        <th className="px-6 py-3">Peran</th>
                        <th className="px-6 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {studentDetail.events.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Siswa belum mengikuti event/kompetensi.</td>
                        </tr>
                      ) : (
                        studentDetail.events.map((e: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-3.5 font-medium text-slate-900">{e.nama}</td>
                            <td className="px-6 py-3.5 text-slate-500">{e.penyelenggara} · {e.lokasi}</td>
                            <td className="px-6 py-3.5 text-slate-600 font-semibold">{e.peran}</td>
                            <td className="px-6 py-3.5 text-right font-semibold text-emerald-700">{e.status}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Right Column: Evaluations */}
              <div className="space-y-6">
                <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <span className="text-sm font-semibold text-slate-900 block mb-4 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                    Histori Evaluasi Guru Wali
                  </span>

                  <div className="space-y-4">
                    {studentDetail.evaluasi.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-lg">
                        <p className="text-xs text-slate-400">Belum ada evaluasi untuk siswa ini.</p>
                      </div>
                    ) : (
                      studentDetail.evaluasi.map((ev: any) => (
                        <div key={ev.id} className="p-4 bg-slate-50 border border-slate-100 rounded-lg relative space-y-2 group transition-all hover:border-slate-300">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                            <span>{ev.kategori.replace('_', ' ')}</span>
                            <span className="font-mono">{new Date(ev.createdAt).toLocaleDateString()}</span>
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            {ev.komentar}
                          </p>

                          {ev.eventName && (
                            <div className="text-[10px] text-slate-500 font-medium bg-white px-2 py-0.5 border border-slate-100 inline-block rounded">
                              🔗 {ev.eventName}
                            </div>
                          )}

                          {ev.guruId === user?.id && (
                            <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1.5 bg-slate-50 pl-2">
                              <button
                                onClick={() => handleOpenEditEval(ev)}
                                className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteEvaluation(ev.id)}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : activeTab === 'dashboard' ? (
          /* Dashboard Main Sub-View */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Selamat Datang, {user?.nama}</h1>
                <p className="text-sm text-slate-500">Akses ringkasan bimbingan dan pelacakan perkembangan belajar siswa Anda.</p>
              </div>
            </div>

            {/* Mini metrics widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Siswa Binaan LKPD</span>
                  <span className="block text-3xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums">
                    {loadingStats ? '...' : stats.totalSiswaBinaan}
                  </span>
                </div>
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Users className="h-6 w-6" />
                </div>
              </div>

              <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Total Catatan Evaluasi</span>
                  <span className="block text-3xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums">
                    {loadingStats ? '...' : stats.totalEvaluasiDiberikan}
                  </span>
                </div>
                <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                  <MessageSquare className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Recent Evaluations table or list */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-900">Catatan Evaluasi Guru Terakhir</span>
              </div>
              <div className="divide-y divide-slate-100">
                {loadingStats ? (
                  <div className="p-8 text-center text-slate-400 text-sm">Memuat histori...</div>
                ) : stats.recentEvaluations.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">Anda belum menambahkan catatan evaluasi apapun.</div>
                ) : (
                  stats.recentEvaluations.map((ev: any) => (
                    <div key={ev.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div>
                        <span className="px-2 py-0.5 bg-slate-100 rounded font-semibold text-[9px] uppercase tracking-wider text-slate-600 mr-2">
                          {ev.kategori.replace('_', ' ')}
                        </span>
                        <strong className="text-slate-900">{ev.siswaNama}</strong>: {ev.komentar}
                      </div>
                      <span className="text-slate-400 whitespace-nowrap font-mono">{new Date(ev.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Students list tab */
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daftar Siswa Binaan Anda</h1>
              <p className="text-sm text-slate-500">Pilih salah satu siswa di bawah ini untuk melihat rekap nilai, event, dan bimbingan.</p>
            </div>

            {/* Filter and search */}
            <div className="flex gap-4 p-4 bg-white border border-slate-200 rounded-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari siswa binaan berdasarkan nama atau NIS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Table or list grid */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="px-6 py-3.5">Nama Lengkap</th>
                    <th className="px-6 py-3.5">NIS</th>
                    <th className="px-6 py-3.5">Kelas</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {loadingStudents ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Memuat data binaan...</td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Tidak ada siswa binaan ditemukan.</td>
                    </tr>
                  ) : (
                    filteredStudents.map((s: any) => (
                      <tr key={s.userId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">{s.nama}</td>
                        <td className="px-6 py-4 font-mono">{s.nis}</td>
                        <td className="px-6 py-4 font-medium text-slate-600">{s.kelas}</td>
                        <td className="px-6 py-4 text-slate-500">{s.email}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedStudentId(s.userId)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1.5 ml-auto transition-colors shadow-sm"
                          >
                            Buka Detail
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Evaluation Add/Edit Modal */}
      {isEvalModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">
                {editingEval ? 'Ubah' : 'Tambah'} Catatan Evaluasi LKPD
              </span>
              <button onClick={() => setIsEvalModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">&times;</button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="p-6 space-y-4">
              {evalError && (
                <div className="p-3 bg-rose-50 text-xs text-rose-800 rounded border-l-4 border-rose-600">
                  {evalError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Kategori Evaluasi</label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setEvalKategori('akademik')}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      evalKategori === 'akademik'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Akademik
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvalKategori('perilaku')}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      evalKategori === 'perilaku'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Perilaku
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvalKategori('pengembangan_diri')}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      evalKategori === 'pengembangan_diri'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Pengembangan Diri
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Keterkaitan Event (Opsional)</label>
                <select
                  value={evalEventId}
                  onChange={(e) => setEvalEventId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="">-- Tidak Dikaitkan Dengan Event --</option>
                  {eventsList.map((ev: any) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Komentar & Catatan Evaluasi (Min. 20 Karakter)</label>
                <textarea
                  required
                  rows={5}
                  value={evalKomentar}
                  onChange={(e) => setEvalKomentar(e.target.value)}
                  placeholder="Berikan saran bimbingan belajar, catatan sikap, atau rekomendasi target perguruan tinggi negeri..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none focus:bg-white transition-all"
                />
                <span className="block text-[10px] text-right mt-1 text-slate-400">
                  {evalKomentar.trim().length} / 1000 karakter
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEvalModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Simpan Evaluasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
