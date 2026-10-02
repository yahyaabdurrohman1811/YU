/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './components/Toast';
import { LoginForm } from './components/LoginForm';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { CargoManagement } from './components/CargoManagement';
import { PassengerManagement } from './components/PassengerManagement';
import { ShipManagement } from './components/ShipManagement';
import { VoyageManagement } from './components/VoyageManagement';
import { ManifestPrintModal } from './components/ManifestPrintModal';
import {
  subscribeShips,
  subscribeVoyages,
  subscribePassengers,
  subscribeCargos,
  seedInitialPortData,
} from './services/portService';
import { Ship, Voyage, Passenger, Cargo } from './types';
import { Ship as ShipIcon, Database } from 'lucide-react';

const PortApp: React.FC = () => {
  const { user, loading: authLoading, isDbConnected } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Real-time Firestore state (Single source of truth, NO localStorage)
  const [ships, setShips] = useState<Ship[]>([]);
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Print modal state
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printType, setPrintType] = useState<'cargo' | 'passenger'>('cargo');
  const [printCargoList, setPrintCargoList] = useState<Cargo[]>([]);
  const [printPassengerList, setPrintPassengerList] = useState<Passenger[]>([]);

  // Real-time subscriptions to Firestore
  useEffect(() => {
    // Only subscribe if authenticated
    if (!user) {
      setIsDataLoaded(false);
      return;
    }

    const unsubShips = subscribeShips(
      (data) => setShips(data),
      (err) => console.error('Ships subscription error:', err)
    );

    const unsubVoyages = subscribeVoyages(
      (data) => setVoyages(data),
      (err) => console.error('Voyages subscription error:', err)
    );

    const unsubPassengers = subscribePassengers(
      (data) => setPassengers(data),
      (err) => console.error('Passengers subscription error:', err)
    );

    const unsubCargos = subscribeCargos(
      (data) => {
        setCargos(data);
        setIsDataLoaded(true);
      },
      (err) => console.error('Cargos subscription error:', err)
    );

    // Auto seed realistic data if database is fresh
    seedInitialPortData().catch((e) => console.warn('Auto seed:', e));

    return () => {
      unsubShips();
      unsubVoyages();
      unsubPassengers();
      unsubCargos();
    };
  }, [user]);

  // Handle seed demo data
  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedInitialPortData();
      showToast('success', 'Data Berhasil Diinisialisasi', 'Contoh data kapal, jadwal, manifest penumpang dan kargo telah ditambahkan ke Firestore');
    } catch (error) {
      console.error('Seed error:', error);
      showToast('info', 'Status Data', 'Data di Firestore sudah tersedia atau diperbarui.');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleOpenPrintCargo = (list: Cargo[]) => {
    setPrintType('cargo');
    setPrintCargoList(list);
    setPrintModalOpen(true);
  };

  const handleOpenPrintPassenger = (list: Passenger[]) => {
    setPrintType('passenger');
    setPrintPassengerList(list);
    setPrintModalOpen(true);
  };

  // If loading auth state from Firebase
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 animate-pulse">
          <ShipIcon className="w-8 h-8" />
        </div>
        <h2 className="text-base font-bold text-slate-800 tracking-tight">
          Menghubungkan ke Sistem Pelabuhan...
        </h2>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          Memverifikasi database Firebase Firestore
        </p>
      </div>
    );
  }

  // DEFAULT VIEW: Login Form with Quick Demo Login as required by prompt
  if (!user) {
    return <LoginForm />;
  }

  // AUTHENTICATED VIEW: Full Port Management System
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cargoCount={cargos.length}
        passengerCount={passengers.length}
        shipCount={ships.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <DashboardStats
            ships={ships}
            voyages={voyages}
            passengers={passengers}
            cargos={cargos}
            onNavigateTab={setActiveTab}
            onSeedData={handleSeedData}
            isSeeding={isSeeding}
          />
        )}

        {activeTab === 'cargo' && (
          <CargoManagement
            cargos={cargos}
            ships={ships}
            voyages={voyages}
            onPrintManifest={handleOpenPrintCargo}
          />
        )}

        {activeTab === 'passengers' && (
          <PassengerManagement
            passengers={passengers}
            ships={ships}
            voyages={voyages}
            onPrintBoarding={handleOpenPrintPassenger}
          />
        )}

        {activeTab === 'ships' && (
          <ShipManagement
            ships={ships}
            cargos={cargos}
            passengers={passengers}
          />
        )}

        {activeTab === 'voyages' && (
          <VoyageManagement
            voyages={voyages}
            ships={ships}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">PORT MANIFEST SYSTEM</span>
            <span>•</span>
            <span>Manajemen Muatan Kapal & Manifest Penumpang</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
              Firebase Firestore Active
            </span>
            <span>Single Source of Truth (No localStorage)</span>
          </div>
        </div>
      </footer>

      {/* Official Manifest Document Print Modal */}
      <ManifestPrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        type={printType}
        cargoList={printCargoList}
        passengerList={printPassengerList}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <PortApp />
      </ToastProvider>
    </AuthProvider>
  );
}
