import React, { useState } from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { useToast } from './Toast';
import {
  Ship,
  Anchor,
  ShieldCheck,
  Package,
  Users,
  Eye,
  EyeOff,
  Database,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
} from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { loginWithEmail, loginDemo, loading, error, clearError, isDbConnected } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'petugas' | 'syahbandar'>('admin');
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = 'Email atau username admin wajib diisi';
    } else if (!email.includes('@') && email.length < 3) {
      errs.email = 'Format username/email tidak valid';
    }

    if (!password) {
      errs.password = 'Kata sandi wajib diisi';
    } else if (password.length < 6) {
      errs.password = 'Kata sandi minimal 6 karakter';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validate()) {
      showToast('warning', 'Validasi Form', 'Silakan periksa inputan email dan sandi');
      return;
    }

    // If username without @ is entered, append demo domain
    const formattedEmail = email.includes('@') ? email.trim() : `${email.trim()}@maritim.go.id`;

    try {
      await loginWithEmail(formattedEmail, password, selectedRole);
      showToast('success', 'Berhasil Masuk', `Selamat datang di Sistem Manifest Pelabuhan`);
    } catch {
      showToast('error', 'Gagal Masuk', 'Periksa kembali kredensial atau gunakan tombol demo login di bawah');
    }
  };

  const handleQuickDemoClick = async (type: 'admin' | 'petugas' | 'syahbandar') => {
    clearError();
    const demo = DEMO_ACCOUNTS[type];
    setEmail(demo.email);
    setPassword(demo.password);
    setSelectedRole(demo.role);

    try {
      await loginDemo(type);
      showToast('success', 'Demo Login Berhasil', `Masuk sebagai ${demo.roleTitle}`);
    } catch {
      showToast('error', 'Gagal Demo Login', 'Terjadi kendala saat menyambung ke server');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-blue-50/40 text-slate-800 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Banner / System Tag */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Ship className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              PORT MANIFEST SYSTEM
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                Live Production
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Sistem Manajemen Muatan Kapal & Manifest Penumpang Maritim
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-medium text-slate-600">
          <Database className="w-4 h-4 text-emerald-500" />
          <span>Realtime Firebase:</span>
          <span className="font-semibold text-emerald-700 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {isDbConnected ? 'Terkoneksi' : 'Menghubungkan'}
          </span>
        </div>
      </header>

      {/* Main Login Section */}
      <main className="max-w-6xl mx-auto w-full py-8 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: System Info & Features */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-800 text-xs font-semibold">
            <Anchor className="w-3.5 h-3.5 text-sky-600" />
            Otoritas Pelabuhan & Angkutan Laut Terpadu
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Kelola Muatan Logistik & Manifest Penumpang Kapal Secara Presisi.
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Platform modern pencatatan data kapal, alokasi dek muatan, timbangan kargo, kendaraan ekspedisi,
              hingga manifest penumpang secara persisten di Google Firebase Firestore.
            </p>
          </div>

          {/* Key Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Muatan & Kargo</h4>
                <p className="text-xs text-slate-500">Peti kemas, kendaraan roda 2/4, truk & logistik curah</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Manifest Penumpang</h4>
                <p className="text-xs text-slate-500">Validasi NIK 16 digit, kelas kabin & status boarding</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">100% Real Database</h4>
                <p className="text-xs text-slate-500">Firebase Firestore sebagai single source of truth tanpa localStorage</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Keamanan Teruji</h4>
                <p className="text-xs text-slate-500">Sertifikasi manifest & Persetujuan Berlayar Syahbandar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form with Quick Demo */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900">Masuk Portal Administrator</h3>
            <p className="text-sm text-slate-500 mt-1">
              Silakan login dengan akun admin Anda atau gunakan tombol Quick Demo Login di bawah.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between">
              <span>{error}</span>
              <button onClick={clearError} className="font-bold underline ml-2">
                Tutup
              </button>
            </div>
          )}

          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Username / Email Petugas
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin.pelabuhan@maritim.go.id"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition ${
                    validationErrors.email
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                  disabled={loading}
                />
              </div>
              {validationErrors.email && (
                <p className="text-xs text-rose-600 mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition ${
                    validationErrors.password
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-xs text-rose-600 mt-1">{validationErrors.password}</p>
              )}
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Sistem Pelabuhan</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Login section */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick Demo Login (Sekali Klik Langsung Masuk)
              </span>
              <span className="text-[11px] text-slate-400">Pilih Peran</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option 1: Admin */}
              <button
                type="button"
                onClick={() => handleQuickDemoClick('admin')}
                disabled={loading}
                className="p-3 text-left rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 hover:border-blue-300 transition group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    1
                  </div>
                  <span className="text-xs font-bold text-blue-900 group-hover:text-blue-950">
                    Admin Utama
                  </span>
                </div>
                <p className="text-[11px] text-blue-700/80 leading-tight">
                  Full CRUD Kapal, Muatan & Penumpang
                </p>
              </button>

              {/* Option 2: Petugas Manifest */}
              <button
                type="button"
                onClick={() => handleQuickDemoClick('petugas')}
                disabled={loading}
                className="p-3 text-left rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100/70 hover:border-sky-300 transition group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    2
                  </div>
                  <span className="text-xs font-bold text-sky-900 group-hover:text-sky-950">
                    Petugas Kargo
                  </span>
                </div>
                <p className="text-[11px] text-sky-700/80 leading-tight">
                  Input Kargo, Kendaraan & Boarding
                </p>
              </button>

              {/* Option 3: Syahbandar */}
              <button
                type="button"
                onClick={() => handleQuickDemoClick('syahbandar')}
                disabled={loading}
                className="p-3 text-left rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 hover:border-indigo-300 transition group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    3
                  </div>
                  <span className="text-xs font-bold text-indigo-900 group-hover:text-indigo-950">
                    Syahbandar
                  </span>
                </div>
                <p className="text-[11px] text-indigo-700/80 leading-tight">
                  Inspeksi Kelayakan & Cetak SPB
                </p>
              </button>
            </div>

            <div className="mt-3 text-center">
              <p className="text-[11px] text-slate-500">
                Data demo tersinkronisasi langsung ke Firebase Firestore Enterprise.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <p>© 2026 Otoritas Pelabuhan Maritim Indonesia. Seluruh hak cipta dilindungi.</p>
        <div className="flex items-center gap-4">
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-medium">
            Status: Database Cloud Online
          </span>
          <span>Inter Typography v4.0</span>
        </div>
      </footer>
    </div>
  );
};
