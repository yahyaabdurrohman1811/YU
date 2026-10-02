import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Ship,
  Package,
  Users,
  Calendar,
  BarChart3,
  LogOut,
  Database,
  Anchor,
  Shield,
} from 'lucide-react';

export type ActiveTab = 'overview' | 'cargo' | 'passengers' | 'ships' | 'voyages';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  cargoCount: number;
  passengerCount: number;
  shipCount: number;
  onOpenSeedModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cargoCount,
  passengerCount,
  shipCount,
}) => {
  const { user, logout, isDbConnected } = useAuth();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'syahbandar':
        return {
          label: 'Syahbandar (Harbor Master)',
          bg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        };
      case 'petugas':
        return {
          label: 'Petugas Manifest',
          bg: 'bg-sky-100 text-sky-800 border-sky-200',
        };
      case 'admin':
      default:
        return {
          label: 'Admin Pelabuhan',
          bg: 'bg-blue-100 text-blue-800 border-blue-200',
        };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top utility row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-xs">
            <Anchor className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-base tracking-tight">
                PORT MANIFEST
              </span>
              <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                Sistem Muatan & Penumpang
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Direktorat Jenderal Perhubungan Laut & Otoritas Pelabuhan
            </p>
          </div>
        </div>

        {/* Database indicator & User Account */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
            <Database className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Firebase Firestore:</span>
            <span className="font-semibold text-emerald-700">
              {isDbConnected ? 'Real-time Aktif' : 'Tersambung'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 pl-2 sm:pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-end gap-1.5">
                <Shield className="w-3 h-3 text-blue-600" />
                <span>{user?.displayName || 'Administrator'}</span>
              </div>
              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${roleInfo.bg}`}>
                {roleInfo.label}
              </span>
            </div>

            <button
              onClick={() => logout()}
              title="Keluar dari akun"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200 cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Ringkasan Pelabuhan</span>
          </button>

          <button
            onClick={() => setActiveTab('cargo')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition whitespace-nowrap cursor-pointer ${
              activeTab === 'cargo'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Manifest Muatan Kargo</span>
            <span
              className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                activeTab === 'cargo' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {cargoCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('passengers')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition whitespace-nowrap cursor-pointer ${
              activeTab === 'passengers'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Manifest Penumpang</span>
            <span
              className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                activeTab === 'passengers' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {passengerCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ships')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition whitespace-nowrap cursor-pointer ${
              activeTab === 'ships'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Ship className="w-4 h-4" />
            <span>Armada Kapal</span>
            <span
              className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                activeTab === 'ships' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {shipCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('voyages')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition whitespace-nowrap cursor-pointer ${
              activeTab === 'voyages'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Jadwal & Rute Pelayaran</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
