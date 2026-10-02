import React from 'react';
import { Ship, Voyage, Passenger, Cargo } from '../types';
import {
  Ship as ShipIcon,
  Package,
  Users,
  Weight,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

interface DashboardStatsProps {
  ships: Ship[];
  voyages: Voyage[];
  passengers: Passenger[];
  cargos: Cargo[];
  onNavigateTab: (tab: 'cargo' | 'passengers' | 'ships' | 'voyages') => void;
  onSeedData: () => void;
  isSeeding: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  ships,
  voyages,
  passengers,
  cargos,
  onNavigateTab,
  onSeedData,
  isSeeding,
}) => {
  // Aggregate stats
  const totalCargoWeightKg = cargos.reduce((acc, c) => acc + (Number(c.weightKg) || 0), 0);
  const totalCargoTons = (totalCargoWeightKg / 1000).toFixed(2);

  const cargoLoadedCount = cargos.filter((c) => c.status === 'Termuat di Kapal').length;
  const cargoWaitingCount = cargos.filter((c) => c.status === 'Menunggu Muat').length;

  const passengersBoarded = passengers.filter((p) => p.checkInStatus === 'Boarding / Sudah Naik').length;
  const passengersRegistered = passengers.filter((p) => p.checkInStatus === 'Terdaftar').length;

  const shipsBerthing = ships.filter((s) => s.status.includes('Bersandar')).length;
  const shipsLoading = ships.filter((s) => s.status.includes('Bongkar Muat')).length;
  const shipsSailing = ships.filter((s) => s.status.includes('Berlayar')).length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome with Quick Seed Action if needed */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-sky-700 to-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-sky-200 text-xs font-semibold backdrop-blur-xs mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Sistem Operasional Pelabuhan Maritim Terpadu
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pusat Kendali Muatan & Manifest Kapal
            </h2>
            <p className="text-sky-100/90 text-sm mt-1 max-w-2xl">
              Memantau muatan kargo logistik, kendaraan ekspedisi, dan manifest penumpang kapal laut
              secara real-time melalui database Firebase Firestore.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSeedData}
              disabled={isSeeding}
              className="px-4 py-2.5 rounded-xl bg-white text-blue-900 hover:bg-sky-50 font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{isSeeding ? 'Menyuntikkan Data...' : 'Inisialisasi Data Demo'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Muatan Kargo */}
        <div
          onClick={() => onNavigateTab('cargo')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Muatan Kargo
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{totalCargoTons}</span>
              <span className="text-sm font-semibold text-slate-500">Tonase</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {cargos.length} Resi / B/L Muatan Terdaftar
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {cargoLoadedCount} Termuat
            </span>
            <span className="text-amber-700 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              {cargoWaitingCount} Antri
            </span>
          </div>
        </div>

        {/* KPI 2: Penumpang */}
        <div
          onClick={() => onNavigateTab('passengers')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Manifest Penumpang
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{passengers.length}</span>
              <span className="text-sm font-semibold text-slate-500">Jiwa</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manifest tiket tervalidasi NIK
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {passengersBoarded} On-Board
            </span>
            <span className="text-blue-700 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              {passengersRegistered} Terdaftar
            </span>
          </div>
        </div>

        {/* KPI 3: Armada Kapal */}
        <div
          onClick={() => onNavigateTab('ships')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Armada Kapal
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition">
              <ShipIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{ships.length}</span>
              <span className="text-sm font-semibold text-slate-500">Vessel</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {shipsBerthing} Bersandar | {shipsLoading} Bongkar Muat
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-teal-700 font-medium flex items-center gap-1">
              <ShipIcon className="w-3.5 h-3.5" />
              {shipsSailing} Sedang Berlayar
            </span>
            <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition flex items-center">
              Lihat <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* KPI 4: Jadwal Pelayaran */}
        <div
          onClick={() => onNavigateTab('voyages')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Rute & Jadwal
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
              <Weight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{voyages.length}</span>
              <span className="text-sm font-semibold text-slate-500">Pelayaran</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Rute penyeberangan & nusantara
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-indigo-700 font-medium">
              Operasional Maritim 24 Jam
            </span>
            <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition flex items-center">
              Detail <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Quick Status Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ships active in port */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShipIcon className="w-4 h-4 text-blue-600" />
              Status Armada di Pelabuhan
            </h3>
            <button
              onClick={() => onNavigateTab('ships')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Kelola Kapal →
            </button>
          </div>

          <div className="space-y-3">
            {ships.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada armada kapal terdata</p>
            ) : (
              ships.slice(0, 4).map((ship) => (
                <div
                  key={ship.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {ship.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{ship.name}</h4>
                      <p className="text-xs text-slate-500">
                        {ship.code} • Kapasitas: {ship.capacityPassengers} Org / {ship.capacityCargoTons} Ton
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                      ship.status.includes('Bongkar')
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : ship.status.includes('Berlayar')
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {ship.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Latest cargo loaded */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-sky-600" />
              Aktivitas Muatan Kargo Terbaru
            </h3>
            <button
              onClick={() => onNavigateTab('cargo')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Semua Kargo →
            </button>
          </div>

          <div className="space-y-3">
            {cargos.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada data kargo terdata</p>
            ) : (
              cargos.slice(0, 4).map((cargo) => (
                <div
                  key={cargo.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{cargo.manifestNumber}</span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                        {cargo.cargoCategory}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium line-clamp-1">
                      {cargo.description}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Kapal: {cargo.shipName} • Lokasi: {cargo.deckLocation}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-extrabold text-blue-900">
                      {(cargo.weightKg / 1000).toFixed(2)} Ton
                    </span>
                    <span
                      className={`block text-[10px] font-semibold px-2 py-0.5 mt-1 rounded-full border ${
                        cargo.status === 'Termuat di Kapal'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {cargo.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
