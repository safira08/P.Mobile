import React, { createContext, ReactNode, useContext, useRef, useState } from 'react';

// ==========================================
// TIPE DATA
// ==========================================
export interface UserData {
  nama: string;
  nim: string;
  semester: string;
  jurusan: string;
  email: string;
}

// Data yang disimpan di "database" in-memory (per sesi)
interface StoredAccount {
  nim: string;
  passwordHash: string; // hash sederhana (XOR-based), bukan plaintext
  nama: string;
  semester: string;
  jurusan: string;
  email: string;
}

// Hasil register
export type RegisterResult =
  | { success: true }
  | { success: false; error: string };

// Hasil login
export type LoginResult =
  | { success: true }
  | { success: false; error: string };

interface AuthContextType {
  user: UserData | null;
  isLoggedIn: boolean;
  login: (nim: string, password: string) => LoginResult;
  logout: () => void;
  register: (params: {
    nim: string;
    nama: string;
    email: string;
    password: string;
  }) => RegisterResult;
}

// ==========================================
// HELPER: Hash password sederhana (bukan kriptografi serius,
// tapi cukup untuk tidak menyimpan plaintext di memory)
// ==========================================
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(36);
}

// ==========================================
// HELPER: Derive semester & jurusan dari NIM UMM
// Format NIM UMM: YYYYJJPPPNNXXX (15 digit)
//  - Digit 5-6 (index 4-5): kode jurusan
//  - Digit 1-4 (index 0-3): tahun masuk
// ==========================================
function deriveSemesterFromNim(nim: string): string {
  try {
    const tahunMasuk = parseInt(nim.substring(0, 4), 10);
    const now = new Date();
    // Semester ganjil mulai Agustus, genap mulai Februari
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    // Total semester: (tahun berjalan - tahun masuk) * 2 + offset bulan
    const yearDiff = currentYear - tahunMasuk;
    const monthOffset = currentMonth >= 8 ? 1 : 0;
    const semesterNum = Math.min(Math.max(yearDiff * 2 + monthOffset, 1), 14);
    return `Semester ${semesterNum}`;
  } catch {
    return 'Semester 1';
  }
}

// Kode jurusan dari digit ke-7 dan 8 NIM UMM (karakter index 6-7)
// Referensi kode jurusan UMM (sebagian, bisa diperluas)
const KODE_JURUSAN: Record<string, string> = {
  '37': 'S1 Informatika',
  '38': 'S1 Sistem Informasi',
  '36': 'S1 Teknik Elektro',
  '35': 'S1 Teknik Mesin',
  '34': 'S1 Teknik Sipil',
  '01': 'S1 Pendidikan Agama Islam',
  '02': 'S1 Pendidikan Bahasa Arab',
  '10': 'S1 Manajemen',
  '11': 'S1 Akuntansi',
  '12': 'S1 Ekonomi Pembangunan',
  '20': 'S1 Ilmu Hukum',
  '30': 'S1 Kedokteran',
  '31': 'S1 Keperawatan',
  '32': 'S1 Farmasi',
  '40': 'S1 Psikologi',
  '50': 'S1 Ilmu Komunikasi',
  '51': 'S1 Hubungan Internasional',
  '60': 'S1 Agribisnis',
  '61': 'S1 Agroteknologi',
};

function deriveJurusanFromNim(nim: string): string {
  try {
    // Digit 5-6 di NIM UMM adalah kode program studi (index 4 & 5)
    const kode = nim.substring(4, 6);
    return KODE_JURUSAN[kode] ?? 'S1 Informatika';
  } catch {
    return 'S1 Informatika';
  }
}

// ==========================================
// CONTEXT
// ==========================================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);

  // Database akun in-memory (bertahan selama sesi aplikasi aktif)
  // useRef agar tidak trigger re-render saat database berubah
  const accountsDb = useRef<StoredAccount[]>([]);

  // ── Register ──────────────────────────────────────────────────────
  const register = ({
    nim,
    nama,
    email,
    password,
  }: {
    nim: string;
    nama: string;
    email: string;
    password: string;
  }): RegisterResult => {
    // Cek apakah NIM sudah terdaftar
    const exists = accountsDb.current.find((acc) => acc.nim === nim);
    if (exists) {
      return { success: false, error: 'Nomor Mahasiswa ini sudah terdaftar. Silakan masuk.' };
    }

    // Simpan akun baru
    const semester = deriveSemesterFromNim(nim);
    const jurusan = deriveJurusanFromNim(nim);

    accountsDb.current = [
      ...accountsDb.current,
      {
        nim,
        passwordHash: simpleHash(password),
        nama: nama.trim(),
        semester,
        jurusan,
        email: email.trim().toLowerCase(),
      },
    ];

    return { success: true };
  };

  // ── Login ─────────────────────────────────────────────────────────
  const login = (nim: string, password: string): LoginResult => {
    const account = accountsDb.current.find((acc) => acc.nim === nim);

    if (!account || account.passwordHash !== simpleHash(password)) {
      return { success: false, error: 'Nomor Mahasiswa atau kata sandi salah' };
    }

    setUser({
      nama: account.nama,
      nim: account.nim,
      semester: account.semester,
      jurusan: account.jurusan,
      email: account.email,
    });

    return { success: true };
  };

  // ── Logout ────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoggedIn: user !== null }}>
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// HOOK
// ==========================================
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}
