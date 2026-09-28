import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserCheck,
  Calendar,
  Upload,
  Download,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  LogOut,
  RefreshCw,
  Menu,
  X,
  LayoutDashboard
} from 'lucide-react';

export const AdminViews: React.FC = () => {
  const { token, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'guru' | 'siswa' | 'import-export'>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Stats
  const [stats, setStats] = useState<any>({ totalGuru: 0, totalSiswa: 0, totalEvent: 0, recentLogs: [] });
  const [loadingStats, setLoadingStats] = useState(true);

  // Lists
  const [gurus, setGurus] = useState<any[]>([]);
  const [siswas, setSiswas] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [loadingList, setLoadingList] = useState(false);

  // Modals / Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'guru' | 'siswa'>('guru');
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form inputs
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formNip, setFormNip] = useState('');
  const [formNis, setFormNis] = useState('');
  const [formMapel, setFormMapel] = useState('Matematika');
  const [formKelas, setFormKelas] = useState('XII-MIPA-1');
  const [formKontak, setFormKontak] = useState('');
  const [formGuruWaliNip, setFormGuruWaliNip] = useState('');
  const [formStatus, setFormStatus] = useState('aktif');
  const [formError, setFormError] = useState('');

  // Import State
  const [rawCsvText, setRawCsvText] = useState('');
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<any>(null);
  const [rollbackOnError, setRollbackOnError] = useState(true);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/v1/admin/dashboard', {
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

  const fetchGurus = async () => {
    setLoadingList(true);
    try {
      const res = await fetch('/api/v1/admin/guru', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setGurus(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchSiswas = async () => {
    setLoadingList(true);
    try {
      const res = await fetch('/api/v1/admin/siswa', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSiswas(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') fetchStats();
    if (activeTab === 'guru') fetchGurus();
    if (activeTab === 'siswa') {
      fetchSiswas();
      // Load gurus for wali selection
      fetch('/api/v1/master/guru-list')
        .then(res => res.json())
        .then(d => {
          if (d.success && d.data.length > 0) {
            setFormGuruWaliNip(d.data[0].nip);
          }
        })
        .catch(err => {
          console.warn('Gagal memuat daftar guru pembimbing:', err);
        });
    }
  }, [activeTab]);

  const openAddModal = (type: 'guru' | 'siswa') => {
    setModalType(type);
    setEditingItem(null);
    setFormEmail('');
    setFormPassword('');
    setFormNama('');
    setFormNip('');
    setFormNis('');
    setFormMapel('Matematika');
    setFormKelas('XII-MIPA-1');
    setFormKontak('');
    setFormStatus('aktif');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (type: 'guru' | 'siswa', item: any) => {
    setModalType(type);
    setEditingItem(item);
    setFormEmail(item.email || '');
    setFormPassword(''); // blank for no password change
    setFormNama(item.nama || '');
    setFormNip(item.nip || '');
    setFormNis(item.nis || '');
    setFormMapel(item.mataPelajaran || 'Matematika');
    setFormKelas(item.kelas || 'XII-MIPA-1');
    setFormKontak(item.kontak || '');
    setFormGuruWaliNip(item.guruWaliNip || '');
    setFormStatus(item.status || 'aktif');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const endpoint = modalType === 'guru'
      ? (editingItem ? `/api/v1/admin/guru/${editingItem.userId}` : '/api/v1/admin/guru')
      : (editingItem ? `/api/v1/admin/siswa/${editingItem.userId}` : '/api/v1/admin/siswa');

    const method = editingItem ? 'PUT' : 'POST';

    const payload: any = {
      email: formEmail,
      nama: formNama,
      status: formStatus,
    };

    if (!editingItem) {
      payload.password = formPassword;
    }

    if (modalType === 'guru') {
      payload.nip = formNip;
      payload.mataPelajaran = formMapel;
      payload.kelas = formKelas;
      payload.kontak = formKontak;
    } else {
      payload.nis = formNis;
      payload.kelas = formKelas;
      payload.kontak = formKontak;
      payload.guruWaliNip = formGuruWaliNip;
    }

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
        setIsModalOpen(false);
        if (modalType === 'guru') fetchGurus();
        if (modalType === 'siswa') fetchSiswas();
      } else {
        setFormError(data.error?.message || 'Gagal menyimpan data.');
      }
    } catch (err) {
      setFormError('Koneksi server gagal.');
    }
  };

  const handleDelete = async (type: 'guru' | 'siswa', id: string) => {
    if (!confirm('Apakah Anda yakin ingin menonaktifkan akun ini?')) return;
    const endpoint = type === 'guru' ? `/api/v1/admin/guru/${id}` : `/api/v1/admin/siswa/${id}`;
    try {
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if (type === 'guru') fetchGurus();
        if (type === 'siswa') fetchSiswas();
      } else {
        alert(data.error?.message || 'Gagal menonaktifkan akun.');
      }
    } catch (err) {
      alert('Koneksi server gagal.');
    }
  };

  // CSV Client-side parsing & preview
  const parseCsvText = () => {
    setImportErrors([]);
    setImportPreview([]);
    setImportResult(null);

    if (!rawCsvText.trim()) return;

    const lines = rawCsvText.split('\n');
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());

    const nisIdx = header.indexOf('nis');
    const mapelIdx = header.indexOf('mapel_or_event');
    const nilaiIdx = header.indexOf('nilai');
    const periodeIdx = header.indexOf('periode');

    if (nisIdx === -1 || mapelIdx === -1 || nilaiIdx === -1 || periodeIdx === -1) {
      setImportErrors([{ row: 0, reason: 'Format header salah. Wajib: nis, mapel_or_event, nilai, periode' }]);
      return;
    }

    const rows: any[] = [];
    const errors: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',').map(c => c.trim());
      const rowNum = i + 1;

      if (cols.length < 4) {
        errors.push({ row: rowNum, reason: 'Data kolom tidak lengkap' });
        continue;
      }

      const nis = cols[nisIdx];
      const mapelOrEvent = cols[mapelIdx];
      const nilaiStr = cols[nilaiIdx];
      const periode = cols[periodeIdx];

      const numericValue = parseFloat(nilaiStr);

      if (!nis || !mapelOrEvent || !nilaiStr || !periode) {
        errors.push({ row: rowNum, reason: 'Field tidak boleh kosong' });
        continue;
      }

      if (isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
        errors.push({ row: rowNum, reason: 'Nilai harus berupa angka di rentang 0-100 (RULE-03 violated)' });
        continue;
      }

      rows.push({ nis, mapelOrEvent, nilai: numericValue, periode });
    }

    setImportPreview(rows);
    setImportErrors(errors);
  };

  const handleCommitImport = async () => {
    if (importPreview.length === 0) return;

    try {
      const res = await fetch('/api/v1/admin/nilai/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rows: importPreview, rollbackOnError })
      });
      const data = await res.json();
      if (data.success) {
        setImportResult({
          success: true,
          message: `Berhasil mengimpor ${data.data.importedCount} data nilai.`,
          errors: data.data.errors || []
        });
        setRawCsvText('');
        setImportPreview([]);
      } else {
        setImportResult({
          success: false,
          message: data.error?.message || 'Proses import gagal.',
          errors: data.error?.details || []
        });
      }
    } catch (err) {
      setImportResult({
        success: false,
        message: 'Koneksi server gagal.',
        errors: []
      });
    }
  };

  const loadCsvSample = () => {
    const sample = `nis,mapel_or_event,nilai,periode
202401001,Matematika Kelas,92.50,2026-Ganjil
202401002,Olimpiade Sains Nasional (OSN) Matematika,97.00,2026-Ganjil
202401002,Matematika Kelas,98.50,2026-Ganjil
202401003,National Physics Competition (NPC),91.00,2026-Ganjil
202401003,Fisika Kelas,88.00,2026-Ganjil`;
    setRawCsvText(sample);
  };

  useEffect(() => {
    parseCsvText();
  }, [rawCsvText]);

  // Export utility
  const handleExportNilai = async () => {
    try {
      const res = await fetch('/api/v1/admin/nilai/export', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Convert JSON to CSV text
        const headers = ['ID', 'NIS', 'Nama Siswa', 'Kelas', 'Mata Pelajaran / Event', 'Nilai', 'Periode', 'Sumber'];
        const csvRows = [headers.join(',')];

        data.data.forEach((row: any) => {
          csvRows.push([
            row.id,
            row.nis,
            `"${row.namaSiswa}"`,
            row.kelas,
            `"${row.mapelOrEvent}"`,
            row.nilai,
            row.periode,
            row.sumber
          ].join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `rekap_nilai_lkpd_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      alert('Gagal mengekspor data.');
    }
  };

  // Client-side lists filtering
  const filteredGurus = gurus.filter(g =>
    g.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.nip?.includes(searchTerm) ||
    g.mataPelajaran?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSiswas = siswas.filter(s => {
    const matchesSearch = s.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || s.nis?.includes(searchTerm);
    const matchesClass = classFilter ? s.kelas === classFilter : true;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Side Panel for Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transform ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static transition-transform duration-300 ease-in-out border-r border-slate-800`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-md font-bold tracking-tight text-white">
              LKPD Admin
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
            onClick={() => { setActiveTab('dashboard'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/10'
                : 'hover:bg-slate-800 hover:text-white text-slate-400'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Ringkasan
          </button>

          <button
            onClick={() => { setActiveTab('guru'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'guru'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/10'
                : 'hover:bg-slate-800 hover:text-white text-slate-400'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            Manajemen Guru
          </button>

          <button
            onClick={() => { setActiveTab('siswa'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'siswa'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/10'
                : 'hover:bg-slate-800 hover:text-white text-slate-400'
            }`}
          >
            <Users className="h-4 w-4" />
            Manajemen Siswa
          </button>

          <button
            onClick={() => { setActiveTab('import-export'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'import-export'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/10'
                : 'hover:bg-slate-800 hover:text-white text-slate-400'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Import/Export Nilai
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
              <span className="block text-[9px] uppercase text-slate-500 tracking-wider">Super Admin</span>
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
        {/* Top Header Row for Desktop and Mobile (profile info & mobile sidebar toggle) */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-bold tracking-tight text-slate-900 hidden md:inline">
              LKPD Admin Console
            </span>
            <span className="text-sm font-bold tracking-tight text-slate-900 md:hidden">
              LKPD Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="block text-xs font-semibold text-slate-900">{user?.nama}</span>
              <span className="block text-[10px] uppercase text-slate-400 tracking-wider">Super Administrator</span>
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

        {/* Tab: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
                <p className="text-sm text-slate-500">Statistik real-time sistem LKPD digital sekolah.</p>
              </div>
              <button
                onClick={fetchStats}
                className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 hover:text-slate-900 flex items-center gap-2 text-xs font-semibold transition-colors shadow-sm"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
                Segarkan Data
              </button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Total Guru Pengampu</span>
                  <span className="block text-3xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums">
                    {loadingStats ? '...' : stats.totalGuru}
                  </span>
                </div>
                <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                  <UserCheck className="h-6 w-6" />
                </div>
              </div>

              <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Total Siswa Aktif</span>
                  <span className="block text-3xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums">
                    {loadingStats ? '...' : stats.totalSiswa}
                  </span>
                </div>
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Users className="h-6 w-6" />
                </div>
              </div>

              <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Total Event Rujukan</span>
                  <span className="block text-3xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums">
                    {loadingStats ? '...' : stats.totalEvent}
                  </span>
                </div>
                <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Audit log (RULE-09) */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">Audit Aktivitas Sistem (Log)</span>
                <span className="text-xs text-slate-400 font-medium">Histori Terakhir</span>
              </div>
              <div className="divide-y divide-slate-100 overflow-x-auto">
                {loadingStats ? (
                  <div className="p-8 text-center text-slate-400 text-sm">Memuat logs...</div>
                ) : stats.recentLogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">Tidak ada log aktivitas baru.</div>
                ) : (
                  stats.recentLogs.map((log: any) => (
                    <div key={log.id} className="p-4 flex items-start sm:items-center justify-between text-xs gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 rounded font-mono text-[10px] text-slate-600 font-semibold uppercase">
                          {log.role}
                        </span>
                        <span className="text-slate-800 font-semibold">{log.action}</span>
                        <span className="text-slate-400">on</span>
                        <span className="text-slate-600 font-mono text-[11px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                          {log.entity}/{log.entityId}
                        </span>
                      </div>
                      <span className="text-slate-400 whitespace-nowrap font-mono">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Guru List */}
        {activeTab === 'guru' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Data Guru</h1>
                <p className="text-sm text-slate-500">Daftar guru pengampu mata pelajaran dan bimbingan LKPD.</p>
              </div>
              <button
                onClick={() => openAddModal('guru')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Plus className="h-4 w-4" />
                Tambah Guru Baru
              </button>
            </div>

            {/* Filter and search */}
            <div className="flex gap-4 p-4 bg-white border border-slate-200 rounded-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari guru berdasarkan nama, NIP, atau mapel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="px-6 py-3.5">Nama Lengkap</th>
                    <th className="px-6 py-3.5">NIP</th>
                    <th className="px-6 py-3.5">Mata Pelajaran</th>
                    <th className="px-6 py-3.5">Kelas Walian</th>
                    <th className="px-6 py-3.5">Kontak</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {loadingList ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400">Memuat data guru...</td>
                    </tr>
                  ) : filteredGurus.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400">Tidak ada data guru ditemukan.</td>
                    </tr>
                  ) : (
                    filteredGurus.map((g: any) => (
                      <tr key={g.userId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">{g.nama}</td>
                        <td className="px-6 py-4 font-mono">{g.nip}</td>
                        <td className="px-6 py-4">{g.mataPelajaran}</td>
                        <td className="px-6 py-4 font-medium text-slate-600">{g.kelas}</td>
                        <td className="px-6 py-4 font-mono">{g.kontak || '-'}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            g.status === 'aktif' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {g.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal('guru', g)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-all"
                              title="Edit Guru"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete('guru', g.userId)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-all"
                              title="Nonaktifkan Guru"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Siswa List */}
        {activeTab === 'siswa' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Data Siswa</h1>
                <p className="text-sm text-slate-500">Daftar siswa terdaftar beserta asimilasi guru wali.</p>
              </div>
              <button
                onClick={() => openAddModal('siswa')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Plus className="h-4 w-4" />
                Tambah Siswa Baru
              </button>
            </div>

            {/* Filter and search */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white border border-slate-200 rounded-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari siswa berdasarkan nama atau NIS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                >
                  <option value="">Semua Kelas</option>
                  <option value="XII-MIPA-1">XII-MIPA-1</option>
                  <option value="XII-MIPA-2">XII-MIPA-2</option>
                  <option value="XII-IPS-1">XII-IPS-1</option>
                  <option value="XII-IPS-2">XII-IPS-2</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="px-6 py-3.5">Nama Lengkap</th>
                    <th className="px-6 py-3.5">NIS</th>
                    <th className="px-6 py-3.5">Kelas</th>
                    <th className="px-6 py-3.5">Guru Wali</th>
                    <th className="px-6 py-3.5">Kontak</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {loadingList ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400">Memuat data siswa...</td>
                    </tr>
                  ) : filteredSiswas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400">Tidak ada data siswa ditemukan.</td>
                    </tr>
                  ) : (
                    filteredSiswas.map((s: any) => (
                      <tr key={s.userId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">{s.nama}</td>
                        <td className="px-6 py-4 font-mono">{s.nis}</td>
                        <td className="px-6 py-4 font-semibold text-slate-600">{s.kelas}</td>
                        <td className="px-6 py-4">{s.guruWaliNama}</td>
                        <td className="px-6 py-4 font-mono">{s.kontak || '-'}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            s.status === 'aktif' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal('siswa', s)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-all"
                              title="Edit Siswa"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete('siswa', s.userId)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-all"
                              title="Nonaktifkan Siswa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Import / Export Nilai */}
        {activeTab === 'import-export' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Import & Export Nilai</h1>
              <p className="text-sm text-slate-500">Unggah nilai LKPD / Kompetensi dari CSV, atau unduh rekap nilai keseluruhan.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Import Card */}
              <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <Upload className="h-4 w-4 text-slate-600" />
                      Import Nilai CSV
                    </span>
                    <button
                      onClick={loadCsvSample}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-700 transition-colors"
                    >
                      💡 Isi Data Contoh
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Gunakan format baris CSV yang dipisahkan oleh koma. Kolom wajib: 
                    <strong className="text-slate-700 font-mono"> nis, mapel_or_event, nilai, periode</strong>.
                  </p>

                  <textarea
                    value={rawCsvText}
                    onChange={(e) => setRawCsvText(e.target.value)}
                    placeholder="Tempel data CSV Anda di sini..."
                    rows={10}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  />

                  {/* Settings */}
                  <div className="flex items-center gap-2 mt-4">
                    <input
                      type="checkbox"
                      id="rollback"
                      checked={rollbackOnError}
                      onChange={(e) => setRollbackOnError(e.target.checked)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-4 w-4"
                    />
                    <label htmlFor="rollback" className="text-xs font-medium text-slate-600 select-none">
                      Batalkan semua jika ada baris tidak valid (Transaksi)
                    </label>
                  </div>
                </div>

                {/* Import actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">
                    {importPreview.length} Baris Terbaca
                  </span>
                  <button
                    onClick={handleCommitImport}
                    disabled={importPreview.length === 0}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
                      importPreview.length > 0
                        ? 'bg-slate-900 hover:bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Commit Data Nilai
                  </button>
                </div>
              </div>

              {/* Live Preview & Result Console */}
              <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-sm font-semibold text-slate-900 block mb-4 flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-slate-600" />
                    Pratinjau Validasi & Hasil
                  </span>

                  {/* Status outcome */}
                  {importResult && (
                    <div className={`p-4 rounded-lg mb-4 text-xs ${
                      importResult.success ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                    }`}>
                      <span className="block font-bold text-sm mb-1">
                        {importResult.success ? 'Import Berhasil' : 'Import Gagal'}
                      </span>
                      <p>{importResult.message}</p>
                    </div>
                  )}

                  {/* Errors console */}
                  {importErrors.length > 0 && (
                    <div className="p-4 bg-rose-50 rounded-lg text-xs text-rose-800 border-l-4 border-rose-600 mb-4 max-h-40 overflow-y-auto">
                      <span className="block font-bold mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4" />
                        Daftar Error Baris:
                      </span>
                      <ul className="list-disc pl-4 space-y-1">
                        {importErrors.map((err, i) => (
                          <li key={i}>
                            Row {err.row}: {err.reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Raw Data Preview Table */}
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Pratinjau Tabel (Maks. 5 Baris)</span>
                  <div className="border border-slate-100 rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
                          <th className="px-3 py-2">NIS</th>
                          <th className="px-3 py-2">Mapel / Event</th>
                          <th className="px-3 py-2 text-right">Nilai</th>
                          <th className="px-3 py-2">Periode</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        {importPreview.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-3 py-4 text-center text-slate-400">Tempel CSV di kiri untuk pratinjau</td>
                          </tr>
                        ) : (
                          importPreview.slice(0, 5).map((row, i) => (
                            <tr key={i}>
                              <td className="px-3 py-2 font-mono">{row.nis}</td>
                              <td className="px-3 py-2">{row.mapelOrEvent}</td>
                              <td className="px-3 py-2 text-right font-mono tabular-nums">{row.nilai.toFixed(2)}</td>
                              <td className="px-3 py-2">{row.periode}</td>
                            </tr>
                          ))
                        )}
                        {importPreview.length > 5 && (
                          <tr>
                            <td colSpan={4} className="px-3 py-1.5 text-center bg-slate-50 text-slate-400 text-[10px]">
                              ... dan {importPreview.length - 5} baris lainnya
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Export Card */}
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Export Data Nilai</span>
                  <button
                    onClick={handleExportNilai}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Download className="h-4 w-4" />
                    Unduh Seluruh Rekap Nilai (.csv)
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Guru/Siswa Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">
                {editingItem ? 'Edit Data' : 'Tambah Baru'} {modalType === 'guru' ? 'Guru' : 'Siswa'}
              </span>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">&times;</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 text-xs text-rose-800 rounded border-l-4 border-rose-600">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Password {editingItem && <span className="text-slate-400 capitalize">(Opsional)</span>}
                  </label>
                  <input
                    type="password"
                    required={!editingItem}
                    placeholder={editingItem ? 'Kosongkan jika tidak diubah' : 'Min. 8 karakter'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    {modalType === 'guru' ? 'NIP' : 'NIS'}
                  </label>
                  <input
                    type="text"
                    required
                    value={modalType === 'guru' ? formNip : formNis}
                    onChange={(e) => modalType === 'guru' ? setFormNip(e.target.value) : setFormNis(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Nomor Kontak</label>
                  <input
                    type="text"
                    value={formKontak}
                    onChange={(e) => setFormKontak(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {modalType === 'guru' ? (
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Mata Pelajaran</label>
                    <select
                      value={formMapel}
                      onChange={(e) => setFormMapel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    >
                      <option value="Matematika">Matematika</option>
                      <option value="Fisika">Fisika</option>
                      <option value="Kimia">Kimia</option>
                      <option value="Biologi">Biologi</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Guru Wali / Pembimbing</label>
                    <select
                      value={formGuruWaliNip}
                      onChange={(e) => setFormGuruWaliNip(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    >
                      {gurus.map((g: any) => (
                        <option key={g.nip} value={g.nip}>
                          {g.nama} ({g.nip})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Kelas</label>
                  <select
                    value={formKelas}
                    onChange={(e) => setFormKelas(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  >
                    <option value="XII-MIPA-1">XII-MIPA-1</option>
                    <option value="XII-MIPA-2">XII-MIPA-2</option>
                    <option value="XII-IPS-1">XII-IPS-1</option>
                    <option value="XII-IPS-2">XII-IPS-2</option>
                  </select>
                </div>
              </div>

              {editingItem && (
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Status Akun</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-xs">
                      <input type="radio" value="aktif" checked={formStatus === 'aktif'} onChange={() => setFormStatus('aktif')} />
                      Aktif
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-rose-600">
                      <input type="radio" value="nonaktif" checked={formStatus === 'nonaktif'} onChange={() => setFormStatus('nonaktif')} />
                      Nonaktif
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Simpan Perubahan
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
