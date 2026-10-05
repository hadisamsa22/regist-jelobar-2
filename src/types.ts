export interface Peserta {
  id: string;
  noRegistrasi: string;
  nama: string;
  noHp: string;
  club: string;
  asalInstansi: string;
  alamat?: string;
  namaJersey?: string;
  ukuranJersey: string;
  tanggalRegistrasi: string;
  buktiPembayaran?: string;
  statusRegistrasi: 'TERDAFTAR' | 'BATAL';
  statusPembayaran: 'BELUM BAYAR' | 'MENUNGGU VERIFIKASI' | 'LUNAS' | 'DITOLAK';
  nominal: number;
  createdBy: string;
  qrCodeText?: string;
}

export interface Pembayaran {
  idTransaksi: string;
  noRegistrasi: string;
  namaPeserta: string;
  club: string;
  tanggal: string;
  nominal: number;
  metodePembayaran: string;
  rekeningTujuan: string;
  buktiPembayaran?: string;
  status: 'MENUNGGU VERIFIKASI' | 'LUNAS' | 'DITOLAK';
  catatan?: string;
}

export interface RekeningBank {
  id: string;
  namaBank: string;
  nomorRekening: string;
  atasNama: string;
  keterangan?: string;
  status: 'AKTIF' | 'NONAKTIF';
}

export interface PengaturanEvent {
  NAMA_EVENT: string;
  LOGO: string;
  TANGGAL_EVENT: string;
  LOKASI: string;
  KUOTA: string;
  BIAYA: string;
  UKURAN_JERSEY: string;
  WA_ADMIN: string;
  DESKRIPSI_EVENT: string;
  INFO_PEMBAYARAN: string;
  INFO_KARTU: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  username: string;
  aksi: string;
  noRegistrasi?: string;
  keterangan: string;
}

export interface UserSession {
  token: string;
  username: string;
  nama: string;
  role: 'admin' | 'operator';
}

export interface DashboardStats {
  kuota: number;
  totalPeserta: number;
  pesertaAktif: number;
  sisaKuota: number;
  belumBayar: number;
  menungguVerifikasi: number;
  lunas: number;
  ditolak: number;
  totalPembayaran: number;
}
