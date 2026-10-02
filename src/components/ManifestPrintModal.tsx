import React from 'react';
import { Cargo, Passenger } from '../types';
import { Printer, X, Anchor, CheckCircle2 } from 'lucide-react';

interface ManifestPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'cargo' | 'passenger';
  cargoList?: Cargo[];
  passengerList?: Passenger[];
}

export const ManifestPrintModal: React.FC<ManifestPrintModalProps> = ({
  isOpen,
  onClose,
  type,
  cargoList = [],
  passengerList = [],
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const totalCargoKg = cargoList.reduce((sum, c) => sum + (c.weightKg || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 my-6">
        {/* Top actions toolbar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">
              Pratinjau Dokumen Cetak Manifest Resmi
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              Standar Otoritas Maritim
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-8 bg-white text-slate-900 font-sans print:p-0">
          {/* Header Kop Surat Pelabuhan */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center relative">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Anchor className="w-8 h-8 text-blue-900" />
              <div className="text-center">
                <h1 className="text-lg font-black tracking-wider uppercase text-slate-900">
                  REPUBLIK INDONESIA - KEMENTERIAN PERHUBUNGAN
                </h1>
                <h2 className="text-sm font-bold text-slate-700 uppercase">
                  DIREKTORAT JENDERAL PERHUBUNGAN LAUT - KANTOR KESYAHBANDARAN DAN OTORITAS PELABUHAN
                </h2>
                <p className="text-[11px] text-slate-500">
                  Sistem Informasi Manifest Muatan & Penumpang Kapal Laut Terintegrasi
                </p>
              </div>
            </div>
            <div className="text-xs font-bold uppercase tracking-widest bg-slate-100 py-1 mt-2 border border-slate-300">
              {type === 'cargo'
                ? 'SURAT MANIFEST MUATAN KAPAL (CARGO & VEHICLE MANIFEST)'
                : 'SURAT MANIFEST PENUMPANG KAPAL (PASSENGER LIST MANIFEST)'}
            </div>
          </div>

          {/* Metadata Row */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <p>
                <span className="text-slate-500 font-medium">Tanggal Cetak:</span>{' '}
                <span className="font-bold">{currentDate}</span>
              </p>
              <p className="mt-1">
                <span className="text-slate-500 font-medium">Status Dokumen:</span>{' '}
                <span className="font-bold text-emerald-700">Tervalidasi Sistem Persisten</span>
              </p>
            </div>
            <div className="text-right">
              <p>
                <span className="text-slate-500 font-medium">Total Item Manifest:</span>{' '}
                <span className="font-bold">
                  {type === 'cargo' ? `${cargoList.length} Muatan` : `${passengerList.length} Jiwa`}
                </span>
              </p>
              {type === 'cargo' && (
                <p className="mt-1">
                  <span className="text-slate-500 font-medium">Total Berat Tonase:</span>{' '}
                  <span className="font-bold text-blue-900">
                    {(totalCargoKg / 1000).toFixed(2)} Ton ({totalCargoKg.toLocaleString('id-ID')} Kg)
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Table Content */}
          {type === 'cargo' ? (
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 font-bold border-b border-slate-300 text-[11px]">
                <tr>
                  <th className="p-2 border-r border-slate-300">No. B/L</th>
                  <th className="p-2 border-r border-slate-300">Kapal</th>
                  <th className="p-2 border-r border-slate-300">Kategori & Uraian Muatan</th>
                  <th className="p-2 border-r border-slate-300">Pengirim / Penerima</th>
                  <th className="p-2 border-r border-slate-300">Berat (Kg)</th>
                  <th className="p-2 border-r border-slate-300">Dek/Slot</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {cargoList.map((cargo, idx) => (
                  <tr key={cargo.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-2 border-r border-slate-300 font-mono font-bold">
                      {cargo.manifestNumber}
                    </td>
                    <td className="p-2 border-r border-slate-300 font-medium">{cargo.shipName}</td>
                    <td className="p-2 border-r border-slate-300">
                      <span className="font-bold block">{cargo.description}</span>
                      <span className="text-[10px] text-slate-500">
                        {cargo.cargoCategory}{' '}
                        {cargo.vehiclePlateNumber ? `[Plat: ${cargo.vehiclePlateNumber}]` : ''}
                      </span>
                    </td>
                    <td className="p-2 border-r border-slate-300 text-[11px]">
                      <div>Dari: {cargo.senderName}</div>
                      <div>Ke: {cargo.receiverName}</div>
                    </td>
                    <td className="p-2 border-r border-slate-300 font-bold">
                      {cargo.weightKg.toLocaleString('id-ID')}
                    </td>
                    <td className="p-2 border-r border-slate-300">{cargo.deckLocation}</td>
                    <td className="p-2 font-semibold text-emerald-800">{cargo.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 font-bold border-b border-slate-300 text-[11px]">
                <tr>
                  <th className="p-2 border-r border-slate-300">No. Tiket</th>
                  <th className="p-2 border-r border-slate-300">Nama Penumpang</th>
                  <th className="p-2 border-r border-slate-300">NIK / Identitas</th>
                  <th className="p-2 border-r border-slate-300">Kapal</th>
                  <th className="p-2 border-r border-slate-300">Kabin / Kelas</th>
                  <th className="p-2 border-r border-slate-300">Tujuan</th>
                  <th className="p-2 border-r border-slate-300">Bagasi (Kg)</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {passengerList.map((p, idx) => (
                  <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-2 border-r border-slate-300 font-mono font-bold">
                      {p.ticketNumber}
                    </td>
                    <td className="p-2 border-r border-slate-300 font-bold">{p.fullName}</td>
                    <td className="p-2 border-r border-slate-300 font-mono text-[11px]">
                      {p.identityNumber}
                    </td>
                    <td className="p-2 border-r border-slate-300">{p.shipName}</td>
                    <td className="p-2 border-r border-slate-300">
                      {p.seatCabinNumber} ({p.ticketClass})
                    </td>
                    <td className="p-2 border-r border-slate-300">{p.destinationPort}</td>
                    <td className="p-2 border-r border-slate-300">{p.baggageWeightKg || 0}</td>
                    <td className="p-2 font-semibold text-blue-800">{p.checkInStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Signature block */}
          <div className="mt-12 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="text-slate-500">Petugas Operasional Pelabuhan</p>
              <div className="h-16 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 opacity-80" />
              </div>
              <p className="font-bold border-t border-slate-300 pt-1">
                ( Petugas Manifest & Kargo )
              </p>
              <p className="text-[10px] text-slate-400">NIP. 19850412 201001 1 004</p>
            </div>

            <div>
              <p className="text-slate-500">Mengetahui, Syahbandar / Harbor Master</p>
              <div className="h-16 flex items-center justify-center">
                <Anchor className="w-8 h-8 text-blue-800 opacity-80" />
              </div>
              <p className="font-bold border-t border-slate-300 pt-1">
                ( Capt. Teguh Wibowo, M.Mar )
              </p>
              <p className="text-[10px] text-slate-400">Otoritas Pelabuhan & Keselamatan Pelayaran</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
