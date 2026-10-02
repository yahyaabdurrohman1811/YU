import React, { useState } from 'react';
import { Cargo, CargoCategory, CargoStatus, Ship, Voyage } from '../types';
import { addCargo, updateCargo, deleteCargo } from '../services/portService';
import { useToast } from './Toast';
import { ConfirmModal } from './ConfirmModal';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  Car,
  Container,
  AlertTriangle,
  FileText,
  Weight,
  Layers,
} from 'lucide-react';

interface CargoManagementProps {
  cargos: Cargo[];
  ships: Ship[];
  voyages: Voyage[];
  onPrintManifest?: (cargoList: Cargo[]) => void;
}

const CARGO_CATEGORIES: CargoCategory[] = [
  'Kendaraan Roda 2',
  'Kendaraan Roda 4 (Mobil Pribadi)',
  'Truk / Alat Berat',
  'Kontainer 20ft',
  'Kontainer 40ft',
  'Kargo Umum (General Cargo)',
  'Bahan Pokok / Logistik Dingin',
];

interface FormErrors {
  manifestNumber?: string;
  shipName?: string;
  senderName?: string;
  receiverName?: string;
  cargoCategory?: string;
  description?: string;
  weightKg?: string;
  deckLocation?: string;
  vehiclePlateNumber?: string;
}

export const CargoManagement: React.FC<CargoManagementProps> = ({
  cargos,
  ships,
  voyages,
  onPrintManifest,
}) => {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedShipFilter, setSelectedShipFilter] = useState<string>('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [cargoToDelete, setCargoToDelete] = useState<Cargo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [manifestNumber, setManifestNumber] = useState('');
  const [shipName, setShipName] = useState('');
  const [voyageId, setVoyageId] = useState('');
  const [senderName, setSenderName] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [cargoCategory, setCargoCategory] = useState<CargoCategory>('Kargo Umum (General Cargo)');
  const [description, setDescription] = useState('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [volumeM3, setVolumeM3] = useState<string>('');
  const [hazardous, setHazardous] = useState(false);
  const [deckLocation, setDeckLocation] = useState('');
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState('');
  const [status, setStatus] = useState<CargoStatus>('Menunggu Muat');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const isVehicle =
    cargoCategory === 'Kendaraan Roda 2' ||
    cargoCategory === 'Kendaraan Roda 4 (Mobil Pribadi)' ||
    cargoCategory === 'Truk / Alat Berat';

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingCargo(null);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setManifestNumber(`MFT-${new Date().getFullYear()}-${randomSuffix}`);
    setShipName(ships.length > 0 ? ships[0].name : '');
    setVoyageId(voyages.length > 0 ? voyages[0].id : '');
    setSenderName('');
    setReceiverName('');
    setCargoCategory('Kargo Umum (General Cargo)');
    setDescription('');
    setWeightKg('');
    setVolumeM3('');
    setHazardous(false);
    setDeckLocation('Dek Utama Slot A-01');
    setVehiclePlateNumber('');
    setStatus('Menunggu Muat');
    setNotes('');
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (cargo: Cargo) => {
    setEditingCargo(cargo);
    setManifestNumber(cargo.manifestNumber);
    setShipName(cargo.shipName);
    setVoyageId(cargo.voyageId || '');
    setSenderName(cargo.senderName);
    setReceiverName(cargo.receiverName);
    setCargoCategory(cargo.cargoCategory);
    setDescription(cargo.description);
    setWeightKg(String(cargo.weightKg));
    setVolumeM3(cargo.volumeM3 ? String(cargo.volumeM3) : '');
    setHazardous(!!cargo.hazardous);
    setDeckLocation(cargo.deckLocation);
    setVehiclePlateNumber(cargo.vehiclePlateNumber || '');
    setStatus(cargo.status);
    setNotes(cargo.notes || '');
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Strict Validation
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!manifestNumber.trim()) {
      errors.manifestNumber = 'Nomor Manifest / B/L wajib diisi';
    } else if (manifestNumber.trim().length < 3) {
      errors.manifestNumber = 'Nomor Manifest minimal 3 karakter';
    }

    if (!shipName.trim()) {
      errors.shipName = 'Pilih kapal pengangkut';
    }

    if (!senderName.trim()) {
      errors.senderName = 'Nama pengirim (Shipper) wajib diisi';
    } else if (senderName.trim().length < 2) {
      errors.senderName = 'Nama pengirim minimal 2 karakter';
    }

    if (!receiverName.trim()) {
      errors.receiverName = 'Nama penerima (Consignee) wajib diisi';
    } else if (receiverName.trim().length < 2) {
      errors.receiverName = 'Nama penerima minimal 2 karakter';
    }

    if (!description.trim()) {
      errors.description = 'Deskripsi muatan barang wajib diisi';
    } else if (description.trim().length < 3) {
      errors.description = 'Deskripsi minimal 3 karakter';
    }

    const weightNum = parseFloat(weightKg);
    if (!weightKg || isNaN(weightNum) || weightNum <= 0) {
      errors.weightKg = 'Berat muatan harus berupa angka positif (Kg)';
    }

    if (!deckLocation.trim()) {
      errors.deckLocation = 'Posisi Dek atau Slot muatan wajib diisi';
    }

    if (isVehicle && !vehiclePlateNumber.trim()) {
      errors.vehiclePlateNumber = 'Nomor Plat Kendaraan wajib diisi untuk kategori kendaraan';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Create or Update
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('warning', 'Validasi Gagal', 'Harap lengkapi semua kolom bertanda wajib dengan benar');
      return;
    }

    setIsSubmitting(true);
    const weightNum = parseFloat(weightKg);
    const volNum = volumeM3 ? parseFloat(volumeM3) : undefined;

    try {
      if (editingCargo) {
        // UPDATE
        await updateCargo(editingCargo.id, {
          manifestNumber: manifestNumber.trim(),
          shipName: shipName.trim(),
          voyageId: voyageId || undefined,
          senderName: senderName.trim(),
          receiverName: receiverName.trim(),
          cargoCategory,
          description: description.trim(),
          weightKg: weightNum,
          volumeM3: volNum,
          hazardous,
          deckLocation: deckLocation.trim(),
          vehiclePlateNumber: isVehicle ? vehiclePlateNumber.trim().toUpperCase() : '',
          status,
          notes: notes.trim(),
        });
        showToast('success', 'Kargo Diperbarui', `Data manifest ${manifestNumber} berhasil disimpan di Firestore`);
      } else {
        // CREATE
        await addCargo({
          manifestNumber: manifestNumber.trim(),
          shipName: shipName.trim(),
          voyageId: voyageId || undefined,
          senderName: senderName.trim(),
          receiverName: receiverName.trim(),
          cargoCategory,
          description: description.trim(),
          weightKg: weightNum,
          volumeM3: volNum,
          hazardous,
          deckLocation: deckLocation.trim(),
          vehiclePlateNumber: isVehicle ? vehiclePlateNumber.trim().toUpperCase() : '',
          status,
          notes: notes.trim(),
        });
        showToast('success', 'Kargo Ditambahkan', `Muatan baru ${manifestNumber} berhasil tersimpan di Firestore`);
      }
      setIsModalOpen(false);
    } catch {
      showToast('error', 'Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan ke database Firestore');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Status update from table
  const handleQuickStatusChange = async (cargo: Cargo, nextStatus: CargoStatus) => {
    try {
      await updateCargo(cargo.id, { status: nextStatus });
      showToast('success', 'Status Berubah', `Status ${cargo.manifestNumber} diubah ke '${nextStatus}'`);
    } catch {
      showToast('error', 'Gagal Ubah Status', 'Terjadi kesalahan saat memperbarui status di Firestore');
    }
  };

  // Confirm and Execute Delete
  const handleConfirmDelete = async () => {
    if (!cargoToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCargo(cargoToDelete.id);
      showToast('success', 'Muatan Dihapus', `Data manifest ${cargoToDelete.manifestNumber} telah dihapus dari database`);
      setCargoToDelete(null);
    } catch {
      showToast('error', 'Gagal Menghapus', 'Tidak dapat menghapus kargo dari Firestore');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter cargos
  const filteredCargos = cargos.filter((item) => {
    const matchesSearch =
      item.manifestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.vehiclePlateNumber && item.vehiclePlateNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || item.cargoCategory === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    const matchesShip = selectedShipFilter === 'ALL' || item.shipName === selectedShipFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesShip;
  });

  const totalFilteredWeightKg = filteredCargos.reduce((sum, c) => sum + (c.weightKg || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header with Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Manifest Muatan Kapal & Logistik
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {filteredCargos.length} Item
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan muatan peti kemas, barang logistik, kendaraan roda 2/4, dan truk ekspedisi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onPrintManifest && (
            <button
              onClick={() => onPrintManifest(filteredCargos)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Cetak Manifest</span>
            </button>
          )}

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Muatan Kargo</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari B/L, Pengirim, Plat Kendaraan..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
            />
          </div>

          {/* Filter by Category */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition cursor-pointer"
            >
              <option value="ALL">Semua Kategori Muatan</option>
              {CARGO_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Ship */}
          <div className="relative">
            <select
              value={selectedShipFilter}
              onChange={(e) => setSelectedShipFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition cursor-pointer"
            >
              <option value="ALL">Semua Kapal Pengangkut</option>
              {ships.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition cursor-pointer"
            >
              <option value="ALL">Semua Status Muat</option>
              <option value="Menunggu Muat">Menunggu Muat</option>
              <option value="Termuat di Kapal">Termuat di Kapal</option>
              <option value="Selesai Bongkar">Selesai Bongkar</option>
            </select>
          </div>
        </div>

        {/* Aggregate subtotal */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Menampilkan <b>{filteredCargos.length}</b> dari {cargos.length} muatan
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">
              Total Tonase: <span className="text-blue-700 font-extrabold">{(totalFilteredWeightKg / 1000).toFixed(2)} Ton</span> ({totalFilteredWeightKg.toLocaleString('id-ID')} Kg)
            </span>
          </div>
        </div>
      </div>

      {/* Cargo Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">No. B/L Manifest</th>
                <th className="px-4 py-3.5">Kategori & Muatan</th>
                <th className="px-4 py-3.5">Kapal & Dek</th>
                <th className="px-4 py-3.5">Pengirim & Penerima</th>
                <th className="px-4 py-3.5">Berat / Tonase</th>
                <th className="px-4 py-3.5">Status Muatan</th>
                <th className="px-4 py-3.5 text-right">Aksi Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCargos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-sm text-slate-600">Belum ada muatan yang sesuai</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Klik "Tambah Muatan Kargo" untuk mendaftarkan barang baru ke Firestore.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCargos.map((cargo) => {
                  const isCargoVehicle =
                    cargo.cargoCategory.includes('Kendaraan') || cargo.cargoCategory.includes('Truk');

                  return (
                    <tr key={cargo.id} className="hover:bg-blue-50/30 transition">
                      {/* B/L */}
                      <td className="px-4 py-3.5">
                        <span className="font-extrabold text-blue-900 font-mono text-[13px]">
                          {cargo.manifestNumber}
                        </span>
                        {cargo.hazardous && (
                          <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3" /> DG
                          </span>
                        )}
                      </td>

                      {/* Category & Description */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {isCargoVehicle ? (
                            <Car className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          ) : cargo.cargoCategory.includes('Kontainer') ? (
                            <Container className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                          ) : (
                            <Package className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                          )}
                          <span className="font-semibold text-slate-800 line-clamp-1">
                            {cargo.description}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                            {cargo.cargoCategory}
                          </span>
                          {cargo.vehiclePlateNumber && (
                            <span className="font-mono font-bold text-slate-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                              {cargo.vehiclePlateNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Ship & Deck */}
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-800 block">{cargo.shipName}</span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Layers className="w-3 h-3 text-slate-400" />
                          {cargo.deckLocation}
                        </span>
                      </td>

                      {/* Shipper & Consignee */}
                      <td className="px-4 py-3.5">
                        <div className="text-[11px]">
                          <span className="text-slate-400">Dari: </span>
                          <span className="font-medium text-slate-700">{cargo.senderName}</span>
                        </div>
                        <div className="text-[11px]">
                          <span className="text-slate-400">Ke: </span>
                          <span className="font-medium text-slate-700">{cargo.receiverName}</span>
                        </div>
                      </td>

                      {/* Weight */}
                      <td className="px-4 py-3.5">
                        <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                          <Weight className="w-3.5 h-3.5 text-slate-400" />
                          {cargo.weightKg.toLocaleString('id-ID')} Kg
                        </div>
                        <span className="text-[11px] text-slate-400">
                          ({(cargo.weightKg / 1000).toFixed(2)} Ton)
                        </span>
                      </td>

                      {/* Status & Quick Toggle */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                              cargo.status === 'Termuat di Kapal'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : cargo.status === 'Selesai Bongkar'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {cargo.status === 'Termuat di Kapal' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Clock className="w-3 h-3 text-amber-600" />
                            )}
                            {cargo.status}
                          </span>
                        </div>

                        {/* Quick Action buttons */}
                        <div className="mt-1 flex items-center gap-1">
                          {cargo.status === 'Menunggu Muat' && (
                            <button
                              onClick={() => handleQuickStatusChange(cargo, 'Termuat di Kapal')}
                              className="text-[10px] text-emerald-700 hover:underline font-bold"
                            >
                              + Muat Sekarang
                            </button>
                          )}
                          {cargo.status === 'Termuat di Kapal' && (
                            <button
                              onClick={() => handleQuickStatusChange(cargo, 'Selesai Bongkar')}
                              className="text-[10px] text-indigo-700 hover:underline font-bold"
                            >
                              ✓ Selesai Bongkar
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(cargo)}
                            title="Edit Data Kargo"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setCargoToDelete(cargo)}
                            title="Hapus Kargo"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingCargo ? 'Edit Data Manifest Muatan' : 'Tambah Muatan Kargo Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Data disimpan persisten secara real-time ke Google Firebase Firestore
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
                {/* No Manifest */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor B/L / Manifest <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manifestNumber}
                    onChange={(e) => setManifestNumber(e.target.value)}
                    placeholder="MFT-2026-XXXX"
                    className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.manifestNumber
                        ? 'border-rose-400 bg-rose-50/50'
                        : 'border-slate-300'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  />
                  {formErrors.manifestNumber && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.manifestNumber}</p>
                  )}
                </div>

                {/* Pilih Kapal */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kapal Pengangkut <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={shipName}
                    onChange={(e) => setShipName(e.target.value)}
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

                {/* Pengirim */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Pengirim (Shipper) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="PT / Ekspedisi / Perorangan"
                    className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.senderName ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  />
                  {formErrors.senderName && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.senderName}</p>
                  )}
                </div>

                {/* Penerima */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Penerima (Consignee) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="CV / Toko / Penerima Barang"
                    className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.receiverName ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  />
                  {formErrors.receiverName && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.receiverName}</p>
                  )}
                </div>

                {/* Kategori Muatan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori Muatan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={cargoCategory}
                    onChange={(e) => setCargoCategory(e.target.value as CargoCategory)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  >
                    {CARGO_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Plat Nomor jika Kendaraan */}
                {isVehicle ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nomor Plat Kendaraan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={vehiclePlateNumber}
                      onChange={(e) => setVehiclePlateNumber(e.target.value)}
                      placeholder="Contoh: B 1234 ABC"
                      className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border ${
                        formErrors.vehiclePlateNumber
                          ? 'border-rose-400 bg-rose-50/50'
                          : 'border-slate-300'
                      } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 uppercase`}
                    />
                    {formErrors.vehiclePlateNumber && (
                      <p className="text-[11px] text-rose-600 mt-1">
                        {formErrors.vehiclePlateNumber}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Estimasi Volume (M³)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={volumeM3}
                      onChange={(e) => setVolumeM3(e.target.value)}
                      placeholder="Contoh: 15.5"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                )}

                {/* Bobot (Kg) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bobot / Berat (Kg) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="Contoh: 1500"
                    className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.weightKg ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  />
                  {formErrors.weightKg && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.weightKg}</p>
                  )}
                </div>

                {/* Posisi Dek / Slot */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Posisi Dek / Slot Muatan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={deckLocation}
                    onChange={(e) => setDeckLocation(e.target.value)}
                    placeholder="Contoh: Car Deck Slot B-04, Hold 2"
                    className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.deckLocation ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  />
                  {formErrors.deckLocation && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.deckLocation}</p>
                  )}
                </div>
              </div>

              {/* Deskripsi Barang */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Spesifikasi Muatan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: 200 Sak Semen Gresik, Rangka Besi Baja, dsb"
                  className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border ${
                    formErrors.description ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                  } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                />
                {formErrors.description && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.description}</p>
                )}
              </div>

              {/* Status & Dangerous Goods */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Muatan Saat Ini
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CargoStatus)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  >
                    <option value="Menunggu Muat">Menunggu Muat</option>
                    <option value="Termuat di Kapal">Termuat di Kapal</option>
                    <option value="Selesai Bongkar">Selesai Bongkar</option>
                  </select>
                </div>

                <div className="pt-4 flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hazardous}
                      onChange={(e) => setHazardous(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                    />
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Barang Berbahaya (Dangerous Goods / DG)
                    </span>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Tambahan / Instruksi Penanganan
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Suhu berpendingin, ikatan lashing ekstra tebal"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Buttons */}
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
                  <span>{editingCargo ? 'Simpan Perubahan' : 'Daftarkan Muatan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={!!cargoToDelete}
        title="Konfirmasi Hapus Data Muatan"
        message={`Apakah Anda yakin ingin menghapus manifest muatan B/L "${cargoToDelete?.manifestNumber}" (${cargoToDelete?.description})? Data akan dihapus secara permanen dari Firebase.`}
        confirmLabel="Hapus Muatan"
        cancelLabel="Batal"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setCargoToDelete(null)}
      />
    </div>
  );
};
