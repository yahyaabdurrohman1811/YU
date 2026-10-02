import React, { useState } from 'react';
import { Voyage, VoyageStatus, Ship } from '../types';
import { addVoyage, updateVoyage, deleteVoyage } from '../services/portService';
import { useToast } from './Toast';
import { ConfirmModal } from './ConfirmModal';
import {
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  Navigation,
  Clock,
  CheckCircle2,
  Ship as ShipIcon,
} from 'lucide-react';

interface VoyageManagementProps {
  voyages: Voyage[];
  ships: Ship[];
}

const VOYAGE_STATUSES: VoyageStatus[] = ['Jadwal', 'Boarding', 'Berlayar', 'Tiba', 'Selesai'];

interface VoyageFormErrors {
  voyageNumber?: string;
  shipName?: string;
  originPort?: string;
  destinationPort?: string;
  departureTime?: string;
  arrivalTime?: string;
}

export const VoyageManagement: React.FC<VoyageManagementProps> = ({ voyages, ships }) => {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoyage, setEditingVoyage] = useState<Voyage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete
  const [voyageToDelete, setVoyageToDelete] = useState<Voyage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [voyageNumber, setVoyageNumber] = useState('');
  const [shipName, setShipName] = useState('');
  const [shipId, setShipId] = useState('');
  const [originPort, setOriginPort] = useState('');
  const [destinationPort, setDestinationPort] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [status, setStatus] = useState<VoyageStatus>('Jadwal');
  const [formErrors, setFormErrors] = useState<VoyageFormErrors>({});

  const handleOpenCreateModal = () => {
    setEditingVoyage(null);
    const randomVyg = Math.floor(100 + Math.random() * 900);
    setVoyageNumber(`VYG-${new Date().getFullYear()}/${randomVyg}`);
    if (ships.length > 0) {
      setShipName(ships[0].name);
      setShipId(ships[0].id);
    } else {
      setShipName('');
      setShipId('');
    }
    setOriginPort('Pelabuhan Tanjung Perak (Surabaya)');
    setDestinationPort('Pelabuhan Soekarno-Hatta (Makassar)');
    setDepartureTime('2026-10-02 09:00 WIB');
    setArrivalTime('2026-10-03 15:00 WITA');
    setStatus('Jadwal');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (v: Voyage) => {
    setEditingVoyage(v);
    setVoyageNumber(v.voyageNumber);
    setShipName(v.shipName);
    setShipId(v.shipId || '');
    setOriginPort(v.originPort);
    setDestinationPort(v.destinationPort);
    setDepartureTime(v.departureTime);
    setArrivalTime(v.arrivalTime);
    setStatus(v.status);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: VoyageFormErrors = {};

    if (!voyageNumber.trim()) {
      errors.voyageNumber = 'Nomor Pelayaran wajib diisi';
    }

    if (!shipName.trim()) {
      errors.shipName = 'Pilih kapal pelayaran';
    }

    if (!originPort.trim()) {
      errors.originPort = 'Pelabuhan Asal wajib diisi';
    }

    if (!destinationPort.trim()) {
      errors.destinationPort = 'Pelabuhan Tujuan wajib diisi';
    }

    if (!departureTime.trim()) {
      errors.departureTime = 'Waktu keberangkatan wajib diisi';
    }

    if (!arrivalTime.trim()) {
      errors.arrivalTime = 'Waktu estimasi tiba wajib diisi';
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
    try {
      if (editingVoyage) {
        await updateVoyage(editingVoyage.id, {
          voyageNumber: voyageNumber.trim(),
          shipName: shipName.trim(),
          shipId: shipId || undefined,
          originPort: originPort.trim(),
          destinationPort: destinationPort.trim(),
          departureTime: departureTime.trim(),
          arrivalTime: arrivalTime.trim(),
          status,
        });
        showToast('success', 'Jadwal Diperbarui', `Pelayaran ${voyageNumber} tersimpan di Firestore`);
      } else {
        await addVoyage({
          voyageNumber: voyageNumber.trim(),
          shipName: shipName.trim(),
          shipId: shipId || undefined,
          originPort: originPort.trim(),
          destinationPort: destinationPort.trim(),
          departureTime: departureTime.trim(),
          arrivalTime: arrivalTime.trim(),
          status,
        });
        showToast('success', 'Jadwal Ditambahkan', `Pelayaran ${voyageNumber} berhasil dibuat`);
      }
      setIsModalOpen(false);
    } catch {
      showToast('error', 'Gagal Menyimpan', 'Terjadi masalah saat menulis data ke Firestore');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!voyageToDelete) return;
    setIsDeleting(true);
    try {
      await deleteVoyage(voyageToDelete.id);
      showToast('success', 'Jadwal Dihapus', `Pelayaran ${voyageToDelete.voyageNumber} telah dihapus`);
      setVoyageToDelete(null);
    } catch {
      showToast('error', 'Gagal Menghapus', 'Gagal menghapus pelayaran dari Firestore');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredVoyages = voyages.filter((v) => {
    const matchesSearch =
      v.voyageNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.shipName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.originPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.destinationPort.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || v.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Jadwal & Rute Pelayaran Kapal
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              {filteredVoyages.length} Jadwal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Penetapan nomor pelayaran (voyage), pelabuhan asal-tujuan, dan estimasi waktu sandar kapal.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jadwal Pelayaran</span>
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
            placeholder="Cari No Pelayaran, Kapal, Pelabuhan Asal/Tujuan..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
          />
        </div>

        <div className="sm:w-64">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition cursor-pointer"
          >
            <option value="ALL">Semua Status Pelayaran</option>
            {VOYAGE_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Voyages Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">No. Pelayaran</th>
                <th className="px-4 py-3.5">Kapal Armada</th>
                <th className="px-4 py-3.5">Rute (Asal → Tujuan)</th>
                <th className="px-4 py-3.5">Jadwal Keberangkatan & Tiba</th>
                <th className="px-4 py-3.5">Status Pelayaran</th>
                <th className="px-4 py-3.5 text-right">Aksi Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVoyages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-sm text-slate-600">Belum ada jadwal pelayaran</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Klik "Tambah Jadwal Pelayaran" untuk mendaftarkan rute baru.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredVoyages.map((v) => (
                  <tr key={v.id} className="hover:bg-indigo-50/30 transition">
                    {/* Voyage No */}
                    <td className="px-4 py-3.5">
                      <span className="font-extrabold text-blue-900 font-mono text-[13px]">
                        {v.voyageNumber}
                      </span>
                    </td>

                    {/* Ship Name */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <ShipIcon className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-slate-800 text-sm">{v.shipName}</span>
                      </div>
                    </td>

                    {/* Route */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <span>{v.originPort}</span>
                        <Navigation className="w-3.5 h-3.5 text-blue-600 rotate-90 flex-shrink-0" />
                        <span>{v.destinationPort}</span>
                      </div>
                    </td>

                    {/* Times */}
                    <td className="px-4 py-3.5">
                      <div className="text-[11px]">
                        <span className="text-slate-400">Berangkat: </span>
                        <span className="font-semibold text-slate-700">{v.departureTime}</span>
                      </div>
                      <div className="text-[11px]">
                        <span className="text-slate-400">Tiba: </span>
                        <span className="font-semibold text-slate-700">{v.arrivalTime}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          v.status === 'Berlayar'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : v.status === 'Boarding'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : v.status === 'Tiba' || v.status === 'Selesai'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {v.status === 'Tiba' || v.status === 'Selesai' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Clock className="w-3 h-3 text-blue-600" />
                        )}
                        {v.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(v)}
                          title="Edit Jadwal"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setVoyageToDelete(v)}
                          title="Hapus Jadwal"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* CREATE / EDIT VOYAGE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingVoyage ? 'Edit Jadwal Pelayaran' : 'Tambah Jadwal Pelayaran Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Data disimpan persisten di Google Firebase Firestore
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
                {/* Voyage Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Pelayaran (Voyage) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={voyageNumber}
                    onChange={(e) => setVoyageNumber(e.target.value)}
                    placeholder="VYG-2026/001"
                    className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.voyageNumber ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  />
                  {formErrors.voyageNumber && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.voyageNumber}</p>
                  )}
                </div>

                {/* Ship */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kapal Armada <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={shipName}
                    onChange={(e) => {
                      const selected = ships.find((s) => s.name === e.target.value);
                      setShipName(e.target.value);
                      if (selected) setShipId(selected.id);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  >
                    <option value="">Pilih Kapal...</option>
                    {ships.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                  {formErrors.shipName && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.shipName}</p>
                  )}
                </div>

                {/* Origin */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pelabuhan Asal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={originPort}
                    onChange={(e) => setOriginPort(e.target.value)}
                    placeholder="Contoh: Pelabuhan Tanjung Priok (Jakarta)"
                    className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.originPort ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  />
                  {formErrors.originPort && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.originPort}</p>
                  )}
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pelabuhan Tujuan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={destinationPort}
                    onChange={(e) => setDestinationPort(e.target.value)}
                    placeholder="Contoh: Pelabuhan Belawan (Medan)"
                    className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.destinationPort ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  />
                  {formErrors.destinationPort && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.destinationPort}</p>
                  )}
                </div>

                {/* Departure Time */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Waktu Keberangkatan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    placeholder="2026-10-02 08:30 WIB"
                    className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.departureTime ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  />
                  {formErrors.departureTime && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.departureTime}</p>
                  )}
                </div>

                {/* Arrival Time */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimasi Waktu Tiba <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    placeholder="2026-10-03 14:00 WITA"
                    className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.arrivalTime ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  />
                  {formErrors.arrivalTime && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.arrivalTime}</p>
                  )}
                </div>

                {/* Status */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Operasional Pelayaran <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as VoyageStatus)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  >
                    {VOYAGE_STATUSES.map((st) => (
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
                  <span>{editingVoyage ? 'Simpan Perubahan' : 'Jadwalkan Pelayaran'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete modal */}
      <ConfirmModal
        isOpen={!!voyageToDelete}
        title="Konfirmasi Hapus Jadwal"
        message={`Apakah Anda yakin ingin menghapus jadwal pelayaran "${voyageToDelete?.voyageNumber}" (${voyageToDelete?.shipName})? Data akan dihapus dari Firebase.`}
        confirmLabel="Hapus Jadwal"
        cancelLabel="Batal"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setVoyageToDelete(null)}
      />
    </div>
  );
};
