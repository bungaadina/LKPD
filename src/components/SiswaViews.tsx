import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  BookOpen,
  Award,
  Search,
  CheckCircle,
  TrendingUp,
  MapPin,
  ExternalLink,
  Bell,
  MessageSquare,
  Sparkles,
  LogOut,
  Filter,
  Layers,
  GraduationCap,
  Menu,
  X,
  LayoutDashboard
} from 'lucide-react';

export const SiswaViews: React.FC = () => {
  const { token, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'event' | 'nilai-evaluasi' | 'ptn'>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Stats
  const [stats, setStats] = useState<any>({ totalEventDiikuti: 0, averageNilai: '0.00', recentEvaluations: [], notifications: [] });
  const [loadingStats, setLoadingStats] = useState(true);

  // Lists
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [grades, setGrades] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loadingGrades, setLoadingGrades] = useState(false);

  const [ptnList, setPtnList] = useState<any[]>([]);
  const [loadingPtn, setLoadingPtn] = useState(false);
  const [ptnSearch, setPtnSearch] = useState('');
  const [ptnLocationFilter, setPtnLocationFilter] = useState('');

  // Selected PTN detail
  const [selectedPtn, setSelectedPtn] = useState<any | null>(null);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/v1/siswa/dashboard', {
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

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch('/api/v1/siswa/event', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchGradesAndEvals = async () => {
    setLoadingGrades(true);
    try {
      const rGrades = await fetch('/api/v1/siswa/nilai', { headers: { 'Authorization': `Bearer ${token}` } });
      const dGrades = await rGrades.json();

      const rEvals = await fetch('/api/v1/siswa/evaluasi', { headers: { 'Authorization': `Bearer ${token}` } });
      const dEvals = await rEvals.json();

      if (dGrades.success) setGrades(dGrades.data);
      if (dEvals.success) setEvaluations(dEvals.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGrades(false);
    }
  };

  const fetchPtn = async () => {
    setLoadingPtn(true);
    try {
      const res = await fetch('/api/v1/siswa/ptn', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPtnList(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPtn(false);
    }
  };

  const markNotifRead = async (id: string) => {
    try {
      await fetch(`/api/v1/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') fetchStats();
    if (activeTab === 'event') fetchEvents();
    if (activeTab === 'nilai-evaluasi') fetchGradesAndEvals();
    if (activeTab === 'ptn') fetchPtn();
  }, [activeTab]);

  // PTN filtering
  const filteredPtn = ptnList.filter(p => {
    const matchesSearch = p.nama.toLowerCase().includes(ptnSearch.toLowerCase()) ||
      p.jurusan.some((j: string) => j.toLowerCase().includes(ptnSearch.toLowerCase()));
    const matchesLocation = ptnLocationFilter ? p.lokasi.includes(ptnLocationFilter) : true;
    return matchesSearch && matchesLocation;
  });

  // Unique locations of PTNs for filter dropdown
  const uniqueLocations = Array.from(new Set(ptnList.map(p => p.lokasi.split(',')[1]?.trim() || p.lokasi)));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Side Panel for Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transform ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static transition-transform duration-300 ease-in-out border-r border-slate-800`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-950 text-emerald-500 rounded-lg border border-slate-800">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-md font-bold tracking-tight text-white">
              LKPD Digital
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
            onClick={() => { setActiveTab('dashboard'); setSelectedPtn(null); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/10'
                : 'hover:bg-slate-800 hover:text-white text-slate-400'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Beranda
          </button>

          <button
            onClick={() => { setActiveTab('event'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'event'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/10'
                : 'hover:bg-slate-800 hover:text-white text-slate-400'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Event Diikuti
          </button>

          <button
            onClick={() => { setActiveTab('nilai-evaluasi'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'nilai-evaluasi'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/10'
                : 'hover:bg-slate-800 hover:text-white text-slate-400'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Nilai & Evaluasi
          </button>

          <button
            onClick={() => { setActiveTab('ptn'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ptn' || selectedPtn
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/10'
                : 'hover:bg-slate-800 hover:text-white text-slate-400'
            }`}
          >
            <Award className="h-4 w-4" />
            Direktori PTN
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
              <span className="block text-[9px] uppercase text-slate-500 tracking-wider">Siswa Terdaftar</span>
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
              Sistem Digital LKPD
            </span>
            <span className="text-sm font-bold tracking-tight text-slate-900 md:hidden">
              LKPD Digital
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="block text-xs font-semibold text-slate-900">{user?.nama}</span>
              <span className="block text-[10px] uppercase text-slate-400 tracking-wider">Siswa</span>
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

        {/* Main Viewport Container */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">

        {/* Tab: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Greeting Hero */}
            <div className="relative bg-slate-950 text-white rounded-2xl overflow-hidden shadow-md p-8 md:p-12">
              <div className="absolute inset-0 z-0 opacity-20">
                <img
                  src="/src/assets/images/hero_lkpd_digital_1790388179291.jpg"
                  alt="High school library space"
                  className="w-full h-full object-cover filter brightness-50"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="relative z-10 max-w-2xl">
                <span className="text-[10px] uppercase font-semibold tracking-widest text-emerald-400">Selamat datang kembali</span>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1 leading-tight text-wrap-balance">
                  Pantau Hasil LKPD & Bersiap Menuju PTN Pilihan
                </h1>
                <p className="text-slate-300 text-sm mt-4 max-w-xl leading-relaxed">
                  Semua portofolio kompetensi, event akademik, nilai ujian, serta catatan bimbingan karir dari guru wali terdokumentasi rapi di sini.
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Rata-rata Nilai</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                      {loadingStats ? '...' : stats.averageNilai}
                    </span>
                    <span className="text-slate-400 text-xs">/ 100</span>
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>

              <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Event & Lomba Diikuti</span>
                  <span className="block text-3xl font-extrabold text-slate-900 mt-2 font-mono tracking-tight tabular-nums">
                    {loadingStats ? '...' : stats.totalEventDiikuti}
                  </span>
                </div>
                <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                  <Award className="h-6 w-6" />
                </div>
              </div>

            </div>

            {/* In-App Notifications and Alerts (NT-01) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Evaluations */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                    Catatan Evaluasi Guru Terakhir
                  </span>
                  <button
                    onClick={() => setActiveTab('nilai-evaluasi')}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Lihat Semua
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {loadingStats ? (
                    <div className="p-8 text-center text-slate-400 text-sm">Memuat...</div>
                  ) : stats.recentEvaluations.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">Belum ada evaluasi dari guru pembimbing.</div>
                  ) : (
                    stats.recentEvaluations.map((ev: any) => (
                      <div key={ev.id} className="p-4 space-y-2 text-xs">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          <span>{ev.kategori.replace('_', ' ')} · Oleh {ev.guruNama}</span>
                          <span className="font-mono">{new Date(ev.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium">
                          {ev.komentar}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* In-app Alerts */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Bell className="h-4 w-4 text-slate-600" />
                    Pemberitahuan Sistem
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {loadingStats ? (
                    <div className="p-8 text-center text-slate-400 text-sm">Memuat...</div>
                  ) : stats.notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">Tidak ada pemberitahuan baru.</div>
                  ) : (
                    stats.notifications.map((notif: any) => (
                      <div key={notif.id} className={`p-4 text-xs flex items-start gap-3 justify-between ${notif.read ? 'bg-white opacity-60' : 'bg-emerald-50/40'}`}>
                        <div className="space-y-1">
                          <p className="text-slate-800 font-medium leading-normal">{notif.message}</p>
                          <span className="block text-[9px] text-slate-400 font-mono">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                        </div>
                        {!notif.read && (
                          <button
                            onClick={() => markNotifRead(notif.id)}
                            className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 whitespace-nowrap shrink-0"
                          >
                            Tandai Dibaca
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab: Event Diikuti */}
        {activeTab === 'event' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Histori Event & Kompetensi</h1>
              <p className="text-sm text-slate-500">Portofolio digital dari partisipasi dan prestasi kompetensi Anda.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingEvents ? (
                <div className="col-span-full text-center py-12 text-slate-400 text-sm">Memuat daftar event...</div>
              ) : events.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-400 text-sm">Anda belum mendaftarkan/mengikuti event kompetensi apapun.</div>
              ) : (
                events.map((e, idx) => (
                  <div key={idx} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between hover:border-emerald-600 transition-all duration-200">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-3">
                        <span>{e.penyelenggara}</span>
                        <span className="font-mono">{e.tanggal}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">{e.nama}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed mt-2 line-clamp-3">
                        {e.deskripsi}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="text-slate-500">
                        Peran: <strong className="text-slate-800 font-semibold">{e.peran}</strong>
                      </div>
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {e.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab: Nilai & Evaluasi */}
        {activeTab === 'nilai-evaluasi' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Akademik & Evaluasi</h1>
              <p className="text-sm text-slate-500">Rekap nilai ujian dan komentar komprehensif dari guru pembimbing.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Grades Table */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="px-6 py-4 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-slate-600" />
                      Daftar Nilai Akhir
                    </span>
                  </div>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                        <th className="px-6 py-3">Mata Pelajaran / Event</th>
                        <th className="px-6 py-3">Periode</th>
                        <th className="px-6 py-3 text-right">Nilai</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {loadingGrades ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-slate-400">Memuat nilai...</td>
                        </tr>
                      ) : grades.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-slate-400">Belum ada rekap data nilai.</td>
                        </tr>
                      ) : (
                        grades.map((n) => (
                          <tr key={n.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-3.5 font-semibold text-slate-950">{n.mapelOrEvent}</td>
                            <td className="px-6 py-3.5 text-slate-500">{n.periode}</td>
                            <td className="px-6 py-3.5 text-right font-mono font-bold text-slate-950 tabular-nums">
                              {n.nilai.toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Evaluations Cards */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-slate-600" />
                    Evaluasi & Catatan Wali
                  </span>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto max-h-[500px]">
                  {loadingGrades ? (
                    <div className="text-center py-8 text-slate-400 text-sm">Memuat evaluasi...</div>
                  ) : evaluations.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">Belum ada evaluasi guru.</div>
                  ) : (
                    evaluations.map((ev) => (
                      <div key={ev.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          <span>{ev.kategori.replace('_', ' ')}</span>
                          <span className="font-mono">{new Date(ev.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                          "{ev.komentar}"
                        </p>
                        <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100">
                          <span>Oleh: <strong className="text-slate-800 font-bold">{ev.guruNama}</strong></span>
                          {ev.eventName && (
                            <span className="font-medium text-slate-600">🔗 {ev.eventName}</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab: PTN Directory */}
        {activeTab === 'ptn' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Direktori Perguruan Tinggi Negeri</h1>
              <p className="text-sm text-slate-500">Cari informasi fakultas, program studi unggulan, dan passing grade PTN impian Anda.</p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white border border-slate-200 rounded-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari PTN berdasarkan nama atau jurusan..."
                  value={ptnSearch}
                  onChange={(e) => setPtnSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={ptnLocationFilter}
                  onChange={(e) => setPtnLocationFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                >
                  <option value="">Semua Wilayah</option>
                  {uniqueLocations.map((loc, i) => (
                    <option key={i} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* PTN list grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingPtn ? (
                <div className="col-span-full text-center py-12 text-slate-400 text-sm">Memuat direktori...</div>
              ) : filteredPtn.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-400 text-sm">Tidak ada Perguruan Tinggi Negeri yang sesuai kriteria.</div>
              ) : (
                filteredPtn.map((p) => (
                  <div key={p.id} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between hover:border-slate-400 transition-all duration-200">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {p.lokasi}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight mt-2 leading-tight">{p.nama}</h3>
                      
                      <div className="mt-4 space-y-2">
                        <span className="block text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Fakultas / Program</span>
                        <p className="text-xs text-slate-500 line-clamp-1">{p.fakultas}</p>
                      </div>

                      <div className="mt-3 space-y-2">
                        <span className="block text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Passing Grade</span>
                        <p className="text-xs text-slate-700 font-semibold">{p.passingGrade}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedPtn(p)}
                      className="w-full mt-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      Buka Profil Kampus
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </main>

      {/* PTN Expanded Profile Modal (Zero-Pill design) */}
      {selectedPtn && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {selectedPtn.lokasi}
              </span>
              <button onClick={() => setSelectedPtn(null)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{selectedPtn.nama}</h3>
                <a
                  href={selectedPtn.tautanResmi}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-1.5"
                >
                  Kunjungi Website Resmi
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="space-y-4 divide-y divide-slate-100">
                <div className="pt-0">
                  <span className="block text-[10px] uppercase text-slate-400 font-semibold tracking-wider mb-1">Fakultas Utama</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{selectedPtn.fakultas}</p>
                </div>

                <div className="pt-3">
                  <span className="block text-[10px] uppercase text-slate-400 font-semibold tracking-wider mb-2">Program Studi / Jurusan Unggulan</span>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
                    {selectedPtn.jurusan.map((j: string, i: number) => (
                      <React.Fragment key={i}>
                        <span className="font-medium hover:text-slate-900 transition-colors">{j}</span>
                        {i < selectedPtn.jurusan.length - 1 && <span className="text-slate-300">·</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="pt-3">
                  <span className="block text-[10px] uppercase text-slate-400 font-semibold tracking-wider mb-1">Jalur Masuk</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{selectedPtn.jalurMasuk}</p>
                </div>

                <div className="pt-3">
                  <span className="block text-[10px] uppercase text-slate-400 font-semibold tracking-wider mb-1">Prakiraan Passing Grade</span>
                  <p className="text-xs text-emerald-700 font-bold leading-relaxed">{selectedPtn.passingGrade}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedPtn(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Selesai Membaca
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
export default SiswaViews;
