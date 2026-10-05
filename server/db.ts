import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Peserta, Pembayaran, RekeningBank, PengaturanEvent, AuditLog, DashboardStats } from '../src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '..', 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

export interface DatabaseSchema {
  peserta: Peserta[];
  pembayaran: Pembayaran[];
  rekening_bank: RekeningBank[];
  pengaturan: PengaturanEvent;
  audit_logs: AuditLog[];
}

const DEFAULT_SETTINGS: PengaturanEvent = {
  NAMA_EVENT: 'FORM REGISTRASI JELOBAR #2',
  LOGO: 'https://b.top4top.io/p_39179gqj91.png',
  TANGGAL_EVENT: '2026-10-18',
  LOKASI: 'Kantor Bupati Lombok Barat',
  KUOTA: '1000',
  BIAYA: '150000',
  UKURAN_JERSEY: 'XS,S,M,L,XL,XXL,XXXL,XXXXL',
  WA_ADMIN: '6281234567890',
  DESKRIPSI_EVENT: 'Trabas Akbar Jelobar #2 2027! Nikmati rute pemandangan alam terbaik, jersey eksklusif, dan doorprize spektakuler.',
  INFO_PEMBAYARAN: 'Silakan lakukan transfer sesuai nominal ke rekening bank resmi di bawah ini. Harap simpan dan unggah bukti transfer untuk verifikasi admin.',
  INFO_KARTU: 'Kartu Peserta Resmi Event Jelobar. Wajib ditunjukkan saat pengambilan jersey & rute acara.'
};

const DEFAULT_BANK_ACCOUNTS: RekeningBank[] = [
  {
    id: 'BANK-01',
    namaBank: 'BANK BCA',
    nomorRekening: '0561239870',
    atasNama: 'PANITIA JELOBAR #2',
    keterangan: 'Rekening Utama Pembayaran',
    status: 'AKTIF'
  },
  {
    id: 'BANK-02',
    namaBank: 'BANK MANDIRI',
    nomorRekening: '1610098765432',
    atasNama: 'PANITIA JELOBAR #2',
    keterangan: 'Rekening Alternatif',
    status: 'AKTIF'
  },
  {
    id: 'BANK-03',
    namaBank: 'BANK NTB SYARIAH',
    nomorRekening: '501020030040',
    atasNama: 'JELOBAR LOMBOK BARAT',
    keterangan: 'Bank Daerah NTB',
    status: 'AKTIF'
  }
];

const INITIAL_PESERTA: Peserta[] = [
  {
    id: '001',
    noRegistrasi: '001',
    nama: 'H. Lalu Sudirman, S.H.',
    noHp: '081234567891',
    club: 'TRABAS RINJANI CLUB',
    asalInstansi: 'TRABAS RINJANI CLUB',
    alamat: 'Gerung, Lombok Barat',
    namaJersey: 'LALU SUDIRMAN',
    ukuranJersey: 'XL',
    tanggalRegistrasi: '2026-09-01',
    buktiPembayaran: '-',
    statusRegistrasi: 'TERDAFTAR',
    statusPembayaran: 'LUNAS',
    nominal: 150000,
    createdBy: 'ADMIN',
    qrCodeText: '001|H. Lalu Sudirman, S.H.|TRABAS RINJANI CLUB'
  },
  {
    id: '007',
    noRegistrasi: '007',
    nama: 'Bambang Trianto',
    noHp: '081987654321',
    club: 'Perorangan',
    asalInstansi: 'Perorangan',
    alamat: 'Narmada, Lombok Barat',
    namaJersey: 'BAMBANG 007',
    ukuranJersey: 'L',
    tanggalRegistrasi: '2026-09-05',
    buktiPembayaran: '-',
    statusRegistrasi: 'TERDAFTAR',
    statusPembayaran: 'LUNAS',
    nominal: 150000,
    createdBy: 'PUBLIC_FORM',
    qrCodeText: '007|Bambang Trianto|Perorangan'
  },
  {
    id: '088',
    noRegistrasi: '088',
    nama: 'Ahmad Fauzi',
    noHp: '085299887766',
    club: 'MATARAM ENDURO SQUAD',
    asalInstansi: 'MATARAM ENDURO SQUAD',
    alamat: 'Ampenan, Mataram',
    namaJersey: 'FAUZI 88',
    ukuranJersey: 'M',
    tanggalRegistrasi: '2026-09-10',
    buktiPembayaran: '-',
    statusRegistrasi: 'TERDAFTAR',
    statusPembayaran: 'MENUNGGU VERIFIKASI',
    nominal: 150000,
    createdBy: 'PUBLIC_FORM',
    qrCodeText: '088|Ahmad Fauzi|MATARAM ENDURO SQUAD'
  },
  {
    id: '100',
    noRegistrasi: '100',
    nama: 'Wayan Suartana',
    noHp: '087812345678',
    club: 'Perorangan',
    asalInstansi: 'Perorangan',
    alamat: 'Cakranegara, Mataram',
    namaJersey: 'WAYAN',
    ukuranJersey: 'XXL',
    tanggalRegistrasi: '2026-09-12',
    buktiPembayaran: '-',
    statusRegistrasi: 'TERDAFTAR',
    statusPembayaran: 'BELUM BAYAR',
    nominal: 150000,
    createdBy: 'PUBLIC_FORM',
    qrCodeText: '100|Wayan Suartana|Perorangan'
  }
];

const INITIAL_PAYMENTS: Pembayaran[] = [
  {
    idTransaksi: 'TRX17251840001',
    noRegistrasi: '001',
    namaPeserta: 'H. Lalu Sudirman, S.H.',
    club: 'TRABAS RINJANI CLUB',
    tanggal: '2026-09-01',
    nominal: 150000,
    metodePembayaran: 'Transfer Bank / Galeri',
    rekeningTujuan: 'BANK BCA - 0561239870 (a.n. PANITIA JELOBAR #2)',
    buktiPembayaran: '-',
    status: 'LUNAS',
    catatan: 'Pembayaran VIP Pembukaan'
  },
  {
    idTransaksi: 'TRX17255304002',
    noRegistrasi: '007',
    namaPeserta: 'Bambang Trianto',
    club: 'Perorangan',
    tanggal: '2026-09-05',
    nominal: 150000,
    metodePembayaran: 'Transfer Bank / Galeri',
    rekeningTujuan: 'BANK MANDIRI - 1610098765432 (a.n. PANITIA JELOBAR #2)',
    buktiPembayaran: '-',
    status: 'LUNAS',
    catatan: 'Transfer via Livin Mandiri'
  },
  {
    idTransaksi: 'TRX17259624003',
    noRegistrasi: '088',
    namaPeserta: 'Ahmad Fauzi',
    club: 'MATARAM ENDURO SQUAD',
    tanggal: '2026-09-10',
    nominal: 150000,
    metodePembayaran: 'QRIS / E-Wallet',
    rekeningTujuan: 'BANK NTB SYARIAH - 501020030040 (a.n. JELOBAR LOMBOK BARAT)',
    buktiPembayaran: '-',
    status: 'MENUNGGU VERIFIKASI',
    catatan: 'Upload struk transfer galeri'
  }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-09-01 08:30:00',
    username: 'SYSTEM',
    aksi: 'INITIALIZE',
    noRegistrasi: '-',
    keterangan: 'Inisialisasi database registrasi Jelobar #2 sukses.'
  },
  {
    id: 'LOG-002',
    timestamp: '2026-09-01 09:15:00',
    username: 'admin',
    aksi: 'REGISTRASI',
    noRegistrasi: '001',
    keterangan: 'Registrasi peserta 001 H. Lalu Sudirman, S.H. via Meja Admin'
  }
];

class DatabaseManager {
  private db: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.db = this.loadDatabase();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          peserta: parsed.peserta || [],
          pembayaran: parsed.pembayaran || [],
          rekening_bank: parsed.rekening_bank || DEFAULT_BANK_ACCOUNTS,
          pengaturan: { ...DEFAULT_SETTINGS, ...(parsed.pengaturan || {}) },
          audit_logs: parsed.audit_logs || []
        };
      } catch (err) {
        console.error('Error reading database file, using fallback initial data', err);
      }
    }

    const initial: DatabaseSchema = {
      peserta: INITIAL_PESERTA,
      pembayaran: INITIAL_PAYMENTS,
      rekening_bank: DEFAULT_BANK_ACCOUNTS,
      pengaturan: DEFAULT_SETTINGS,
      audit_logs: INITIAL_AUDIT_LOGS
    };
    this.saveToDisk(initial);
    return initial;
  }

  private saveToDisk(data?: DatabaseSchema) {
    try {
      this.ensureDataDir();
      const content = JSON.stringify(data || this.db, null, 2);
      fs.writeFileSync(DB_FILE, content, 'utf-8');
    } catch (e) {
      console.error('Failed to write database to disk:', e);
    }
  }

  public getPublicData() {
    const booked = this.db.peserta
      .filter(p => p.statusRegistrasi !== 'BATAL')
      .map(p => ({
        noRegistrasi: p.noRegistrasi,
        status: 'TERBOOKING',
        statusBayar: p.statusPembayaran === 'LUNAS' ? 'LUNAS' : 'TERDAFTAR'
      }));

    const activeBanks = this.db.rekening_bank.filter(b => b.status === 'AKTIF');
    const sizes = (this.db.pengaturan.UKURAN_JERSEY || 'XS,S,M,L,XL,XXL,XXXL,XXXXL')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    return {
      success: true,
      settings: this.db.pengaturan,
      bankAccounts: activeBanks,
      sizes,
      bookedNumbers: booked,
      totalBooked: booked.length
    };
  }

  public getBookedNumbers() {
    const booked = this.db.peserta
      .filter(p => p.statusRegistrasi !== 'BATAL')
      .map(p => ({
        noRegistrasi: p.noRegistrasi,
        status: 'TERBOOKING'
      }));
    return { success: true, data: booked, total: booked.length };
  }

  public checkNoRegistrasiAvailable(noRegistrasi: string, excludeId?: string) {
    const trimmed = String(noRegistrasi || '').trim().toLowerCase();
    if (!trimmed) {
      return { available: false, message: 'Nomor registrasi tidak boleh kosong' };
    }

    const existing = this.db.peserta.find(p => {
      if (excludeId && (p.id === excludeId || p.noRegistrasi.toLowerCase() === excludeId.toLowerCase())) {
        return false;
      }
      return p.statusRegistrasi !== 'BATAL' && p.noRegistrasi.toLowerCase() === trimmed;
    });

    if (existing) {
      return {
        available: false,
        message: `No Registrasi "${noRegistrasi.toUpperCase()}" SUDAH TERBOOKING oleh peserta lain!`
      };
    }

    return {
      available: true,
      message: `No Registrasi "${noRegistrasi.toUpperCase()}" TERSEDIA dan dapat digunakan!`
    };
  }

  public checkParticipantStatus(query: string, isAdmin = false) {
    const q = String(query || '').trim().toLowerCase();
    
    // PUBLIC VIEW: MUST NOT EXPOSE PERSONAL DETAILS! ONLY BOOKING AVAILABILITY!
    if (!isAdmin) {
      const isBooked = this.db.peserta.some(
        p => p.statusRegistrasi !== 'BATAL' && p.noRegistrasi.toLowerCase() === q
      );

      const bookedList = this.db.peserta
        .filter(p => p.statusRegistrasi !== 'BATAL')
        .map(p => ({
          noRegistrasi: p.noRegistrasi,
          status: 'TERBOOKING'
        }));

      return {
        success: true,
        isBooked,
        message: isBooked
          ? `Nomor Registrasi ${q.toUpperCase()} SUDAH TERBOOKING`
          : `Nomor Registrasi ${q.toUpperCase()} TERSEDIA`,
        data: bookedList
      };
    }

    // ADMIN VIEW: FULL SEARCH
    const found = this.db.peserta.filter(p => {
      return (
        p.noRegistrasi.toLowerCase().includes(q) ||
        p.nama.toLowerCase().includes(q) ||
        p.noHp.includes(q) ||
        p.club.toLowerCase().includes(q)
      );
    });

    return {
      success: true,
      data: found,
      message: found.length > 0 ? `Ditemukan ${found.length} peserta` : 'Peserta tidak ditemukan'
    };
  }

  public registerPeserta(data: Partial<Peserta>) {
    const noReg = String(data.noRegistrasi || '').trim();
    if (!noReg) {
      return { success: false, message: 'No Registrasi wajib diisi!' };
    }

    // Check unique booking
    const check = this.checkNoRegistrasiAvailable(noReg);
    if (!check.available) {
      return { success: false, message: check.message };
    }

    const club = String(data.club || 'Perorangan').trim() || 'Perorangan';
    const nominal = Number(data.nominal || this.db.pengaturan.BIAYA || 150000);
    const hasProof = Boolean(data.buktiPembayaran && data.buktiPembayaran !== '-');

    const newPeserta: Peserta = {
      id: noReg,
      noRegistrasi: noReg,
      nama: String(data.nama || '').trim(),
      noHp: String(data.noHp || '').trim(),
      club,
      asalInstansi: club,
      alamat: String(data.alamat || '').trim(),
      namaJersey: String(data.namaJersey || data.nama || '').trim().toUpperCase(),
      ukuranJersey: String(data.ukuranJersey || 'L'),
      tanggalRegistrasi: String(data.tanggalRegistrasi || new Date().toISOString().split('T')[0]),
      buktiPembayaran: data.buktiPembayaran || '-',
      statusRegistrasi: 'TERDAFTAR',
      statusPembayaran: data.statusPembayaran || (hasProof ? 'MENUNGGU VERIFIKASI' : 'BELUM BAYAR'),
      nominal,
      createdBy: data.createdBy || 'PUBLIC_FORM',
      qrCodeText: `${noReg}|${data.nama}|${club}`
    };

    this.db.peserta.unshift(newPeserta);

    // If proof is uploaded during registration, create payment record automatically
    if (hasProof) {
      const trxId = 'TRX' + Date.now();
      const newPayment: Pembayaran = {
        idTransaksi: trxId,
        noRegistrasi: noReg,
        namaPeserta: newPeserta.nama,
        club,
        tanggal: newPeserta.tanggalRegistrasi,
        nominal,
        metodePembayaran: 'Transfer Bank / Galeri',
        rekeningTujuan: this.db.rekening_bank[0]
          ? `${this.db.rekening_bank[0].namaBank} - ${this.db.rekening_bank[0].nomorRekening}`
          : 'Rekening Panitia',
        buktiPembayaran: data.buktiPembayaran,
        status: newPeserta.statusPembayaran === 'LUNAS' ? 'LUNAS' : 'MENUNGGU VERIFIKASI',
        catatan: 'Bukti diunggah bersama formulir pendaftaran'
      };
      this.db.pembayaran.unshift(newPayment);
    }

    this.logAudit(
      newPeserta.createdBy,
      'REGISTRASI',
      noReg,
      `Pendaftaran peserta ${newPeserta.nama} (${noReg}) dengan klub ${club}, status bayar: ${newPeserta.statusPembayaran}`
    );

    this.saveToDisk();

    return {
      success: true,
      message: 'Registrasi Berhasil Disimpan Realtime!',
      data: newPeserta
    };
  }

  public getAllPeserta() {
    return {
      success: true,
      data: this.db.peserta,
      stats: this.getDashboardStats()
    };
  }

  public updatePeserta(data: Partial<Peserta>, username = 'admin') {
    const noReg = String(data.noRegistrasi || data.id || '').trim();
    const index = this.db.peserta.findIndex(p => p.noRegistrasi === noReg || p.id === noReg);
    if (index === -1) {
      return { success: false, message: `Peserta dengan No Registrasi ${noReg} tidak ditemukan` };
    }

    const current = this.db.peserta[index];
    const club = data.club ? String(data.club).trim() : current.club;

    const updated: Peserta = {
      ...current,
      nama: data.nama !== undefined ? String(data.nama).trim() : current.nama,
      noHp: data.noHp !== undefined ? String(data.noHp).trim() : current.noHp,
      club,
      asalInstansi: club,
      alamat: data.alamat !== undefined ? String(data.alamat).trim() : current.alamat,
      namaJersey: data.namaJersey !== undefined ? String(data.namaJersey).trim().toUpperCase() : current.namaJersey,
      ukuranJersey: data.ukuranJersey !== undefined ? String(data.ukuranJersey) : current.ukuranJersey,
      statusRegistrasi: (data.statusRegistrasi as any) || current.statusRegistrasi,
      statusPembayaran: (data.statusPembayaran as any) || current.statusPembayaran,
      qrCodeText: `${current.noRegistrasi}|${data.nama || current.nama}|${club}`
    };

    this.db.peserta[index] = updated;

    // Sync any linked payments status
    if (data.statusPembayaran) {
      this.db.pembayaran.forEach(p => {
        if (p.noRegistrasi === noReg && (data.statusPembayaran === 'LUNAS' || data.statusPembayaran === 'DITOLAK')) {
          p.status = data.statusPembayaran as any;
        }
      });
    }

    this.logAudit(
      username,
      'UPDATE_PESERTA',
      noReg,
      `Update data peserta ${updated.nama} (${noReg}), status bayar: ${updated.statusPembayaran}`
    );

    this.saveToDisk();

    return {
      success: true,
      message: 'Data peserta berhasil diperbarui!',
      data: updated
    };
  }

  public deletePeserta(noRegistrasi: string, username = 'admin') {
    const reg = String(noRegistrasi).trim();
    const index = this.db.peserta.findIndex(p => p.noRegistrasi === reg || p.id === reg);
    if (index === -1) {
      return { success: false, message: `Peserta ${reg} tidak ditemukan` };
    }

    const removed = this.db.peserta.splice(index, 1)[0];
    this.logAudit(
      username,
      'HAPUS_PESERTA',
      reg,
      `Menghapus data peserta ${removed.nama} (${reg})`
    );

    this.saveToDisk();

    return {
      success: true,
      message: `Peserta ${removed.nama} (${reg}) berhasil dihapus!`
    };
  }

  public getAllPayments() {
    return {
      success: true,
      data: this.db.pembayaran
    };
  }

  public addPayment(data: Partial<Pembayaran>, username = 'PUBLIC_FORM') {
    const noReg = String(data.noRegistrasi || '').trim();
    const participant = this.db.peserta.find(p => p.noRegistrasi === noReg || p.id === noReg);

    const trxId = 'TRX' + Date.now();
    const nominal = Number(data.nominal || this.db.pengaturan.BIAYA || 150000);
    const status = (data.status as any) || 'MENUNGGU VERIFIKASI';

    const newPayment: Pembayaran = {
      idTransaksi: trxId,
      noRegistrasi: noReg,
      namaPeserta: participant ? participant.nama : String(data.namaPeserta || 'Peserta'),
      club: participant ? participant.club : String(data.club || 'Perorangan'),
      tanggal: data.tanggal || new Date().toISOString().split('T')[0],
      nominal,
      metodePembayaran: data.metodePembayaran || 'Transfer Bank / Galeri',
      rekeningTujuan: data.rekeningTujuan || 'Rekening Panitia',
      buktiPembayaran: data.buktiPembayaran || '-',
      status,
      catatan: data.catatan || ''
    };

    this.db.pembayaran.unshift(newPayment);

    // Update participant status & proof
    if (participant) {
      participant.statusPembayaran = status;
      if (data.buktiPembayaran && data.buktiPembayaran !== '-') {
        participant.buktiPembayaran = data.buktiPembayaran;
      }
    }

    this.logAudit(
      username,
      'SUBMIT_PEMBAYARAN',
      noReg,
      `Pengiriman konfirmasi pembayaran sebesar Rp ${nominal.toLocaleString('id-ID')} (${trxId})`
    );

    this.saveToDisk();

    return {
      success: true,
      message: 'Konfirmasi pembayaran berhasil dikirim!',
      trxId,
      data: newPayment
    };
  }

  public verifyPayment(idTransaksi: string, newStatus: 'LUNAS' | 'DITOLAK' | 'MENUNGGU VERIFIKASI', catatan = '', username = 'admin') {
    const payment = this.db.pembayaran.find(p => p.idTransaksi === idTransaksi);
    if (!payment) {
      return { success: false, message: `Transaksi ${idTransaksi} tidak ditemukan` };
    }

    payment.status = newStatus;
    if (catatan) payment.catatan = catatan;

    // Update linked participant
    const participant = this.db.peserta.find(p => p.noRegistrasi === payment.noRegistrasi);
    if (participant) {
      participant.statusPembayaran = newStatus;
    }

    this.logAudit(
      username,
      'VERIFIKASI_PEMBAYARAN',
      payment.noRegistrasi,
      `Verifikasi pembayaran ${idTransaksi} untuk peserta ${payment.namaPeserta} menjadi ${newStatus}`
    );

    this.saveToDisk();

    return {
      success: true,
      message: `Status pembayaran berhasil diubah menjadi ${newStatus}!`,
      data: payment
    };
  }

  public getBankAccounts(activeOnly = false) {
    const list = activeOnly
      ? this.db.rekening_bank.filter(b => b.status === 'AKTIF')
      : this.db.rekening_bank;
    return { success: true, data: list };
  }

  public saveBankAccount(data: Partial<RekeningBank>, username = 'admin') {
    const id = data.id || 'BANK-' + Date.now();
    const existingIndex = this.db.rekening_bank.findIndex(b => b.id === id);

    const record: RekeningBank = {
      id,
      namaBank: String(data.namaBank || '').trim().toUpperCase(),
      nomorRekening: String(data.nomorRekening || '').trim(),
      atasNama: String(data.atasNama || '').trim().toUpperCase(),
      keterangan: String(data.keterangan || '').trim(),
      status: (data.status as any) || 'AKTIF'
    };

    if (existingIndex >= 0) {
      this.db.rekening_bank[existingIndex] = record;
    } else {
      this.db.rekening_bank.push(record);
    }

    this.logAudit(
      username,
      'SAVE_BANK',
      '-',
      `Menyimpan rekening ${record.namaBank} ${record.nomorRekening} (a.n. ${record.atasNama})`
    );

    this.saveToDisk();

    return {
      success: true,
      message: 'Rekening bank berhasil disimpan!',
      data: record
    };
  }

  public toggleBankAccountStatus(id: string, username = 'admin') {
    const bank = this.db.rekening_bank.find(b => b.id === id);
    if (!bank) return { success: false, message: 'Rekening bank tidak ditemukan' };

    bank.status = bank.status === 'AKTIF' ? 'NONAKTIF' : 'AKTIF';

    this.logAudit(
      username,
      'TOGGLE_BANK',
      '-',
      `Ubah status rekening ${bank.namaBank} ${bank.nomorRekening} menjadi ${bank.status}`
    );

    this.saveToDisk();
    return { success: true, message: `Rekening berhasil diubah menjadi ${bank.status}`, data: bank };
  }

  public deleteBankAccount(id: string, username = 'admin') {
    const index = this.db.rekening_bank.findIndex(b => b.id === id);
    if (index === -1) return { success: false, message: 'Rekening bank tidak ditemukan' };

    const removed = this.db.rekening_bank.splice(index, 1)[0];
    this.logAudit(
      username,
      'DELETE_BANK',
      '-',
      `Menghapus rekening ${removed.namaBank} ${removed.nomorRekening}`
    );

    this.saveToDisk();
    return { success: true, message: 'Rekening bank berhasil dihapus!' };
  }

  public getFullSettings() {
    return { success: true, settings: this.db.pengaturan };
  }

  public saveSettings(newSettings: Partial<PengaturanEvent>, username = 'admin') {
    this.db.pengaturan = {
      ...this.db.pengaturan,
      ...newSettings
    };

    this.logAudit(
      username,
      'SAVE_SETTINGS',
      '-',
      `Memperbarui konfigurasi event: ${this.db.pengaturan.NAMA_EVENT}`
    );

    this.saveToDisk();

    return {
      success: true,
      message: 'Pengaturan event berhasil disimpan!',
      settings: this.db.pengaturan
    };
  }

  public getAuditLogs() {
    return {
      success: true,
      data: this.db.audit_logs
    };
  }

  public logAudit(username: string, aksi: string, noRegistrasi: string, keterangan: string) {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const log: AuditLog = {
      id: 'LOG-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp,
      username: username || 'SYSTEM',
      aksi: aksi.toUpperCase(),
      noRegistrasi: noRegistrasi || '-',
      keterangan
    };

    this.db.audit_logs.unshift(log);
    if (this.db.audit_logs.length > 500) {
      this.db.audit_logs.pop();
    }
  }

  public getDashboardStats(): DashboardStats {
    const kuota = Number(this.db.pengaturan.KUOTA || 1000);
    const aktif = this.db.peserta.filter(p => p.statusRegistrasi !== 'BATAL');
    const totalPeserta = this.db.peserta.length;
    const pesertaAktif = aktif.length;
    const sisaKuota = Math.max(0, kuota - pesertaAktif);

    const belumBayar = aktif.filter(p => p.statusPembayaran === 'BELUM BAYAR').length;
    const menungguVerifikasi = aktif.filter(p => p.statusPembayaran === 'MENUNGGU VERIFIKASI').length;
    const lunas = aktif.filter(p => p.statusPembayaran === 'LUNAS').length;
    const ditolak = aktif.filter(p => p.statusPembayaran === 'DITOLAK').length;

    const totalPembayaran = this.db.pembayaran
      .filter(p => p.status === 'LUNAS')
      .reduce((sum, p) => sum + (Number(p.nominal) || 0), 0);

    return {
      kuota,
      totalPeserta,
      pesertaAktif,
      sisaKuota,
      belumBayar,
      menungguVerifikasi,
      lunas,
      ditolak,
      totalPembayaran
    };
  }
}

export const dbManager = new DatabaseManager();
