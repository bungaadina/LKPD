import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = Number(process.env.PORT) || 3000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Ensure DB directory exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// Password hashing helper using standard Node crypto
function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, 'lkpd_salt_key_2026', 1000, 64, 'sha512').toString('hex');
}

// Token helper (simple secure hash of user id + role + expiration)
function generateToken(userId: string, role: string): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const signature = crypto.createHmac('sha256', 'lkpd_jwt_secret_key_2026')
    .update(`${userId}:${role}:${expiresAt}`)
    .digest('hex');
  return Buffer.from(JSON.stringify({ userId, role, expiresAt, signature })).toString('base64');
}

function verifyToken(token: string): { userId: string, role: string } | null {
  try {
    const payloadStr = Buffer.from(token, 'base64').toString('utf8');
    const payload = JSON.parse(payloadStr);
    const { userId, role, expiresAt, signature } = payload;
    if (expiresAt < Date.now()) return null;
    const expectedSignature = crypto.createHmac('sha256', 'lkpd_jwt_secret_key_2026')
      .update(`${userId}:${role}:${expiresAt}`)
      .digest('hex');
    if (signature === expectedSignature) {
      return { userId, role };
    }
  } catch (e) {
    // Invalid token format
  }
  return null;
}

// Initial seed database
const DEFAULT_PTN = [
  {
    id: 'ptn-1',
    nama: 'Institut Teknologi Bandung (ITB)',
    lokasi: 'Bandung, Jawa Barat',
    fakultas: 'FMIPA, STEI, FTTM, FTSL, FTMD, SBM',
    jurusan: ['Teknik Informatika', 'Sistem dan Teknologi Informasi', 'Fisika', 'Matematika', 'Teknik Perminyakan'],
    jalurMasuk: 'SNBP, SNBT, Seleksi Mandiri',
    passingGrade: 'Tinggi (FMIPA: 85%, STEI: 92%)',
    tautanResmi: 'https://itb.ac.id'
  },
  {
    id: 'ptn-2',
    nama: 'Universitas Indonesia (UI)',
    lokasi: 'Depok, Jawa Barat',
    fakultas: 'FT, FMIPA, FK, Fasilkom, FEB, FISIP',
    jurusan: ['Ilmu Komputer', 'Sistem Informasi', 'Teknik Elektro', 'Pendidikan Dokter', 'Sastra Jepang'],
    jalurMasuk: 'SNBP, SNBT, SIMAK UI',
    passingGrade: 'Tinggi (Fasilkom: 90%, FK: 95%)',
    tautanResmi: 'https://ui.ac.id'
  },
  {
    id: 'ptn-3',
    nama: 'Universitas Gadjah Mada (UGM)',
    lokasi: 'Yogyakarta, DIY',
    fakultas: 'FT, FMIPA, FK-KMK, FEB, FTI',
    jurusan: ['Teknik Nuklir', 'Teknik Elektro', 'Teknologi Informasi', 'Kedokteran', 'Ilmu Ekonomi'],
    jalurMasuk: 'SNBP, SNBT, UM UGM',
    passingGrade: 'Tinggi (Kedokteran: 94%, TI: 88%)',
    tautanResmi: 'https://ugm.ac.id'
  },
  {
    id: 'ptn-4',
    nama: 'Universitas Airlangga (UNAIR)',
    lokasi: 'Surabaya, Jawa Timur',
    fakultas: 'FK, FKG, FF, FEB, FST',
    jurusan: ['Pendidikan Dokter', 'Farmasi', 'Sistem Informasi', 'Teknologi Sains Data'],
    jalurMasuk: 'SNBP, SNBT, Mandiri UNAIR',
    passingGrade: 'Sedang-Tinggi (FK: 91%, Farmasi: 86%)',
    tautanResmi: 'https://unair.ac.id'
  },
  {
    id: 'ptn-5',
    nama: 'Universitas Diponegoro (UNDIP)',
    lokasi: 'Semarang, Jawa Tengah',
    fakultas: 'FT, FSM, FEB, FK, FH',
    jurusan: ['Teknik Sipil', 'Informatika', 'Manajemen', 'Pendidikan Dokter'],
    jalurMasuk: 'SNBP, SNBT, UM UNDIP',
    passingGrade: 'Sedang (Teknik Sipil: 82%, Informatika: 80%)',
    tautanResmi: 'https://undip.ac.id'
  }
];

const DEFAULT_EVENTS = [
  {
    id: 'event-1',
    nama: 'Olimpiade Sains Nasional (OSN) Matematika',
    tanggal: '2026-08-15',
    deskripsi: 'Kompetisi sains tingkat nasional untuk menjaring siswa berbakat bidang matematika.',
    lokasi: 'Bandung, Jawa Barat',
    penyelenggara: 'Puspresnas'
  },
  {
    id: 'event-2',
    nama: 'National Physics Competition (NPC)',
    tanggal: '2026-09-10',
    deskripsi: 'Lomba fisika tingkat nasional diselenggarakan oleh Universitas Indonesia.',
    lokasi: 'Depok, Jawa Barat',
    penyelenggara: 'HMD Fisika UI'
  },
  {
    id: 'event-3',
    nama: 'Pameran Karya Ilmiah Remaja (KIR)',
    tanggal: '2026-09-22',
    deskripsi: 'Pameran dan evaluasi produk inovasi karya ilmiah siswa SMA tingkat provinsi.',
    lokasi: 'Semarang, Jawa Tengah',
    penyelenggara: 'Dinas Pendidikan'
  }
];

function initializeDatabase() {
  const passwordHashAdmin = hashPassword('adminPassword123');
  const passwordHashGuru = hashPassword('guruPassword123');
  const passwordHashSiswa = hashPassword('siswaPassword123');

  const defaultDb = {
    users: [
      {
        id: 'u-admin',
        email: 'admin@lkpd.id',
        passwordHash: passwordHashAdmin,
        role: 'admin',
        nama: 'Admin Utama',
        status: 'aktif',
        createdAt: new Date().toISOString()
      },
      {
        id: 'u-guru1',
        email: 'budi@lkpd.id',
        passwordHash: passwordHashGuru,
        role: 'guru',
        nama: 'Budi Hartono, S.Pd.',
        status: 'aktif',
        createdAt: new Date().toISOString()
      },
      {
        id: 'u-guru2',
        email: 'siti@lkpd.id',
        passwordHash: passwordHashGuru,
        role: 'guru',
        nama: 'Siti Rahma, M.Pd.',
        status: 'aktif',
        createdAt: new Date().toISOString()
      },
      {
        id: 'u-siswa1',
        email: 'adi@lkpd.id',
        passwordHash: passwordHashSiswa,
        role: 'siswa',
        nama: 'Adi Wijaya',
        status: 'aktif',
        createdAt: new Date().toISOString()
      },
      {
        id: 'u-siswa2',
        email: 'bungaadina7@gmail.com', // Hospitality: user's registered email
        passwordHash: passwordHashSiswa,
        role: 'siswa',
        nama: 'Bunga Adina',
        status: 'aktif',
        createdAt: new Date().toISOString()
      },
      {
        id: 'u-siswa3',
        email: 'citra@lkpd.id',
        passwordHash: passwordHashSiswa,
        role: 'siswa',
        nama: 'Citra Lestari',
        status: 'aktif',
        createdAt: new Date().toISOString()
      }
    ],
    guru: [
      {
        userId: 'u-guru1',
        nip: '198503112010121002',
        mataPelajaran: 'Matematika',
        kelas: 'XII-MIPA-1',
        kontak: '081234567890'
      },
      {
        userId: 'u-guru2',
        nip: '198807242015042003',
        mataPelajaran: 'Fisika',
        kelas: 'XII-MIPA-2',
        kontak: '081298765432'
      }
    ],
    siswa: [
      {
        userId: 'u-siswa1',
        nis: '202401001',
        kelas: 'XII-MIPA-1',
        kontak: '085711112222',
        guruWaliNip: '198503112010121002'
      },
      {
        userId: 'u-siswa2',
        nis: '202401002',
        kelas: 'XII-MIPA-1',
        kontak: '085733334444',
        guruWaliNip: '198503112010121002'
      },
      {
        userId: 'u-siswa3',
        nis: '202401003',
        kelas: 'XII-MIPA-2',
        kontak: '085755556666',
        guruWaliNip: '198807242015042003'
      }
    ],
    events: DEFAULT_EVENTS,
    siswaEvents: [
      { siswaId: 'u-siswa1', eventId: 'event-1', status: 'Selesai', peran: 'Peserta' },
      { siswaId: 'u-siswa2', eventId: 'event-1', status: 'Selesai', peran: 'Finalis' },
      { siswaId: 'u-siswa2', eventId: 'event-3', status: 'Selesai', peran: 'Presenter Utama' },
      { siswaId: 'u-siswa3', eventId: 'event-2', status: 'Selesai', peran: 'Juara 3' }
    ],
    nilai: [
      { id: 'n-1', siswaId: 'u-siswa1', mapelOrEvent: 'Olimpiade Sains Nasional (OSN) Matematika', nilai: 85.50, periode: '2026-Ganjil', sumber: 'manual' },
      { id: 'n-2', siswaId: 'u-siswa1', mapelOrEvent: 'Matematika Kelas', nilai: 90.00, periode: '2026-Ganjil', sumber: 'manual' },
      { id: 'n-3', siswaId: 'u-siswa2', mapelOrEvent: 'Olimpiade Sains Nasional (OSN) Matematika', nilai: 94.00, periode: '2026-Ganjil', sumber: 'manual' },
      { id: 'n-4', siswaId: 'u-siswa2', mapelOrEvent: 'Matematika Kelas', nilai: 96.00, periode: '2026-Ganjil', sumber: 'manual' },
      { id: 'n-5', siswaId: 'u-siswa2', mapelOrEvent: 'Pameran Karya Ilmiah Remaja (KIR)', nilai: 92.50, periode: '2026-Ganjil', sumber: 'manual' },
      { id: 'n-6', siswaId: 'u-siswa3', mapelOrEvent: 'National Physics Competition (NPC)', nilai: 88.00, periode: '2026-Ganjil', sumber: 'manual' },
      { id: 'n-7', siswaId: 'u-siswa3', mapelOrEvent: 'Fisika Kelas', nilai: 89.50, periode: '2026-Ganjil', sumber: 'manual' }
    ],
    evaluasi: [
      {
        id: 'ev-1',
        guruId: 'u-guru1',
        siswaId: 'u-siswa1',
        kategori: 'akademik',
        komentar: 'Adi menunjukkan kemampuan analitis yang sangat baik dalam menyelesaikan soal-soal geometri pada OSN Matematika.',
        eventId: 'event-1',
        createdAt: new Date().toISOString()
      },
      {
        id: 'ev-2',
        guruId: 'u-guru1',
        siswaId: 'u-siswa2',
        kategori: 'pengembangan_diri',
        komentar: 'Bunga memiliki dedikasi luar biasa dalam riset ilmiah dan pengerjaan LKPD. Pertahankan prestasi dan fokus bimbingan menuju SNBP ITB!',
        eventId: 'event-3',
        createdAt: new Date().toISOString()
      },
      {
        id: 'ev-3',
        guruId: 'u-guru2',
        siswaId: 'u-siswa3',
        kategori: 'akademik',
        komentar: 'Sangat aktif dalam praktikum Fisika Mekanika. Catatan evaluasi LKPD menunjukkan pemahaman konsep yang kokoh.',
        eventId: 'event-2',
        createdAt: new Date().toISOString()
      }
    ],
    ptn: DEFAULT_PTN,
    auditLogs: [],
    notifications: []
  };

  fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2));
}

if (!fs.existsSync(DB_PATH)) {
  initializeDatabase();
}

function readDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (e) {
    initializeDatabase();
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  }
}

function writeDb(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Log actions helper (RULE-09)
function logActivity(userId: string, role: string, action: string, entity: string, entityId: string, diff: any = {}) {
  const db = readDb();
  db.auditLogs.unshift({
    id: `log-${crypto.randomUUID()}`,
    userId,
    role,
    action,
    entity,
    entityId,
    diff,
    createdAt: new Date().toISOString()
  });
  // Keep logs at a reasonable limit
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  writeDb(db);
}

// Middleware: Authentication
function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'ERR-401', message: 'Sesi Anda berakhir. Silakan login kembali.' }
    });
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: { code: 'ERR-401', message: 'Sesi Anda berakhir. Silakan login kembali.' }
    });
  }
  req.userId = decoded.userId;
  req.role = decoded.role;
  next();
}

// Route: Auth
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'ERR-AUTH-01', message: 'Email dan password wajib diisi.' }
    });
  }

  const db = readDb();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.status !== 'aktif') {
    return res.status(401).json({
      success: false,
      error: { code: 'ERR-AUTH-01', message: 'Email atau password salah.' }
    });
  }

  const hash = hashPassword(password);
  if (user.passwordHash !== hash) {
    return res.status(401).json({
      success: false,
      error: { code: 'ERR-AUTH-01', message: 'Email atau password salah.' }
    });
  }

  const token = generateToken(user.id, user.role);
  logActivity(user.id, user.role, 'login', 'users', user.id);

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nama: user.nama
      }
    }
  });
});

app.post('/api/v1/auth/register', (req, res) => {
  const { email, password, nama, role, extraCode, customAttrs } = req.body;
  if (!email || !password || !nama || !role) {
    return res.status(400).json({
      success: false,
      error: { code: 'ERR-VAL-01', message: 'Seluruh field wajib diisi.' }
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      error: { code: 'ERR-VAL-02', message: 'Password minimal harus 8 karakter.' }
    });
  }

  const db = readDb();
  if (db.users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: { code: 'ERR-VAL-01', message: 'Email sudah terdaftar.' }
    });
  }

  const userId = `u-${crypto.randomUUID().slice(0, 8)}`;
  const newUser = {
    id: userId,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    role,
    nama,
    status: 'aktif',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);

  if (role === 'guru') {
    const nip = extraCode || `NIP-${Math.floor(100000 + Math.random() * 900000)}`;
    db.guru.push({
      userId,
      nip,
      mataPelajaran: customAttrs?.mataPelajaran || 'Umum',
      kelas: customAttrs?.kelas || 'XII',
      kontak: customAttrs?.kontak || ''
    });
    logActivity(userId, 'guru', 'register', 'guru', userId, { nip });
  } else if (role === 'siswa') {
    const nis = extraCode || `NIS-${Math.floor(100000 + Math.random() * 900000)}`;
    // Auto associate with a teacher for testing if possible
    const firstGuru = db.guru[0];
    db.siswa.push({
      userId,
      nis,
      kelas: customAttrs?.kelas || 'XII-MIPA-1',
      kontak: customAttrs?.kontak || '',
      guruWaliNip: customAttrs?.guruWaliNip || (firstGuru ? firstGuru.nip : '')
    });
    logActivity(userId, 'siswa', 'register', 'siswa', userId, { nis });
  }

  writeDb(db);

  const token = generateToken(userId, role);
  res.json({
    success: true,
    data: {
      token,
      user: {
        id: userId,
        email,
        role,
        nama
      }
    }
  });
});

app.get('/api/v1/auth/me', authMiddleware, (req: any, res) => {
  const db = readDb();
  const user = db.users.find((u: any) => u.id === req.userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: 'ERR-404', message: 'User tidak ditemukan.' }
    });
  }

  let extraProfile = {};
  if (user.role === 'guru') {
    extraProfile = db.guru.find((g: any) => g.userId === user.id) || {};
  } else if (user.role === 'siswa') {
    extraProfile = db.siswa.find((s: any) => s.userId === user.id) || {};
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      role: user.role,
      nama: user.nama,
      profile: extraProfile
    }
  });
});

// Admin Route: Dashboard Metrics
app.get('/api/v1/admin/dashboard', authMiddleware, (req: any, res) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Akses ditolak.' } });
  }

  const db = readDb();
  const totalGuru = db.guru.length;
  const totalSiswa = db.siswa.length;
  const totalEvent = db.events.length;
  const recentLogs = db.auditLogs.slice(0, 10);

  res.json({
    success: true,
    data: {
      totalGuru,
      totalSiswa,
      totalEvent,
      recentLogs
    }
  });
});

// Admin Route: CRUD Guru
app.get('/api/v1/admin/guru', authMiddleware, (req: any, res) => {
  if (req.role !== 'admin') return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Akses ditolak.' } });
  const db = readDb();
  const result = db.guru.map((g: any) => {
    const user = db.users.find((u: any) => u.id === g.userId);
    return {
      ...g,
      email: user?.email,
      nama: user?.nama,
      status: user?.status,
    };
  });
  res.json({ success: true, data: result });
});

app.post('/api/v1/admin/guru', authMiddleware, (req: any, res) => {
  if (req.role !== 'admin') return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Akses ditolak.' } });
  const { email, password, nama, nip, mataPelajaran, kelas, kontak } = req.body;
  if (!email || !password || !nama || !nip) {
    return res.status(400).json({ success: false, error: { code: 'ERR-VAL-01', message: 'Nama, Email, Password, dan NIP wajib diisi.' } });
  }

  const db = readDb();
  if (db.users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ success: false, error: { code: 'ERR-VAL-01', message: 'Email sudah terdaftar.' } });
  }
  if (db.guru.some((g: any) => g.nip === nip)) {
    return res.status(400).json({ success: false, error: { code: 'ERR-VAL-01', message: 'NIP sudah terdaftar.' } });
  }

  const userId = `u-${crypto.randomUUID().slice(0, 8)}`;
  db.users.push({
    id: userId,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    role: 'guru',
    nama,
    status: 'aktif',
    createdAt: new Date().toISOString()
  });

  db.guru.push({
    userId,
    nip,
    mataPelajaran,
    kelas,
    kontak
  });

  logActivity(req.userId, 'admin', 'create_guru', 'guru', userId, { nip, nama });
  writeDb(db);

  res.json({ success: true, message: 'Guru berhasil ditambahkan.' });
});

app.put('/api/v1/admin/guru/:userId', authMiddleware, (req: any, res) => {
  if (req.role !== 'admin') return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Akses ditolak.' } });
  const { userId } = req.params;
  const { nama, email, nip, mataPelajaran, kelas, kontak, status } = req.body;

  const db = readDb();
  const userIndex = db.users.findIndex((u: any) => u.id === userId);
  const guruIndex = db.guru.findIndex((g: any) => g.userId === userId);

  if (userIndex === -1 || guruIndex === -1) {
    return res.status(404).json({ success: false, error: { code: 'ERR-404', message: 'Data guru tidak ditemukan.' } });
  }

  db.users[userIndex].nama = nama || db.users[userIndex].nama;
  db.users[userIndex].email = email ? email.toLowerCase() : db.users[userIndex].email;
  db.users[userIndex].status = status || db.users[userIndex].status;

  db.guru[guruIndex].nip = nip || db.guru[guruIndex].nip;
  db.guru[guruIndex].mataPelajaran = mataPelajaran || db.guru[guruIndex].mataPelajaran;
  db.guru[guruIndex].kelas = kelas || db.guru[guruIndex].kelas;
  db.guru[guruIndex].kontak = kontak || db.guru[guruIndex].kontak;

  logActivity(req.userId, 'admin', 'update_guru', 'guru', userId, { nama, nip });
  writeDb(db);

  res.json({ success: true, message: 'Data Guru berhasil diubah.' });
});

app.delete('/api/v1/admin/guru/:userId', authMiddleware, (req: any, res) => {
  if (req.role !== 'admin') return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Akses ditolak.' } });
  const { userId } = req.params;

  const db = readDb();
  const userIndex = db.users.findIndex((u: any) => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, error: { code: 'ERR-404', message: 'Guru tidak ditemukan.' } });
  }

  // Soft delete as per RULE-07
  db.users[userIndex].status = 'nonaktif';
  logActivity(req.userId, 'admin', 'soft_delete_guru', 'guru', userId);
  writeDb(db);

  res.json({ success: true, message: 'Guru berhasil dinonaktifkan.' });
});

// Admin Route: CRUD Siswa
app.get('/api/v1/admin/siswa', authMiddleware, (req: any, res) => {
  if (req.role !== 'admin') return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Akses ditolak.' } });
  const db = readDb();
  const result = db.siswa.map((s: any) => {
    const user = db.users.find((u: any) => u.id === s.userId);
    const guruWali = db.guru.find((g: any) => g.nip === s.guruWaliNip);
    const guruUser = guruWali ? db.users.find((u: any) => u.id === guruWali.userId) : null;
    return {
      ...s,
      email: user?.email,
      nama: user?.nama,
      status: user?.status,
      guruWaliNama: guruUser?.nama || 'Belum Ditentukan'
    };
  });
  res.json({ success: true, data: result });
});

app.post('/api/v1/admin/siswa', authMiddleware, (req: any, res) => {
  if (req.role !== 'admin') return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Akses ditolak.' } });
  const { email, password, nama, nis, kelas, kontak, guruWaliNip } = req.body;
  if (!email || !password || !nama || !nis) {
    return res.status(400).json({ success: false, error: { code: 'ERR-VAL-01', message: 'Nama, Email, Password, dan NIS wajib diisi.' } });
  }

  const db = readDb();
  if (db.users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ success: false, error: { code: 'ERR-VAL-01', message: 'Email sudah terdaftar.' } });
  }
  if (db.siswa.some((s: any) => s.nis === nis)) {
    return res.status(400).json({ success: false, error: { code: 'ERR-VAL-01', message: 'NIS sudah terdaftar.' } });
  }

  const userId = `u-${crypto.randomUUID().slice(0, 8)}`;
  db.users.push({
    id: userId,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    role: 'siswa',
    nama,
    status: 'aktif',
    createdAt: new Date().toISOString()
  });

  db.siswa.push({
    userId,
    nis,
    kelas,
    kontak,
    guruWaliNip: guruWaliNip || ''
  });

  logActivity(req.userId, 'admin', 'create_siswa', 'siswa', userId, { nis, nama });
  writeDb(db);

  res.json({ success: true, message: 'Siswa berhasil ditambahkan.' });
});

app.put('/api/v1/admin/siswa/:userId', authMiddleware, (req: any, res) => {
  if (req.role !== 'admin') return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Akses ditolak.' } });
  const { userId } = req.params;
  const { nama, email, nis, kelas, kontak, guruWaliNip, status } = req.body;

  const db = readDb();
  const userIndex = db.users.findIndex((u: any) => u.id === userId);
  const siswaIndex = db.siswa.findIndex((s: any) => s.userId === userId);

  if (userIndex === -1 || siswaIndex === -1) {
    return res.status(404).json({ success: false, error: { code: 'ERR-404', message: 'Siswa tidak ditemukan.' } });
  }

  db.users[userIndex].nama = nama || db.users[userIndex].nama;
  db.users[userIndex].email = email ? email.toLowerCase() : db.users[userIndex].email;
  db.users[userIndex].status = status || db.users[userIndex].status;

  db.siswa[siswaIndex].nis = nis || db.siswa[siswaIndex].nis;
  db.siswa[siswaIndex].kelas = kelas || db.siswa[siswaIndex].kelas;
  db.siswa[siswaIndex].kontak = kontak || db.siswa[siswaIndex].kontak;
  db.siswa[siswaIndex].guruWaliNip = guruWaliNip !== undefined ? guruWaliNip : db.siswa[siswaIndex].guruWaliNip;

  logActivity(req.userId, 'admin', 'update_siswa', 'siswa', userId, { nama, nis });
  writeDb(db);

  res.json({ success: true, message: 'Data Siswa berhasil diubah.' });
});

app.delete('/api/v1/admin/siswa/:userId', authMiddleware, (req: any, res) => {
  if (req.role !== 'admin') return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Akses ditolak.' } });
  const { userId } = req.params;

  const db = readDb();
  const userIndex = db.users.findIndex((u: any) => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, error: { code: 'ERR-404', message: 'Siswa tidak ditemukan.' } });
  }

  // Soft delete as per RULE-07
  db.users[userIndex].status = 'nonaktif';
  logActivity(req.userId, 'admin', 'soft_delete_siswa', 'siswa', userId);
  writeDb(db);

  res.json({ success: true, message: 'Siswa berhasil dinonaktifkan.' });
});

// Admin Route: Import / Export Nilai
app.post('/api/v1/admin/nilai/import', authMiddleware, (req: any, res) => {
  if (req.role !== 'admin') return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Akses ditolak.' } });
  const { rows } = req.body; // Array of { nis, mapelOrEvent, nilai, periode }
  if (!rows || !Array.isArray(rows)) {
    return res.status(400).json({ success: false, error: { code: 'ERR-IMP-01', message: 'Data import invalid.' } });
  }

  const db = readDb();
  const errors: any[] = [];
  const successRows: any[] = [];

  rows.forEach((row, idx) => {
    const lineNum = idx + 1;
    const { nis, mapelOrEvent, nilai, periode } = row;

    if (!nis || !mapelOrEvent || nilai === undefined || !periode) {
      errors.push({ row: lineNum, reason: 'Kolom tidak lengkap (nis, mapelOrEvent, nilai, periode wajib)' });
      return;
    }

    const numericValue = parseFloat(nilai);
    if (isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
      errors.push({ row: lineNum, reason: 'Nilai harus berupa angka di rentang 0-100 (RULE-03 violated)' });
      return;
    }

    const studentProfile = db.siswa.find((s: any) => s.nis === String(nis));
    if (!studentProfile) {
      errors.push({ row: lineNum, reason: `Siswa dengan NIS ${nis} tidak ditemukan` });
      return;
    }

    successRows.push({
      id: `n-${crypto.randomUUID().slice(0, 8)}`,
      siswaId: studentProfile.userId,
      mapelOrEvent,
      nilai: numericValue,
      periode,
      sumber: 'import'
    });
  });

  // Safe import logic - commit if there are no errors, or if user requests skip-invalid (let's do transactional as per TRD §5.2)
  if (errors.length > 0 && req.body.rollbackOnError) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'ERR-IMP-03',
        message: 'Terdapat baris data tidak valid. Proses import dibatalkan.',
        details: errors
      }
    });
  }

  // Insert successful records
  if (successRows.length > 0) {
    db.nilai.push(...successRows);
    logActivity(req.userId, 'admin', 'import_nilai', 'nilai', `batch-${Date.now()}`, { count: successRows.length });
    writeDb(db);
  }

  res.json({
    success: true,
    data: {
      importedCount: successRows.length,
      failedCount: errors.length,
      errors
    }
  });
});

app.get('/api/v1/admin/nilai/export', authMiddleware, (req: any, res) => {
  if (req.role !== 'admin') return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Akses ditolak.' } });
  const db = readDb();

  const exportData = db.nilai.map((n: any) => {
    const student = db.siswa.find((s: any) => s.userId === n.siswaId);
    const studentUser = student ? db.users.find((u: any) => u.id === student.userId) : null;
    return {
      id: n.id,
      nis: student?.nis,
      namaSiswa: studentUser?.nama,
      kelas: student?.kelas,
      mapelOrEvent: n.mapelOrEvent,
      nilai: n.nilai,
      periode: n.periode,
      sumber: n.sumber
    };
  });

  res.json({ success: true, data: exportData });
});

// Guru Route: Dashboard
app.get('/api/v1/guru/dashboard', authMiddleware, (req: any, res) => {
  if (req.role !== 'guru') return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Akses ditolak.' } });
  const db = readDb();

  const guruProfile = db.guru.find((g: any) => g.userId === req.userId);
  if (!guruProfile) {
    return res.status(404).json({ success: false, error: { code: 'ERR-404', message: 'Profil Guru tidak ditemukan.' } });
  }

  const binaan = db.siswa.filter((s: any) => s.guruWaliNip === guruProfile.nip);
  const totalSiswaBinaan = binaan.length;

  const evaluasiSiswaIds = binaan.map((s: any) => s.userId);
  const totalEvaluasiDiberikan = db.evaluasi.filter((ev: any) => ev.guruId === req.userId).length;

  // Recent evaluations by this Guru
  const recentEvaluations = db.evaluasi
    .filter((ev: any) => ev.guruId === req.userId)
    .slice(0, 5)
    .map((ev: any) => {
      const studentUser = db.users.find((u: any) => u.id === ev.siswaId);
      const eventDetails = db.events.find((e: any) => e.id === ev.eventId);
      return {
        ...ev,
        siswaNama: studentUser?.nama || 'Siswa',
        eventName: eventDetails?.nama || ev.eventId || 'Umum'
      };
    });

  res.json({
    success: true,
    data: {
      totalSiswaBinaan,
      totalEvaluasiDiberikan,
      recentEvaluations
    }
  });
});

// Guru Route: Get Assigned Students (Binaan)
app.get('/api/v1/guru/siswa', authMiddleware, (req: any, res) => {
  if (req.role !== 'guru') return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Akses ditolak.' } });
  const db = readDb();

  const guruProfile = db.guru.find((g: any) => g.userId === req.userId);
  if (!guruProfile) {
    return res.status(404).json({ success: false, error: { code: 'ERR-404', message: 'Profil Guru tidak ditemukan.' } });
  }

  const binaan = db.siswa
    .filter((s: any) => s.guruWaliNip === guruProfile.nip)
    .map((s: any) => {
      const user = db.users.find((u: any) => u.id === s.userId);
      return {
        ...s,
        nama: user?.nama,
        email: user?.email,
        status: user?.status
      };
    });

  res.json({ success: true, data: binaan });
});

// Guru Route: Detail Siswa + Riwayat Nilai & Evaluasi
app.get('/api/v1/guru/siswa/:id', authMiddleware, (req: any, res) => {
  if (req.role !== 'guru') return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Akses ditolak.' } });
  const { id } = req.params;

  const db = readDb();
  const student = db.siswa.find((s: any) => s.userId === id);
  const studentUser = db.users.find((u: any) => u.id === id);

  if (!student || !studentUser) {
    return res.status(404).json({ success: false, error: { code: 'ERR-404', message: 'Siswa tidak ditemukan.' } });
  }

  // Ownership Guard (RULE-04): ensure this Guru is indeed the wali of this student
  const guruProfile = db.guru.find((g: any) => g.userId === req.userId);
  if (!guruProfile || student.guruWaliNip !== guruProfile.nip) {
    return res.status(403).json({
      success: false,
      error: { code: 'ERR-403', message: 'Anda tidak memiliki hak akses/binaan atas siswa ini.' }
    });
  }

  const nilai = db.nilai.filter((n: any) => n.siswaId === id);
  const evaluasi = db.evaluasi
    .filter((ev: any) => ev.siswaId === id)
    .map((ev: any) => {
      const gProfile = db.guru.find((g: any) => g.userId === ev.guruId);
      const gUser = db.users.find((u: any) => u.id === ev.guruId);
      const eventDetails = db.events.find((e: any) => e.id === ev.eventId);
      return {
        ...ev,
        guruNama: gUser?.nama || 'Guru',
        guruMataPelajaran: gProfile?.mataPelajaran || '',
        eventName: eventDetails?.nama || ev.eventId || 'Umum'
      };
    });

  const eventsParticipated = db.siswaEvents
    .filter((se: any) => se.siswaId === id)
    .map((se: any) => {
      const evDetails = db.events.find((e: any) => e.id === se.eventId);
      return {
        ...se,
        nama: evDetails?.nama,
        tanggal: evDetails?.tanggal,
        lokasi: evDetails?.lokasi,
        penyelenggara: evDetails?.penyelenggara
      };
    });

  res.json({
    success: true,
    data: {
      profile: {
        userId: student.userId,
        nis: student.nis,
        nama: studentUser.nama,
        email: studentUser.email,
        kelas: student.kelas,
        kontak: student.kontak
      },
      nilai,
      evaluasi,
      events: eventsParticipated
    }
  });
});

// Guru Route: Add / Modify / Delete Evaluasi (RULE-08: min 20 char)
app.post('/api/v1/guru/evaluasi', authMiddleware, (req: any, res) => {
  if (req.role !== 'guru') return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Akses ditolak.' } });
  const { siswaId, kategori, komentar, eventId } = req.body;

  if (!siswaId || !kategori || !komentar) {
    return res.status(400).json({ success: false, error: { code: 'ERR-VAL-01', message: 'Seluruh kolom wajib diisi.' } });
  }

  if (komentar.length < 20) {
    return res.status(400).json({
      success: false,
      error: { code: 'ERR-VAL-02', message: 'Komentar evaluasi minimal harus 20 karakter.' }
    });
  }

  const db = readDb();
  // Verify ownership
  const student = db.siswa.find((s: any) => s.userId === siswaId);
  const guruProfile = db.guru.find((g: any) => g.userId === req.userId);

  if (!student || !guruProfile || student.guruWaliNip !== guruProfile.nip) {
    return res.status(403).json({
      success: false,
      error: { code: 'ERR-403', message: 'Anda hanya dapat mengevaluasi siswa binaan Anda sendiri.' }
    });
  }

  const evaluasiId = `ev-${crypto.randomUUID().slice(0, 8)}`;
  const newEvaluasi = {
    id: evaluasiId,
    guruId: req.userId,
    siswaId,
    kategori,
    komentar,
    eventId: eventId || null,
    createdAt: new Date().toISOString()
  };

  db.evaluasi.push(newEvaluasi);

  // In-app Notification for the Student (NT-01)
  const gUser = db.users.find((u: any) => u.id === req.userId);
  db.notifications.unshift({
    id: `notif-${crypto.randomUUID().slice(0, 8)}`,
    userId: siswaId,
    message: `Evaluasi baru ditambahkan oleh Guru ${gUser?.nama || ''} [Kategori: ${kategori}]`,
    read: false,
    createdAt: new Date().toISOString()
  });

  logActivity(req.userId, 'guru', 'add_evaluasi', 'evaluasi', evaluasiId, { siswaId, kategori });
  writeDb(db);

  res.json({ success: true, message: 'Evaluasi berhasil ditambahkan.' });
});

app.put('/api/v1/guru/evaluasi/:id', authMiddleware, (req: any, res) => {
  if (req.role !== 'guru') return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Akses ditolak.' } });
  const { id } = req.params;
  const { komentar, kategori, eventId } = req.body;

  if (komentar && komentar.length < 20) {
    return res.status(400).json({
      success: false,
      error: { code: 'ERR-VAL-02', message: 'Komentar evaluasi minimal harus 20 karakter.' }
    });
  }

  const db = readDb();
  const evIndex = db.evaluasi.findIndex((ev: any) => ev.id === id);
  if (evIndex === -1) {
    return res.status(404).json({ success: false, error: { code: 'ERR-404', message: 'Evaluasi tidak ditemukan.' } });
  }

  const ev = db.evaluasi[evIndex];
  if (ev.guruId !== req.userId) {
    return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Hanya guru pembuat yang dapat mengedit.' } });
  }

  db.evaluasi[evIndex].komentar = komentar || db.evaluasi[evIndex].komentar;
  db.evaluasi[evIndex].kategori = kategori || db.evaluasi[evIndex].kategori;
  db.evaluasi[evIndex].eventId = eventId !== undefined ? eventId : db.evaluasi[evIndex].eventId;

  logActivity(req.userId, 'guru', 'update_evaluasi', 'evaluasi', id);
  writeDb(db);

  res.json({ success: true, message: 'Evaluasi berhasil diubah.' });
});

app.delete('/api/v1/guru/evaluasi/:id', authMiddleware, (req: any, res) => {
  if (req.role !== 'guru') return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Akses ditolak.' } });
  const { id } = req.params;

  const db = readDb();
  const evIndex = db.evaluasi.findIndex((ev: any) => ev.id === id);
  if (evIndex === -1) {
    return res.status(404).json({ success: false, error: { code: 'ERR-404', message: 'Evaluasi tidak ditemukan.' } });
  }

  const ev = db.evaluasi[evIndex];
  if (ev.guruId !== req.userId) {
    return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Hanya guru pembuat yang dapat menghapus.' } });
  }

  // Soft delete representation: splice or remove
  db.evaluasi.splice(evIndex, 1);
  logActivity(req.userId, 'guru', 'delete_evaluasi', 'evaluasi', id);
  writeDb(db);

  res.json({ success: true, message: 'Evaluasi berhasil dihapus.' });
});

// Siswa Route: Dashboard
app.get('/api/v1/siswa/dashboard', authMiddleware, (req: any, res) => {
  if (req.role !== 'siswa') return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Akses ditolak.' } });
  const db = readDb();

  const totalEventDiikuti = db.siswaEvents.filter((se: any) => se.siswaId === req.userId).length;

  const nilaiSiswa = db.nilai.filter((n: any) => n.siswaId === req.userId);
  const averageNilai = nilaiSiswa.length > 0
    ? (nilaiSiswa.reduce((sum: number, n: any) => sum + n.nilai, 0) / nilaiSiswa.length).toFixed(2)
    : '0.00';

  const recentEvaluations = db.evaluasi
    .filter((ev: any) => ev.siswaId === req.userId)
    .slice(0, 5)
    .map((ev: any) => {
      const gUser = db.users.find((u: any) => u.id === ev.guruId);
      const eventDetails = db.events.find((e: any) => e.id === ev.eventId);
      return {
        ...ev,
        guruNama: gUser?.nama || 'Guru',
        eventName: eventDetails?.nama || ev.eventId || 'Umum'
      };
    });

  const notifications = db.notifications.filter((n: any) => n.userId === req.userId);

  res.json({
    success: true,
    data: {
      totalEventDiikuti,
      averageNilai,
      recentEvaluations,
      notifications
    }
  });
});

app.get('/api/v1/siswa/event', authMiddleware, (req: any, res) => {
  if (req.role !== 'siswa') return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Akses ditolak.' } });
  const db = readDb();

  const result = db.siswaEvents
    .filter((se: any) => se.siswaId === req.userId)
    .map((se: any) => {
      const evDetails = db.events.find((e: any) => e.id === se.eventId);
      return {
        ...se,
        nama: evDetails?.nama,
        tanggal: evDetails?.tanggal,
        lokasi: evDetails?.lokasi,
        penyelenggara: evDetails?.penyelenggara,
        deskripsi: evDetails?.deskripsi
      };
    });

  res.json({ success: true, data: result });
});

app.get('/api/v1/siswa/nilai', authMiddleware, (req: any, res) => {
  if (req.role !== 'siswa') return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Akses ditolak.' } });
  const db = readDb();
  const result = db.nilai.filter((n: any) => n.siswaId === req.userId);
  res.json({ success: true, data: result });
});

app.get('/api/v1/siswa/evaluasi', authMiddleware, (req: any, res) => {
  if (req.role !== 'siswa') return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Akses ditolak.' } });
  const db = readDb();
  const result = db.evaluasi
    .filter((ev: any) => ev.siswaId === req.userId)
    .map((ev: any) => {
      const gProfile = db.guru.find((g: any) => g.userId === ev.guruId);
      const gUser = db.users.find((u: any) => u.id === ev.guruId);
      const eventDetails = db.events.find((e: any) => e.id === ev.eventId);
      return {
        ...ev,
        guruNama: gUser?.nama || 'Guru',
        guruMataPelajaran: gProfile?.mataPelajaran || '',
        eventName: eventDetails?.nama || ev.eventId || 'Umum'
      };
    });
  res.json({ success: true, data: result });
});

app.get('/api/v1/siswa/ptn', authMiddleware, (req: any, res) => {
  if (req.role !== 'siswa') return res.status(403).json({ success: false, error: { code: 'ERR-403', message: 'Akses ditolak.' } });
  const db = readDb();
  res.json({ success: true, data: db.ptn });
});

// Notifications update
app.post('/api/v1/notifications/:id/read', authMiddleware, (req: any, res) => {
  const { id } = req.params;
  const db = readDb();
  const notifIndex = db.notifications.findIndex((n: any) => n.id === id && n.userId === req.userId);
  if (notifIndex !== -1) {
    db.notifications[notifIndex].read = true;
    writeDb(db);
  }
  res.json({ success: true });
});

// Get master data for dropdowns (e.g., listing all events, listing all teachers for selection)
app.get('/api/v1/master/guru-list', (req, res) => {
  const db = readDb();
  const result = db.guru.map((g: any) => {
    const user = db.users.find((u: any) => u.id === g.userId);
    return {
      nip: g.nip,
      nama: user?.nama || 'Tanpa Nama'
    };
  });
  res.json({ success: true, data: result });
});

app.get('/api/v1/master/events-list', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.events });
});

// For any other static routes or Vite integration
let viteServer: any;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    viteServer = await createServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa'
    });
    app.use(viteServer.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LKPD App] Server listening on http://localhost:${PORT}`);
  });
}

startServer();
