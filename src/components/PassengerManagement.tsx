import React, { useState } from 'react';
import { Passenger, Ship, Voyage, Gender, TicketClass, PassengerCheckInStatus } from '../types';
import { addPassenger, updatePassenger, deletePassenger } from '../services/portService';
import { useToast } from './Toast';
import { ConfirmModal } from './ConfirmModal';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Ban,
  FileText,
  UserCheck,
  Phone,
  Luggage,
} from 'lucide-react';

interface PassengerManagementProps {
  passengers: Passenger[];
  ships: Ship[];
  voyages: Voyage[];
  onPrintBoarding?: (passengers: Passenger[]) => void;
}

interface PassengerFormErrors {
  fullName?: string;
  identityNumber?: string;
  ticketNumber?: string;
  shipName?: string;
  age?: string;
  seatCabinNumber?: string;
  destinationPort?: string;
  baggageWeightKg?: string;
  contactPhone?: string;
}

export const PassengerManagement: React.FC<PassengerManagementProps> = ({
  passengers,
  ships,
  voyages,
  onPrintBoarding,
}) => {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedShipFilter, setSelectedShipFilter] = useState<string>('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal
  const [passengerToDelete, setPassengerToDelete] = useState<Passenger | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [shipName, setShipName] = useState('');
  const [voyageId, setVoyageId] = useState('');
  const [gender, setGender] = useState<Gender>('Laki-laki');
  const [age, setAge] = useState<string>('30');
  const [ticketClass, setTicketClass] = useState<TicketClass>('Ekonomi');
  const [seatCabinNumber, setSeatCabinNumber] = useState('');
  const [destinationPort, setDestinationPort] = useState('');
  const [baggageWeightKg, setBaggageWeightKg] = useState<string>('10');
  const [checkInStatus, setCheckInStatus] = useState<PassengerCheckInStatus>('Terdaftar');
  const [contactPhone, setContactPhone] = useState('');
  const [formErrors, setFormErrors] = useState<PassengerFormErrors>({});

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingPassenger(null);
    const randomTicket = Math.floor(10000 + Math.random() * 90000);
    setTicketNumber(`TKT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${randomTicket}`);
    setFullName('');
    setIdentityNumber('');
    setShipName(ships.length > 0 ? ships[0].name : '');
    setVoyageId(voyages.length > 0 ? voyages[0].id : '');
    setGender('Laki-laki');
    setAge('28');
    setTicketClass('Ekonomi');
    setSeatCabinNumber('KBN-01');
    setDestinationPort(voyages.length > 0 ? voyages[0].destinationPort : 'Makassar');
    setBaggageWeightKg('10');
    setCheckInStatus('Terdaftar');
    setContactPhone('');
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (p: Passenger) => {
    setEditingPassenger(p);
    setTicketNumber(p.ticketNumber);
    setFullName(p.fullName);
    setIdentityNumber(p.identityNumber);
    setShipName(p.shipName);
    setVoyageId(p.voyageId || '');
    setGender(p.gender);
    setAge(String(p.age));
    setTicketClass(p.ticketClass);
    setSeatCabinNumber(p.seatCabinNumber);
    setDestinationPort(p.destinationPort);
    setBaggageWeightKg(String(p.baggageWeightKg || 0));
    setCheckInStatus(p.checkInStatus);
    setContactPhone(p.contactPhone || '');
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Strict Validation
  const validateForm = (): boolean => {
    const errors: PassengerFormErrors = {};

    if (!fullName.trim()) {
      errors.fullName = 'Nama lengkap penumpang wajib diisi';
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'Nama penumpang minimal 2 karakter';
    }

    if (!identityNumber.trim()) {
      errors.identityNumber = 'Nomor NIK / Identitas KTP wajib diisi';
    } else if (identityNumber.trim().length < 8) {
      errors.identityNumber = 'Format NIK/Identitas minimal 8 karakter (standar 16 digit)';
    }

    if (!ticketNumber.trim()) {
      errors.ticketNumber = 'Nomor Tiket wajib diisi';
    }

    if (!shipName.trim()) {
      errors.shipName = 'Pilih kapal tujuan';
    }

    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      errors.age = 'Usia harus berupa angka 0 - 120 tahun';
    }

    if (!seatCabinNumber.trim()) {
      errors.seatCabinNumber = 'Nomor Kabin / Kursi wajib diisi';
    }

    if (!destinationPort.trim()) {
      errors.destinationPort = 'Pelabuhan tujuan wajib diisi';
    }

    const baggageNum = parseFloat(baggageWeightKg);
    if (isNaN(baggageNum) || baggageNum < 0) {
      errors.baggageWeightKg = 'Berat bagasi tidak boleh negatif';
    }

    if (contactPhone.trim() && contactPhone.trim().length < 8) {
      errors.contactPhone = 'Nomor telepon kontak minimal 8 digit';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('warning', 'Validasi Gagal', 'Harap periksa kolom yang ditandai merah');
      return;
    }

    setIsSubmitting(true);
    const ageNum = parseInt(age, 10);
    const baggageNum = parseFloat(baggageWeightKg) || 0;

    try {
      if (editingPassenger) {
        // UPDATE
        await updatePassenger(editingPassenger.id, {
          fullName: fullName.trim(),
          identityNumber: identityNumber.trim(),
          ticketNumber: ticketNumber.trim(),
          shipName: shipName.trim(),
          voyageId: voyageId || undefined,
          gender,
          age: ageNum,
          ticketClass,
          seatCabinNumber: seatCabinNumber.trim(),
          destinationPort: destinationPort.trim(),
          baggageWeightKg: baggageNum,
          checkInStatus,
          contactPhone: contactPhone.trim(),
        });
        showToast('success', 'Penumpang Diperbarui', `Data ${fullName} berhasil disimpan di Firestore`);
      } else {
        // CREATE
        await addPassenger({
          fullName: fullName.trim(),
          identityNumber: identityNumber.trim(),
          ticketNumber: ticketNumber.trim(),
          shipName: shipName.trim(),
          voyageId: voyageId || undefined,
          gender,
          age: ageNum,
          ticketClass,
          seatCabinNumber: seatCabinNumber.trim(),
          destinationPort: destinationPort.trim(),
          baggageWeightKg: baggageNum,
          checkInStatus,
          contactPhone: contactPhone.trim(),
        });
        showToast('success', 'Penumpang Terdaftar', `Manifest ${fullName} berhasil ditambahkan ke Firestore`);
      }
      setIsModalOpen(false);
    } catch {
      showToast('error', 'Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan data ke Firebase');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Boarding Status Toggle
  const handleToggleBoarding = async (p: Passenger) => {
    const nextStatus: PassengerCheckInStatus =
      p.checkInStatus === 'Boarding / Sudah Naik' ? 'Terdaftar' : 'Boarding / Sudah Naik';

    try {
      await updatePassenger(p.id, { checkInStatus: nextStatus });
      showToast('success', 'Status Boarding Diperbarui', `${p.fullName} sekarang berstatus '${nextStatus}'`);
    } catch {
      showToast('error', 'Gagal Ubah Status', 'Terjadi kendala saat update ke Firestore');
    }
  };

  // Delete passenger
  const handleConfirmDelete = async () => {
    if (!passengerToDelete) return;
    setIsDeleting(true);
    try {
      await deletePassenger(passengerToDelete.id);
      showToast('success', 'Penumpang Dihapus', `Data tiket ${passengerToDelete.ticketNumber} telah dihapus dari database`);
      setPassengerToDelete(null);
    } catch {
      showToast('error', 'Gagal Menghapus', 'Tidak dapat menghapus data dari Firestore');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter passengers
  const filteredPassengers = passengers.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.identityNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.seatCabinNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = selectedClass === 'ALL' || p.ticketClass === selectedClass;
    const matchesStatus = selectedStatus === 'ALL' || p.checkInStatus === selectedStatus;
    const matchesShip = selectedShipFilter === 'ALL' || p.shipName === selectedShipFilter;

    return matchesSearch && matchesClass && matchesStatus && matchesShip;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Manifest Penumpang Kapal Laut
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
              {filteredPassengers.length} Penumpang
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data identitas tiket penumpang, nomor NIK KTP, alokasi kabin/kursi, dan verifikasi status boarding.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onPrintBoarding && (
            <button
              onClick={() => onPrintBoarding(filteredPassengers)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Cetak Manifest Penumpang</span>
            </button>
          )}

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Penumpang Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Nama, No Tiket, NIK KTP..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
            />
          </div>

          {/* Class */}
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition cursor-pointer"
            >
              <option value="ALL">Semua Kelas Tiket</option>
              <option value="Ekonomi">Ekonomi</option>
              <option value="Bisnis">Bisnis</option>
              <option value="VIP / Kelas 1">VIP / Kelas 1</option>
            </select>
          </div>

          {/* Ship */}
          <div className="relative">
            <select
              value={selectedShipFilter}
              onChange={(e) => setSelectedShipFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition cursor-pointer"
            >
              <option value="ALL">Semua Kapal Penyeberangan</option>
              {ships.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition cursor-pointer"
            >
              <option value="ALL">Semua Status Boarding</option>
              <option value="Boarding / Sudah Naik">Sudah Boarding</option>
              <option value="Terdaftar">Terdaftar (Belum Naik)</option>
              <option value="Batal">Batal Berangkat</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Menampilkan <b>{filteredPassengers.length}</b> dari {passengers.length} manifest
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-700 font-semibold">
              Boarded: {passengers.filter((p) => p.checkInStatus === 'Boarding / Sudah Naik').length}
            </span>
            <span>•</span>
            <span className="text-blue-700 font-semibold">
              Belum Naik: {passengers.filter((p) => p.checkInStatus === 'Terdaftar').length}
            </span>
          </div>
        </div>
      </div>

      {/* Passenger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">No. Tiket</th>
                <th className="px-4 py-3.5">Nama & NIK</th>
                <th className="px-4 py-3.5">Kelas & Kabin</th>
                <th className="px-4 py-3.5">Kapal & Tujuan</th>
                <th className="px-4 py-3.5">Bagasi & Kontak</th>
                <th className="px-4 py-3.5">Status Boarding</th>
                <th className="px-4 py-3.5 text-right">Aksi Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPassengers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-sm text-slate-600">Tidak ada penumpang yang sesuai</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Klik "Tambah Penumpang Baru" untuk mendaftarkan manifest.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPassengers.map((p) => (
                  <tr key={p.id} className="hover:bg-sky-50/30 transition">
                    {/* Ticket */}
                    <td className="px-4 py-3.5">
                      <span className="font-extrabold text-blue-900 font-mono text-[13px]">
                        {p.ticketNumber}
                      </span>
                    </td>

                    {/* Full Name & NIK */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-sm">{p.fullName}</span>
                        <span className="text-[10px] text-slate-500">
                          ({p.gender === 'Laki-laki' ? 'L' : 'P'}, {p.age} th)
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500 tracking-wide">
                        NIK: {p.identityNumber}
                      </span>
                    </td>

                    {/* Class & Seat */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.ticketClass === 'VIP / Kelas 1'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : p.ticketClass === 'Bisnis'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {p.ticketClass}
                      </span>
                      <span className="block font-semibold text-slate-800 text-[11px] mt-0.5">
                        Kabin: {p.seatCabinNumber}
                      </span>
                    </td>

                    {/* Ship & Destination */}
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-800 block">{p.shipName}</span>
                      <span className="text-[11px] text-slate-500">
                        Tujuan: <span className="font-medium text-slate-700">{p.destinationPort}</span>
                      </span>
                    </td>

                    {/* Baggage & Phone */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-700">
                        <Luggage className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.baggageWeightKg || 0} Kg Bagasi</span>
                      </div>
                      {p.contactPhone && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{p.contactPhone}</span>
                        </div>
                      )}
                    </td>

                    {/* Boarding Status & Quick Boarding Check-in */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleBoarding(p)}
                        title="Klik untuk mengubah status boarding"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition cursor-pointer ${
                          p.checkInStatus === 'Boarding / Sudah Naik'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : p.checkInStatus === 'Batal'
                            ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                            : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                        }`}
                      >
                        {p.checkInStatus === 'Boarding / Sudah Naik' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : p.checkInStatus === 'Batal' ? (
                          <Ban className="w-3.5 h-3.5 text-rose-600" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                        )}
                        <span>{p.checkInStatus}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          title="Edit Manifest Penumpang"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPassengerToDelete(p)}
                          title="Hapus Penumpang"
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

      {/* CREATE / EDIT PASSENGER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingPassenger ? 'Edit Manifest Penumpang' : 'Tambah Penumpang Baru'}
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
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Penumpang <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sesuai KTP / Paspor"
                    className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.fullName ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  />
                  {formErrors.fullName && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                {/* NIK Identitas */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor NIK KTP / Identitas <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={identityNumber}
                    onChange={(e) => setIdentityNumber(e.target.value)}
                    placeholder="Contoh: 3578015502900003"
                    className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.identityNumber
                        ? 'border-rose-400 bg-rose-50/50'
                        : 'border-slate-300'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  />
                  {formErrors.identityNumber && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.identityNumber}</p>
                  )}
                </div>

                {/* Ticket Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Tiket <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                    placeholder="TKT-202610-001"
                    className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.ticketNumber ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  />
                  {formErrors.ticketNumber && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.ticketNumber}</p>
                  )}
                </div>

                {/* Pilih Kapal */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kapal Yang Ditumpangi <span className="text-rose-500">*</span>
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

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Kelamin <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Usia Penumpang (Tahun) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Contoh: 34"
                    className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.age ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  />
                  {formErrors.age && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.age}</p>
                  )}
                </div>

                {/* Ticket Class */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kelas Tiket <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={ticketClass}
                    onChange={(e) => setTicketClass(e.target.value as TicketClass)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  >
                    <option value="Ekonomi">Ekonomi</option>
                    <option value="Bisnis">Bisnis</option>
                    <option value="VIP / Kelas 1">VIP / Kelas 1</option>
                  </select>
                </div>

                {/* Seat / Cabin */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Kabin / Kursi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={seatCabinNumber}
                    onChange={(e) => setSeatCabinNumber(e.target.value)}
                    placeholder="Contoh: KBN-B08, DEK-4/B-14"
                    className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.seatCabinNumber
                        ? 'border-rose-400 bg-rose-50/50'
                        : 'border-slate-300'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  />
                  {formErrors.seatCabinNumber && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.seatCabinNumber}</p>
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
                    placeholder="Contoh: Makassar, Bakauheni, Surabaya"
                    className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border ${
                      formErrors.destinationPort
                        ? 'border-rose-400 bg-rose-50/50'
                        : 'border-slate-300'
                    } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  />
                  {formErrors.destinationPort && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.destinationPort}</p>
                  )}
                </div>

                {/* Baggage */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Berat Bagasi (Kg)
                  </label>
                  <input
                    type="number"
                    value={baggageWeightKg}
                    onChange={(e) => setBaggageWeightKg(e.target.value)}
                    placeholder="Contoh: 15"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / HP Kontak
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Check-In / Boarding
                  </label>
                  <select
                    value={checkInStatus}
                    onChange={(e) => setCheckInStatus(e.target.value as PassengerCheckInStatus)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  >
                    <option value="Terdaftar">Terdaftar</option>
                    <option value="Boarding / Sudah Naik">Boarding / Sudah Naik</option>
                    <option value="Batal">Batal</option>
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
                  <span>{editingPassenger ? 'Simpan Perubahan' : 'Daftarkan Penumpang'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={!!passengerToDelete}
        title="Konfirmasi Hapus Penumpang"
        message={`Apakah Anda yakin ingin menghapus data manifest penumpang "${passengerToDelete?.fullName}" dengan tiket "${passengerToDelete?.ticketNumber}"? Data akan terhapus permanen dari Firebase.`}
        confirmLabel="Hapus Data"
        cancelLabel="Batal"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPassengerToDelete(null)}
      />
    </div>
  );
};
