import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowRight, Shield, User, Lock, Mail, Eye, EyeOff } from 'lucide-react';

export const AuthViews: React.FC = () => {
  const { login, register, error, clearError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nama, setNama] = useState('');
  const [role, setRole] = useState<'guru' | 'siswa'>('siswa');
  const [extraCode, setExtraCode] = useState(''); // NIP or NIS
  const [kelas, setKelas] = useState('XII-MIPA-1');
  const [kontak, setKontak] = useState('');

  // Master guru list for student register (to choose Wali)
  const [gurus, setGurus] = useState<any[]>([]);
  const [selectedGuruNip, setSelectedGuruNip] = useState('');

  useEffect(() => {
    if (!isLogin) {
      fetch('/api/v1/master/guru-list')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data.length > 0) {
            setGurus(data.data);
            setSelectedGuruNip(data.data[0].nip);
          }
        });
    }
    clearError();
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await login(email, password);
    } else {
      const regData = {
        email,
        password,
        nama,
        role,
        extraCode,
        customAttrs: {
          kelas: role === 'siswa' ? kelas : undefined,
          kontak,
          guruWaliNip: role === 'siswa' ? selectedGuruNip : undefined
        }
      };
      await register(regData);
    }
  };

  const handleDemoLogin = async (demoRole: 'admin' | 'guru' | 'siswa') => {
    let demoEmail = '';
    let demoPassword = 'siswaPassword123';

    if (demoRole === 'admin') {
      demoEmail = 'admin@lkpd.id';
      demoPassword = 'adminPassword123';
    } else if (demoRole === 'guru') {
      demoEmail = 'budi@lkpd.id';
      demoPassword = 'guruPassword123';
    } else {
      demoEmail = 'bungaadina7@gmail.com';
      demoPassword = 'siswaPassword123';
    }

    setEmail(demoEmail);
    setPassword(demoPassword);
    await login(demoEmail, demoPassword);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Left: Interactive Form Stage */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-8 md:p-16 lg:p-24 bg-white">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600 text-white rounded-lg">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Sistem Digital LKPD
          </span>
        </div>

        {/* Auth Box */}
        <div className="my-auto max-w-md w-full mx-auto py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isLogin ? 'Selamat Datang Kembali' : 'Pendaftaran Akun Baru'}
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              {isLogin
                ? 'Silakan masuk ke akun Anda untuk mengakses LKPD, riwayat nilai, dan bimbingan karir.'
                : 'Mulai perjalanan belajar digital Anda dan terhubung dengan guru pembimbing.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-600 rounded-r-md text-sm text-rose-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama lengkap Anda"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Saya adalah seorang
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setRole('siswa')}
                      className={`py-2 text-xs font-medium rounded-md transition-colors ${
                        role === 'siswa'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Siswa
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('guru')}
                      className={`py-2 text-xs font-medium rounded-md transition-colors ${
                        role === 'guru'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Guru
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder={isLogin ? '••••••••' : 'Min. 8 karakter (huruf, angka)'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      {role === 'siswa' ? 'Nomor Induk Siswa (NIS)' : 'Nomor Induk Pegawai (NIP)'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={role === 'siswa' ? 'Contoh: 202401002' : 'Contoh: 19850311...'}
                      value={extraCode}
                      onChange={(e) => setExtraCode(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Nomor Kontak (HP)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 08123456789"
                      value={kontak}
                      onChange={(e) => setKontak(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {role === 'siswa' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                        Kelas
                      </label>
                      <select
                        value={kelas}
                        onChange={(e) => setKelas(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      >
                        <option value="XII-MIPA-1">XII-MIPA-1</option>
                        <option value="XII-MIPA-2">XII-MIPA-2</option>
                        <option value="XII-IPS-1">XII-IPS-1</option>
                        <option value="XII-IPS-2">XII-IPS-2</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                        Guru Pembimbing / Wali
                      </label>
                      <select
                        value={selectedGuruNip}
                        onChange={(e) => setSelectedGuruNip(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      >
                        {gurus.map((g: any) => (
                          <option key={g.nip} value={g.nip}>
                            {g.nama}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors mt-6"
            >
              {isLogin ? 'Masuk ke Dashboard' : 'Daftar Sekarang'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              {isLogin ? 'Belum punya akun? Daftar disini' : 'Sudah punya akun? Masuk disini'}
            </button>
          </div>

          {/* Demo Login Quick Links */}
          {isLogin && (
            <div className="mt-8 pt-8 border-t border-slate-100">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 text-center mb-4">
                Masuk Cepat (Akun Demo)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleDemoLogin('siswa')}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors text-center"
                >
                  👨‍🎓 Siswa Bunga
                </button>
                <button
                  onClick={() => handleDemoLogin('guru')}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors text-center"
                >
                  👩‍🏫 Guru Budi
                </button>
                <button
                  onClick={() => handleDemoLogin('admin')}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors text-center"
                >
                  🛡️ Admin Utama
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 mt-auto">
          &copy; 2026 Sistem Digital LKPD · Dikembangkan untuk Sukses Akademik Siswa.
        </div>
      </div>

      {/* Right Side: Showcase Brand and Graphics */}
      <div className="hidden md:flex md:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center p-16">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="/src/assets/images/hero_lkpd_digital_1790388179291.jpg"
            alt="School library study space"
            className="w-full h-full object-cover filter brightness-50"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        </div>

        {/* Overlay context & quote */}
        <div className="relative z-10 max-w-lg text-white">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400 block mb-3">
            AKADEMIK & BIMBINGAN KARIR TERPADU
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight mb-6">
            Meningkatkan efisiensi evaluasi, membimbing masa depan karir.
          </h2>
          
          <div className="border-l-4 border-emerald-500 pl-6 space-y-2 mt-8">
            <p className="text-slate-300 italic text-sm">
              "LKPD digital ini memusatkan seluruh riwayat kompetensi dan bimbingan karir kami dalam satu profil yang utuh, sehingga kami bisa bersiap menuju PTN impian dengan target yang jelas."
            </p>
            <span className="block text-xs font-semibold text-emerald-400">
              — Bunga Adina, Siswa Kelas XII MIPA 1
            </span>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-16 pt-8 border-t border-white/10 text-center">
            <div>
              <span className="block text-2xl font-bold tracking-tight text-white font-mono">100%</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Digital & Aman</span>
            </div>
            <div>
              <span className="block text-2xl font-bold tracking-tight text-white font-mono">SNBP/SNBT</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Bimbingan PTN</span>
            </div>
            <div>
              <span className="block text-2xl font-bold tracking-tight text-white font-mono">Real-time</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Feedback Guru</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
