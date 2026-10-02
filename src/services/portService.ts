import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Ship, Voyage, Passenger, Cargo } from '../types';

const SHIPS_COLLECTION = 'ships';
const VOYAGES_COLLECTION = 'voyages';
const PASSENGERS_COLLECTION = 'passengers';
const CARGOS_COLLECTION = 'cargos';

// ===================== SHIPS (ARMADA KAPAL) =====================

export function subscribeShips(
  onData: (ships: Ship[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    const q = query(collection(db, SHIPS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const ships: Ship[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        } as Ship));
        onData(ships);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, SHIPS_COLLECTION);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, SHIPS_COLLECTION);
    throw error;
  }
}

export async function addShip(data: Omit<Ship, 'id'>): Promise<string> {
  try {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, SHIPS_COLLECTION), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, SHIPS_COLLECTION);
    throw error;
  }
}

export async function updateShip(id: string, data: Partial<Omit<Ship, 'id'>>): Promise<void> {
  const path = `${SHIPS_COLLECTION}/${id}`;
  try {
    const docRef = doc(db, SHIPS_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export async function deleteShip(id: string): Promise<void> {
  const path = `${SHIPS_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, SHIPS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// ===================== VOYAGES (JADWAL PELAYARAN) =====================

export function subscribeVoyages(
  onData: (voyages: Voyage[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    const q = query(collection(db, VOYAGES_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const voyages: Voyage[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        } as Voyage));
        onData(voyages);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, VOYAGES_COLLECTION);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, VOYAGES_COLLECTION);
    throw error;
  }
}

export async function addVoyage(data: Omit<Voyage, 'id'>): Promise<string> {
  try {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, VOYAGES_COLLECTION), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, VOYAGES_COLLECTION);
    throw error;
  }
}

export async function updateVoyage(id: string, data: Partial<Omit<Voyage, 'id'>>): Promise<void> {
  const path = `${VOYAGES_COLLECTION}/${id}`;
  try {
    await updateDoc(doc(db, VOYAGES_COLLECTION, id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export async function deleteVoyage(id: string): Promise<void> {
  const path = `${VOYAGES_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, VOYAGES_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// ===================== PASSENGERS (MANIFEST PENUMPANG) =====================

export function subscribePassengers(
  onData: (passengers: Passenger[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    const q = query(collection(db, PASSENGERS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const passengers: Passenger[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        } as Passenger));
        onData(passengers);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, PASSENGERS_COLLECTION);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, PASSENGERS_COLLECTION);
    throw error;
  }
}

export async function addPassenger(data: Omit<Passenger, 'id'>): Promise<string> {
  try {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, PASSENGERS_COLLECTION), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, PASSENGERS_COLLECTION);
    throw error;
  }
}

export async function updatePassenger(id: string, data: Partial<Omit<Passenger, 'id'>>): Promise<void> {
  const path = `${PASSENGERS_COLLECTION}/${id}`;
  try {
    await updateDoc(doc(db, PASSENGERS_COLLECTION, id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export async function deletePassenger(id: string): Promise<void> {
  const path = `${PASSENGERS_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, PASSENGERS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// ===================== CARGO (MANIFEST MUATAN KAPAL) =====================

export function subscribeCargos(
  onData: (cargos: Cargo[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    const q = query(collection(db, CARGOS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const cargos: Cargo[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        } as Cargo));
        onData(cargos);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, CARGOS_COLLECTION);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, CARGOS_COLLECTION);
    throw error;
  }
}

export async function addCargo(data: Omit<Cargo, 'id'>): Promise<string> {
  try {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, CARGOS_COLLECTION), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, CARGOS_COLLECTION);
    throw error;
  }
}

export async function updateCargo(id: string, data: Partial<Omit<Cargo, 'id'>>): Promise<void> {
  const path = `${CARGOS_COLLECTION}/${id}`;
  try {
    await updateDoc(doc(db, CARGOS_COLLECTION, id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export async function deleteCargo(id: string): Promise<void> {
  const path = `${CARGOS_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, CARGOS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// ===================== SEED REALISTIC INITIAL DATA =====================
export async function seedInitialPortData(): Promise<void> {
  const shipsSnap = await getDocs(collection(db, SHIPS_COLLECTION));
  if (shipsSnap.size > 0) {
    return; // Already populated
  }

  // 1. Ships
  const ship1Id = await addShip({
    name: 'KM Kelimutu Nusantara',
    code: 'IMO-9138402',
    type: 'Kapal Penumpang (Pelni)',
    capacityPassengers: 920,
    capacityCargoTons: 1200,
    captainName: 'Capt. Bambang Suryono, M.Mar',
    status: 'Bersandar (Berthing)',
  });

  const ship2Id = await addShip({
    name: 'KMP Dharma Rucitra VII',
    code: 'IMO-8891230',
    type: 'Kapal Feri Ro-Ro',
    capacityPassengers: 650,
    capacityCargoTons: 3500,
    captainName: 'Capt. Hendra Wijaya',
    status: 'Bongkar Muat (Loading/Unloading)',
  });

  const ship3Id = await addShip({
    name: 'MV Meratus Java Star',
    code: 'IMO-9457811',
    type: 'Kapal Kargo Kontainer',
    capacityPassengers: 25,
    capacityCargoTons: 8500,
    captainName: 'Capt. Agus Riyadi, M.Mar',
    status: 'Berlayar (Sailing)',
  });

  // 2. Voyages
  const vyg1Id = await addVoyage({
    shipId: ship1Id,
    shipName: 'KM Kelimutu Nusantara',
    voyageNumber: 'VYG-PELNI-2026/041',
    originPort: 'Pelabuhan Tanjung Perak (Surabaya)',
    destinationPort: 'Pelabuhan Soekarno-Hatta (Makassar)',
    departureTime: '2026-10-02 08:30 WIB',
    arrivalTime: '2026-10-03 14:00 WITA',
    status: 'Boarding',
  });

  const vyg2Id = await addVoyage({
    shipId: ship2Id,
    shipName: 'KMP Dharma Rucitra VII',
    voyageNumber: 'VYG-ASDP-2026/108',
    originPort: 'Pelabuhan Merak (Banten)',
    destinationPort: 'Pelabuhan Bakauheni (Lampung)',
    departureTime: '2026-10-02 11:00 WIB',
    arrivalTime: '2026-10-02 13:30 WIB',
    status: 'Jadwal',
  });

  // 3. Sample Passengers
  await addPassenger({
    voyageId: vyg1Id,
    shipName: 'KM Kelimutu Nusantara',
    ticketNumber: 'TKT-202610-001',
    fullName: 'Siti Rahmawati',
    identityNumber: '3578015502900003',
    gender: 'Perempuan',
    age: 34,
    ticketClass: 'Bisnis',
    seatCabinNumber: 'KBN-B08',
    destinationPort: 'Makassar',
    baggageWeightKg: 18,
    checkInStatus: 'Boarding / Sudah Naik',
    contactPhone: '081234567890',
  });

  await addPassenger({
    voyageId: vyg1Id,
    shipName: 'KM Kelimutu Nusantara',
    ticketNumber: 'TKT-202610-002',
    fullName: 'Ahmad Fauzan',
    identityNumber: '3171052309850001',
    gender: 'Laki-laki',
    age: 41,
    ticketClass: 'Ekonomi',
    seatCabinNumber: 'DEK-4/B-14',
    destinationPort: 'Makassar',
    baggageWeightKg: 12,
    checkInStatus: 'Terdaftar',
    contactPhone: '085712345678',
  });

  await addPassenger({
    voyageId: vyg2Id,
    shipName: 'KMP Dharma Rucitra VII',
    ticketNumber: 'TKT-202610-003',
    fullName: 'Budi Santoso',
    identityNumber: '3201041208920005',
    gender: 'Laki-laki',
    age: 32,
    ticketClass: 'VIP / Kelas 1',
    seatCabinNumber: 'VIP-A01',
    destinationPort: 'Bakauheni',
    baggageWeightKg: 8,
    checkInStatus: 'Terdaftar',
    contactPhone: '081399887766',
  });

  // 4. Sample Cargos (Muatan Kapal)
  await addCargo({
    voyageId: vyg1Id,
    shipName: 'KM Kelimutu Nusantara',
    manifestNumber: 'MFT-EXP-88912',
    senderName: 'PT Nusantara Logistik Pangan',
    receiverName: 'CV Sumber Makmur Makassar',
    cargoCategory: 'Bahan Pokok / Logistik Dingin',
    description: 'Beras Premium & Telur Ayam Segar Terkemas',
    weightKg: 14500,
    volumeM3: 28,
    hazardous: false,
    deckLocation: 'Hold No. 2 (Lower Deck)',
    status: 'Termuat di Kapal',
    notes: 'Suhu pendingin dijaga 18°C',
  });

  await addCargo({
    voyageId: vyg2Id,
    shipName: 'KMP Dharma Rucitra VII',
    manifestNumber: 'MFT-RO-44219',
    senderName: 'Ekspedisi Indah Jaya Cargo',
    receiverName: 'Toko Bangunan Andalas Lampung',
    cargoCategory: 'Truk / Alat Berat',
    description: 'Truk Fuso Muatan Semen & Material Konstruksi',
    weightKg: 22000,
    volumeM3: 45,
    hazardous: false,
    deckLocation: 'Main Deck Slot C-03',
    vehiclePlateNumber: 'B 9842 BEK',
    status: 'Termuat di Kapal',
    notes: 'Kabin pengemudi 2 orang',
  });

  await addCargo({
    voyageId: vyg2Id,
    shipName: 'KMP Dharma Rucitra VII',
    manifestNumber: 'MFT-VH-11024',
    senderName: 'Dr. Rian Pratama',
    receiverName: 'Dr. Rian Pratama',
    cargoCategory: 'Kendaraan Roda 4 (Mobil Pribadi)',
    description: 'Toyota Innova Zenix Hybrid Putih',
    weightKg: 1850,
    volumeM3: 14,
    hazardous: false,
    deckLocation: 'Car Deck Upper Slot A-12',
    vehiclePlateNumber: 'B 1289 PFG',
    status: 'Menunggu Muat',
    notes: 'Kunci kontak dititipkan ke mandor dek',
  });
}
