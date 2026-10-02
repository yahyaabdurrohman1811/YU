import React, { useState } from 'react';
import { Ship, ShipType, ShipStatus, Cargo, Passenger } from '../types';
import { addShip, updateShip, deleteShip } from '../services/portService';
import { useToast } from './Toast';
import { ConfirmModal } from './ConfirmModal';
import {
  Ship as ShipIcon,
  Plus,
  Search,
  Edit2,
  Trash2,
  Anchor,
  Users,
  Package,
  Shield,
  Gauge,
} from 'lucide-react';

interface ShipManagementProps {
  ships: Ship[];
  cargos: Cargo[];
  passengers: Passenger[];
}

const SHIP_TYPES: ShipType[] = [
  'Kapal Feri Ro-Ro',
  'Kapal Penumpang (Pelni)',
  'Kapal Kargo Kontainer',
  'Kapal Cepat Express',
];

const SHIP_STATUSES: ShipStatus[] = [
  'Bersandar (Berthing)',
  'Bongkar Muat (Loading/Unloading)',
  'Berlayar (Sailing)',
  'Perawatan (Maintenance)',
];

interface ShipFormErrors {
  name?: string;
  code?: string;
  capacityPassengers?: string;
  capacityCargoTons?: string;
  captainName?: string;
}

export const ShipManagement: React.FC<ShipManagementProps> = ({ ships, cargos, passengers }) => {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShip, setEditingShip] = useState<Ship | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete
  const [shipToDelete, setShipToDelete] = useState<Ship | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<ShipType>('Kapal Feri Ro-Ro');
  const [capacityPassengers, setCapacityPassengers] = useState<string>('800');
  const [capacityCargoTons, setCapacityCargoTons] = useState<string>('2500');
  const [captainName, setCaptainName] = useState('');
  const [status, setStatus] = useState<ShipStatus>('Bersandar (Berthing)');
  const [formErrors, setFormErrors] = useState<ShipFormErrors>({});

  const handleOpenCreateModal = () => {
    setEditingShip(null);
    setName('');
    const randomCode = Math.floor(1000000 + Math.random() * 9000000);
    setCode(`IMO-${randomCode}`);
    setType('Kapal Feri Ro-Ro');
    setCapacityPassengers('800');
    setCapacityCargoTons('2500');
    setCaptainName('Capt. ');
    setStatus('Bersandar (Berthing)');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ship: Ship) => {
    setEditingShip(ship);
    setName(ship.name);
    setCode(ship.code);
    setType(ship.type);
    setCapacityPassengers(String(ship.capacityPassengers));
    setCapacityCargoTons(String(ship.capacityCargoTons));
    setCaptainName(ship.captainName);
    setStatus(ship.status);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: ShipFormErrors = {};

    if (!name.trim()) {
      errors.name = 'Nama armada kapal wajib diisi';
    } else if (name.trim().length < 2) {
      errors.name = 'Nama kapal minimal 2 karakter';
    }

    if (!code.trim()) {
      errors.code = 'Nomor IMO / Call Sign wajib diisi';
    } else if (code.trim().length < 3) {
      errors.code = 'Kode IMO minimal 3 karakter';
    }

    const passCap = parseInt(capacityPassengers, 10);
    if (isNaN(passCap) || passCap < 0) {
      errors.capacityPassengers = 'Kapasitas penumpang harus berupa angka valid (>= 0)';
    }

    const cargoCap = parseFloat(capacityCargoTons);
    if (isNaN(cargoCap) || cargoCap < 0) {
      errors.capacityCargoTons = 'Kapasitas tonase kargo harus berupa angka valid (>= 0)';
    }

    if (!captainName.trim()) {
      errors.captainName = 'Nama Nakhoda / Master wajib diisi';
    } else if (captainName.trim().length < 3) {
      errors.captainName = 'Nama nakhoda minimal 3 karakter';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('warning', 'Validasi Gagal', 'Harap periksa kolom yang ditandai merah');
      return;
    }

    setIsSubmitting(true);
    const passCap = parseInt(capacityPassengers, 10);
    const cargoCap = parseFloat(capacityCargoTons);

    try {
      if (editingShip) {
        await updateShip(editingShip.id, {
          name: name.trim(),
          code: code.trim(),
          type,
          capacityPassengers: passCap,
          capacityCargoTons: cargoCap,
          captainName: captainName.trim(),
          status,
        });
        showToast('success', 'Kapal Diperbarui', `Armada ${name} berhasil disimpan di Firestore`);
      } else {
        await addShip({
          name: name.trim(),
          code: code.trim(),
          type,
          capacityPassengers: passCap,
          capacityCargoTons: cargoCap,
          captainName: captainName.trim(),
          status,
        });
        showToast('success', 'Kapal Ditambahkan', `Armada ${name} berhasil didaftarkan di Firestore`);
      }
      setIsModalOpen(false);
    } catch {
      showToast('error', 'Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan ke database Firestore');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!shipToDelete) return;
    setIsDeleting(true);
    try {
      await deleteShip(shipToDelete.id);
      showToast('success', 'Kapal Dihapus', `Armada ${shipToDelete.name} telah dihapus dari database`);
      setShipToDelete(null);
    } catch {
      showToast('error', 'Gagal Menghapus', 'Tidak dapat menghapus kapal dari Firestore');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredShips = ships.filter((ship) => {
    const matchesSearch =
      ship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ship.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ship.captainName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'ALL' || ship.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Manajemen Armada Kapal (Vessels)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
              {filteredShips.length} Kapal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data spesifikasi kapal, nomor registrasi IMO, kapasitas muatan tonase, kuota penumpang, dan nakhoda.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Armada Kapal</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari Nama Kapal, IMO, Nakhoda..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
          />
        </div>

        <div className="sm:w-64">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition cursor-pointer"
          >
            <option value="ALL">Semua Tipe Kapal</option>
            {SHIP_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ship Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredShips.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
            <ShipIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700">Tidak ada armada kapal ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Klik tombol "Tambah Armada Kapal" di atas</p>
          </div>
        ) : (
          filteredShips.map((ship) => {
            // Count current passengers & cargo for this ship
            const shipPassengers = passengers.filter((p) => p.shipName === ship.name);
            const shipCargos = cargos.filter((c) => c.shipName === ship.name);
            const shipCargoWeightKg = shipCargos.reduce((s, c) => s + (c.weightKg || 0), 0);
            const shipCargoTons = shipCargoWeightKg / 1000;

            const passengerPct = ship.capacityPassengers > 0
              ? Math.min(100, Math.round((shipPassengers.length / ship.capacityPassengers) * 100))
              : 0;

            const cargoPct = ship.capacityCargoTons > 0
              ? Math.min(100, Math.round((shipCargoTons / ship.capacityCargoTons) * 100))
              : 0;

            return (
              <div
                key={ship.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                        <Anchor className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                          {ship.name}
                        </h3>
                        <span className="font-mono text-[11px] text-slate-500 font-semibold">
                          {ship.code}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
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

                  {/* Type & Master */}
                  <div className="space-y-1.5 py-2 border-y border-slate-100 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Jenis Kapal:</span>
                      <span className="font-semibold text-slate-700">{ship.type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Nakhoda (Master):</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-blue-600" />
                        {ship.captainName}
                      </span>
                    </div>
                  </div>

                  {/* Capacity progress bars */}
                  <div className="mt-4 space-y-3">
                    {/* Passenger capacity */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-sky-600" />
                          Penumpang Terdaftar
                        </span>
                        <span className="font-bold text-slate-800">
                          {shipPassengers.length} / {ship.capacityPassengers} Jiwa ({passengerPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full transition-all duration-300"
                          style={{ width: `${passengerPct}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Cargo tonnage capacity */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 text-blue-600" />
                          Tonase Muatan Kargo
                        </span>
                        <span className="font-bold text-slate-800">
                          {shipCargoTons.toFixed(1)} / {ship.capacityCargoTons} Ton ({cargoPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${cargoPct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card footer with actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5" />
                    Kapasitas Layak Laut
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(ship)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                      title="Edit Armada"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShipToDelete(ship)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Hapus Armada"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT SHIP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Anchor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingShip ? 'Edit Data Armada Kapal' : 'Tambah Armada Kapal Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tersimpan permanen di Google Firebase Firestore
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Ship Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Armada Kapal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: KM Kelimutu Nusantara"
                    className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.name ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  />
                  {formErrors.name && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Ship Code / IMO */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor IMO / Call Sign <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Contoh: IMO-9138402"
                    className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.code ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  />
                  {formErrors.code && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.code}</p>
                  )}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipe / Klasifikasi Kapal <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ShipType)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  >
                    {SHIP_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Capacity Passengers */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kapasitas Maksimal Penumpang (Jiwa) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={capacityPassengers}
                    onChange={(e) => setCapacityPassengers(e.target.value)}
                    placeholder="Contoh: 920"
                    className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.capacityPassengers
                        ? 'border-rose-400 bg-rose-50/50'
                        : 'border-slate-300'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  />
                  {formErrors.capacityPassengers && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      {formErrors.capacityPassengers}
                    </p>
                  )}
                </div>

                {/* Capacity Cargo Tons */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kapasitas Maksimal Kargo (Ton) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={capacityCargoTons}
                    onChange={(e) => setCapacityCargoTons(e.target.value)}
                    placeholder="Contoh: 2500"
                    className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.capacityCargoTons
                        ? 'border-rose-400 bg-rose-50/50'
                        : 'border-slate-300'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  />
                  {formErrors.capacityCargoTons && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      {formErrors.capacityCargoTons}
                    </p>
                  )}
                </div>

                {/* Master / Captain */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Nakhoda (Master) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    placeholder="Capt. Bambang Suryono, M.Mar"
                    className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.captainName
                        ? 'border-rose-400 bg-rose-50/50'
                        : 'border-slate-300'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  />
                  {formErrors.captainName && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.captainName}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Operasional Kapal <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ShipStatus)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  >
                    {SHIP_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && (
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                  )}
                  <span>{editingShip ? 'Simpan Perubahan' : 'Daftarkan Kapal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete modal */}
      <ConfirmModal
        isOpen={!!shipToDelete}
        title="Konfirmasi Hapus Armada Kapal"
        message={`Apakah Anda yakin ingin menghapus data armada "${shipToDelete?.name}" (${shipToDelete?.code})? Semua catatan terkait kapal ini akan terhapus dari Firebase.`}
        confirmLabel="Hapus Kapal"
        cancelLabel="Batal"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShipToDelete(null)}
      />
    </div>
  );
};
