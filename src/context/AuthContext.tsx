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
  passwordHash: string;
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
  | { success: true; user?: UserData }
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
// HELPER: Hash password sederhana
// ==========================================
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
}

// ==========================================
// DATA PROFIL DEFAULT MAHASISWA SIMAK
// Nama: safira
// NIM: 202410370110233
// Prodi: S1 Informatika • Semester 5
// ==========================================
export const DEFAULT_USER: UserData = {
  nama: 'safira',
  nim: '202410370110233',
  semester: 'Semester 5',
  jurusan: 'S1 Informatika',
  email: 'safira@webmail.umm.ac.id',
};

// ==========================================
// HELPER: Derive semester & jurusan dari NIM UMM
// ==========================================
function deriveSemesterFromNim(nim: string): string {
  if (nim === '202410370110233') {
    return 'Semester 5';
  }
  try {
    const tahunMasuk = parseInt(nim.substring(0, 4), 10);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const yearDiff = currentYear - tahunMasuk;
    const monthOffset = currentMonth >= 8 ? 1 : 0;
    const semesterNum = Math.min(Math.max(yearDiff * 2 + monthOffset, 1), 14);
    return `Semester ${semesterNum}`;
  } catch {
    return 'Semester 5';
  }
}

const KODE_JURUSAN: Record<string, string> = {
  '37': 'S1 Informatika',
  '38': 'S1 Sistem Informasi',
  '36': 'S1 Teknik Elektro',
  '35': 'S1 Teknik Mesin',
  '34': 'S1 Teknik Sipil',
  '01': 'S1 Pendidikan Agama Islam',
  '02': 'S1 Pendidikan Bahasa Arab',
  '10': 'S1 Informatika',
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
    // Khusus NIM safira: 202410370110233 -> S1 Informatika (digit 6-7 adalah 37)
    if (nim.includes('37') || nim === '202410370110233') {
      return 'S1 Informatika';
    }
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
  // Set default user langsung ke safira (S1 Informatika, Semester 5)
  const [user, setUser] = useState<UserData | null>(DEFAULT_USER);

  // Database akun in-memory (sudah pre-seed akun safira)
  const accountsDb = useRef<StoredAccount[]>([
    {
      nim: '202410370110233',
      passwordHash: simpleHash('12345678'),
      nama: 'safira',
      semester: 'Semester 5',
      jurusan: 'S1 Informatika',
      email: 'safira@webmail.umm.ac.id',
    },
  ]);

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
    const exists = accountsDb.current.find((acc) => acc.nim === nim);
    if (exists) {
      return { success: false, error: 'Nomor Mahasiswa ini sudah terdaftar. Silakan masuk.' };
    }

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

    const userData: UserData = {
      nama: account.nama,
      nim: account.nim,
      semester: account.semester,
      jurusan: account.jurusan,
      email: account.email,
    };

    setUser(userData);

    return { success: true, user: userData };
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
