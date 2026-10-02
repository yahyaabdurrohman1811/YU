export type ShipType = 
  | 'Kapal Feri Ro-Ro' 
  | 'Kapal Penumpang (Pelni)' 
  | 'Kapal Kargo Kontainer' 
  | 'Kapal Cepat Express';

export type ShipStatus = 
  | 'Bersandar (Berthing)' 
  | 'Bongkar Muat (Loading/Unloading)' 
  | 'Berlayar (Sailing)' 
  | 'Perawatan (Maintenance)';

export interface Ship {
  id: string;
  name: string;
  code: string; // IMO / Call Sign
  type: ShipType;
  capacityPassengers: number;
  capacityCargoTons: number;
  captainName: string;
  status: ShipStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type VoyageStatus = 'Jadwal' | 'Boarding' | 'Berlayar' | 'Tiba' | 'Selesai';

export interface Voyage {
  id: string;
  shipId?: string;
  shipName: string;
  voyageNumber: string;
  originPort: string;
  destinationPort: string;
  departureTime: string;
  arrivalTime: string;
  status: VoyageStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type Gender = 'Laki-laki' | 'Perempuan';
export type TicketClass = 'Ekonomi' | 'Bisnis' | 'VIP / Kelas 1';
export type PassengerCheckInStatus = 'Terdaftar' | 'Boarding / Sudah Naik' | 'Batal';

export interface Passenger {
  id: string;
  voyageId?: string;
  shipName: string;
  ticketNumber: string;
  fullName: string;
  identityNumber: string; // NIK / Paspor
  gender: Gender;
  age: number;
  ticketClass: TicketClass;
  seatCabinNumber: string;
  destinationPort: string;
  baggageWeightKg: number;
  checkInStatus: PassengerCheckInStatus;
  contactPhone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CargoCategory = 
  | 'Kendaraan Roda 2' 
  | 'Kendaraan Roda 4 (Mobil Pribadi)' 
  | 'Truk / Alat Berat' 
  | 'Kontainer 20ft' 
  | 'Kontainer 40ft' 
  | 'Kargo Umum (General Cargo)' 
  | 'Bahan Pokok / Logistik Dingin';

export type CargoStatus = 'Menunggu Muat' | 'Termuat di Kapal' | 'Selesai Bongkar';

export interface Cargo {
  id: string;
  voyageId?: string;
  shipName: string;
  manifestNumber: string; // B/L No
  senderName: string;
  receiverName: string;
  cargoCategory: CargoCategory;
  description: string;
  weightKg: number;
  volumeM3?: number;
  hazardous?: boolean;
  deckLocation: string;
  vehiclePlateNumber?: string;
  status: CargoStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'petugas' | 'syahbandar';
}
