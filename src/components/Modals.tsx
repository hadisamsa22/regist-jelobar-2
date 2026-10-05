import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  CreditCard,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  ZoomIn,
  CheckCircle,
  FileText,
  Lock,
  Printer,
  Sparkles,
  Phone,
} from 'lucide-react';
import type { Peserta, Pembayaran, RekeningBank, PengaturanEvent, UserSession } from '../types';
import { ParticipantCard } from './ParticipantCard';

// Image compression helper
function compressImageFile(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context failed'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

// -------------------------------------------------------------
// 1. REGISTRATION MODAL
// -------------------------------------------------------------
interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sizes: string[];
  settings: PengaturanEvent;
  onSuccess: (participant: Peserta) => void;
  initialNoReg?: string;
  isAdminMode?: boolean;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  sizes,
  settings,
  onSuccess,
  initialNoReg = '',
  isAdminMode = false,
}) => {
  const [noReg, setNoReg] = useState(initialNoReg);
  const [noRegFeedback, setNoRegFeedback] = useState<{ available?: boolean; text: string }>({
    text: 'No Registrasi bersifat manual & unik. Pastikan nomor belum terpakai oleh peserta lain.',
  });
  const [nama, setNama] = useState('');
  const [noHp, setNoHp] = useState('');
  const [clubType, setClubType] = useState<'Perorangan' | 'Nama Club'>('Perorangan');
  const [customClub, setCustomClub] = useState('');
  const [alamat, setAlamat] = useState('');
  const [namaJersey, setNamaJersey] = useState('');
  const [ukuranJersey, setUkuranJersey] = useState('L');
  const [proofMode, setProofMode] = useState<'file' | 'url'>('file');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState('');
  const [adminStatusBayar, setAdminStatusBayar] = useState<'BELUM BAYAR' | 'LUNAS'>('BELUM BAYAR');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialNoReg) {
      setNoReg(initialNoReg);
      checkAvailability(initialNoReg);
    }
  }, [initialNoReg]);

  if (!isOpen) return null;

  const checkAvailability = async (val: string) => {
    if (!val.trim()) {
      setNoRegFeedback({ text: 'No Registrasi wajib diisi!' });
      return;
    }
    try {
      const res = await fetch(`/api/check-no-registrasi?noRegistrasi=${encodeURIComponent(val)}`);
      const data = await res.json();
      setNoRegFeedback({
        available: data.available,
        text: data.message,
      });
    } catch {
      setNoRegFeedback({ text: 'Gagal memeriksa nomor' });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setProofImage(compressed);
      setProofFileName(`${file.name} (${Math.round(file.size / 1024)} KB)`);
    } catch (err) {
      alert('Gagal memproses gambar');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noReg.trim()) {
      alert('No Registrasi wajib diisi!');
      return;
    }

    const club = clubType === 'Nama Club' ? customClub.trim() || 'Club' : 'Perorangan';

    setIsSubmitting(true);
    try {
      const payload: Partial<Peserta> = {
        noRegistrasi: noReg.trim().toUpperCase(),
        nama: nama.trim(),
        noHp: noHp.trim(),
        club,
        asalInstansi: club,
        alamat: alamat.trim(),
        namaJersey: (namaJersey.trim() || nama.trim()).toUpperCase(),
        ukuranJersey,
        tanggalRegistrasi: new Date().toISOString().split('T')[0],
        buktiPembayaran: proofImage || '-',
        nominal: Number(settings.BIAYA || 150000),
        createdBy: isAdminMode ? 'ADMIN' : 'PUBLIC_FORM',
        statusPembayaran: isAdminMode
          ? adminStatusBayar
          : proofImage
          ? 'MENUNGGU VERIFIKASI'
          : 'BELUM BAYAR',
      };

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        onSuccess(data.data);
        onClose();
      } else {
        alert(data.message || 'Registrasi gagal');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-4 my-6">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black font-heading">
              {isAdminMode ? 'REGISTRASI PESERTA (MEJA ADMIN)' : 'FORM PENDAFTARAN PESERTA'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Manual No Registrasi */}
          <div className="bg-blue-50/80 dark:bg-blue-950/60 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-1.5 shadow-sm">
            <label className="block font-bold text-blue-900 dark:text-blue-300 flex justify-between">
              <span>NO REGISTRASI PILIHAN ANDA *</span>
              <span className="text-[11px] font-normal text-slate-500">Input nomor unik Anda</span>
            </label>
            <input
              type="text"
              required
              value={noReg}
              onChange={(e) => setNoReg(e.target.value)}
              onBlur={() => checkAvailability(noReg)}
              placeholder="Contoh: 001, 007, 088, 123..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 font-mono font-black text-base text-blue-700 dark:text-blue-300 uppercase shadow-inner"
            />
            <p
              className={`text-[11px] font-semibold ${
                noRegFeedback.available === true
                  ? 'text-emerald-600'
                  : noRegFeedback.available === false
                  ? 'text-rose-600'
                  : 'text-slate-500'
              }`}
            >
              {noRegFeedback.text}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Nama Lengkap Peserta *</label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Masukkan nama lengkap..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Nomor WhatsApp / HP *</label>
              <input
                type="tel"
                required
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="Contoh: 081234567890..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            {/* Club Selection */}
            <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="block font-bold">CLUB *</label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 cursor-pointer">
                  <input
                    type="radio"
                    name="regClubType"
                    checked={clubType === 'Perorangan'}
                    onChange={() => setClubType('Perorangan')}
                    className="text-blue-600"
                  />
                  <span className="font-bold text-xs">Perorangan</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 cursor-pointer">
                  <input
                    type="radio"
                    name="regClubType"
                    checked={clubType === 'Nama Club'}
                    onChange={() => setClubType('Nama Club')}
                    className="text-blue-600"
                  />
                  <span className="font-bold text-xs">Nama Club</span>
                </label>
              </div>

              {clubType === 'Nama Club' && (
                <div className="pt-1">
                  <label className="block font-semibold text-xs mb-1">Nama Club / Komunitas *</label>
                  <input
                    type="text"
                    required
                    value={customClub}
                    onChange={(e) => setCustomClub(e.target.value)}
                    placeholder="Ketik nama club Anda..."
                    className="w-full px-3 py-2 rounded-xl border border-blue-400 bg-white dark:bg-slate-900 uppercase font-semibold text-xs"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-1">Nama di Jersey (Opsional)</label>
              <input
                type="text"
                value={namaJersey}
                onChange={(e) => setNamaJersey(e.target.value)}
                placeholder="Nama dada..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Ukuran Jersey *</label>
              <select
                value={ukuranJersey}
                onChange={(e) => setUkuranJersey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-blue-600"
              >
                {sizes.map((sz) => (
                  <option key={sz} value={sz}>
                    {sz}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Alamat Domisili (Opsional)</label>
              <input
                type="text"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Kota / Kabupaten..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            {/* Proof Upload */}
            <div className="sm:col-span-2 bg-indigo-50/70 dark:bg-indigo-950/40 p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-900 dark:text-indigo-300">
                  BUKTI PEMBAYARAN <span className="text-slate-400 font-normal text-xs">(Opsional)</span>
                </span>
                <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded-full">
                  Galeri HP / URL
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setProofMode('file')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                    proofMode === 'file' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 inline mr-1" /> Galeri HP
                </button>
                <button
                  type="button"
                  onClick={() => setProofMode('url')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                    proofMode === 'url' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5 inline mr-1" /> Link URL
                </button>
              </div>

              {proofMode === 'file' ? (
                <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-indigo-300 rounded-xl cursor-pointer hover:bg-indigo-50/50 text-center">
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                    Pilih Foto dari Galeri HP / Kamera
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              ) : (
                <input
                  type="text"
                  placeholder="Tempel URL bukti transfer..."
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    setProofImage(val || null);
                    setProofFileName(val ? 'URL Bukti' : '');
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              )}

              {proofImage && (
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border flex items-center justify-between gap-2">
                  <img src={proofImage} alt="Preview" className="h-12 w-12 object-cover rounded-lg" />
                  <span className="text-xs font-semibold truncate flex-1">{proofFileName || 'Foto terpilih'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setProofImage(null);
                      setProofFileName('');
                    }}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {isAdminMode && (
              <div className="sm:col-span-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 rounded-xl space-y-1">
                <span className="font-bold text-amber-800 dark:text-amber-300 text-xs">OPSI MEJA ADMIN:</span>
                <select
                  value={adminStatusBayar}
                  onChange={(e) => setAdminStatusBayar(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-xl border font-bold text-xs"
                >
                  <option value="BELUM BAYAR">BELUM BAYAR</option>
                  <option value="LUNAS">LUNAS (Verifikasi Langsung)</option>
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            <UserPlus className="w-5 h-5" />
            {isSubmitting ? 'Menyimpan Registrasi...' : 'SIMPAN REGISTRASI SEKARANG'}
          </button>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. PAYMENT CONFIRMATION MODAL
// -------------------------------------------------------------
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankAccounts: RekeningBank[];
  defaultNoReg?: string;
  onPaymentSubmitted: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  bankAccounts,
  defaultNoReg = '',
  onPaymentSubmitted,
}) => {
  const [noReg, setNoReg] = useState(defaultNoReg);
  const [participantInfo, setParticipantInfo] = useState<{ nama: string; club: string; status: string } | null>(null);
  const [bankTarget, setBankTarget] = useState('');
  const [metode, setMetode] = useState('Transfer Bank / Galeri');
  const [nominal, setNominal] = useState(150000);
  const [catatan, setCatatan] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofMode, setProofMode] = useState<'file' | 'url'>('file');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultNoReg) {
      setNoReg(defaultNoReg);
      fetchDetails(defaultNoReg);
    }
    if (bankAccounts.length > 0 && !bankTarget) {
      const active = bankAccounts.filter((b) => b.status === 'AKTIF');
      if (active.length > 0) {
        setBankTarget(`${active[0].namaBank} - ${active[0].nomorRekening} (a.n. ${active[0].atasNama})`);
      }
    }
  }, [defaultNoReg, bankAccounts]);

  if (!isOpen) return null;

  const fetchDetails = async (reg: string) => {
    if (!reg.trim()) return;
    try {
      const res = await fetch(`/api/check-participant?query=${encodeURIComponent(reg)}`, {
        headers: { Authorization: 'Bearer admin-token-jelobar' },
      });
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        const p = data.data[0];
        setParticipantInfo({ nama: p.nama, club: p.club, status: p.statusPembayaran });
        setNominal(p.nominal || 150000);
      } else {
        setParticipantInfo(null);
      }
    } catch {
      setParticipantInfo(null);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setProofImage(compressed);
    } catch {
      alert('Gagal memproses gambar');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noReg.trim()) {
      alert('No Registrasi wajib diisi!');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/pembayaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noRegistrasi: noReg.trim().toUpperCase(),
          rekeningTujuan: bankTarget,
          metodePembayaran: metode,
          nominal,
          buktiPembayaran: proofImage || '-',
          catatan,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Konfirmasi pembayaran berhasil dikirim! Menunggu verifikasi admin.');
        onPaymentSubmitted();
        onClose();
      } else {
        alert(data.message || 'Gagal mengirim pembayaran');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeBanks = bankAccounts.filter((b) => b.status === 'AKTIF');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 my-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black font-heading">PELUNASAN & BUKTI PEMBAYARAN</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold mb-1">No Registrasi Peserta *</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={noReg}
                onChange={(e) => setNoReg(e.target.value)}
                onBlur={() => fetchDetails(noReg)}
                placeholder="Masukkan No Registrasi Anda..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold uppercase"
              />
              <button
                type="button"
                onClick={() => fetchDetails(noReg)}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs"
              >
                Cek
              </button>
            </div>
          </div>

          {participantInfo && (
            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-800 text-xs space-y-1">
              <div className="font-bold">{participantInfo.nama}</div>
              <div className="text-slate-600 dark:text-slate-400">CLUB: {participantInfo.club}</div>
              <div className="font-semibold text-emerald-600">Status Saat Ini: {participantInfo.status}</div>
            </div>
          )}

          <div>
            <label className="block font-semibold mb-1">Pilih Rekening Tujuan Transfer *</label>
            <select
              value={bankTarget}
              onChange={(e) => setBankTarget(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
            >
              {activeBanks.map((b) => (
                <option key={b.id} value={`${b.namaBank} - ${b.nomorRekening} (a.n. ${b.atasNama})`}>
                  {b.namaBank} - {b.nomorRekening} (a.n. {b.atasNama})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Metode</label>
              <select
                value={metode}
                onChange={(e) => setMetode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              >
                <option value="Transfer Bank / Galeri">Transfer Bank / M-Banking</option>
                <option value="QRIS / E-Wallet">QRIS / E-Wallet</option>
                <option value="Tunai Meja Registrasi">Tunai Meja Registrasi</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Nominal (Rp) *</label>
              <input
                type="number"
                required
                value={nominal}
                onChange={(e) => setNominal(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs"
              />
            </div>
          </div>

          {/* Upload Proof */}
          <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-2">
            <span className="font-bold text-indigo-900 dark:text-indigo-300 text-xs block">
              FOTO BUKTI PEMBAYARAN <span className="text-slate-400 font-normal">(Opsional)</span>
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setProofMode('file')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  proofMode === 'file' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 inline mr-1" /> Galeri HP / File
              </button>
              <button
                type="button"
                onClick={() => setProofMode('url')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                  proofMode === 'url' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5 inline mr-1" /> URL Gambar
              </button>
            </div>

            {proofMode === 'file' ? (
              <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-indigo-300 rounded-xl cursor-pointer hover:bg-indigo-50 text-center">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                  Pilih Bukti dari Galeri HP / Kamera
                </span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            ) : (
              <input
                type="text"
                placeholder="Tempel URL bukti transfer..."
                onChange={(e) => setProofImage(e.target.value.trim() || null)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              />
            )}

            {proofImage && (
              <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border flex items-center justify-between gap-2">
                <img src={proofImage} alt="Preview" className="h-12 w-12 object-cover rounded-lg" />
                <span className="text-xs font-semibold text-emerald-600">Bukti Siap Dikirim</span>
                <button type="button" onClick={() => setProofImage(null)} className="text-rose-500 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold mb-1">Catatan Tambahan (Opsional)</label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Rekening pengirim a.n..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4" />
            {isSubmitting ? 'Mengirim Konfirmasi...' : 'KIRIM KONFIRMASI PEMBAYARAN'}
          </button>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. REGISTRATION SUCCESS MODAL
// -------------------------------------------------------------
interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: Peserta | null;
  onOpenPayment: () => void;
  onPrintCard: () => void;
  adminWa: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  participant,
  onOpenPayment,
  onPrintCard,
  adminWa,
}) => {
  if (!isOpen || !participant) return null;

  const handleWhatsAppClick = () => {
    const msg = `Halo Admin Jelobar, pendaftaran saya berhasil:\n*No Reg:* #${participant.noRegistrasi}\n*Nama:* ${participant.nama}\n*Club:* ${participant.club}\n*Jersey:* ${participant.ukuranJersey}\n*Status Bayar:* ${participant.statusPembayaran}\n\nMohon petunjuk selanjutnya. Terima kasih!`;
    const cleanWa = adminWa.replace(/\D/g, '') || '6281234567890';
    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl font-black mx-auto">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-black font-heading">Registrasi Berhasil!</h3>
          <p className="text-xs text-slate-500">
            Data Anda telah sukses tersimpan di database event Jelobar.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border text-left space-y-2 text-xs">
          <div className="flex justify-between border-b pb-1">
            <span className="text-slate-400 font-semibold text-[10px]">NO REGISTRASI:</span>
            <span className="font-black text-amber-500 text-sm font-mono">#{participant.noRegistrasi}</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="text-slate-400 font-semibold text-[10px]">NAMA PESERTA:</span>
            <span className="font-bold">{participant.nama}</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="text-slate-400 font-semibold text-[10px]">CLUB:</span>
            <span className="font-semibold">{participant.club}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-semibold text-[10px]">STATUS BAYAR:</span>
            <span className="font-bold text-blue-600">{participant.statusPembayaran}</span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              onClose();
              onOpenPayment();
            }}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" /> Konfirmasi / Pelunasan Pembayaran
          </button>
          <button
            onClick={() => {
              onClose();
              onPrintCard();
            }}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> Cetak Kartu Peserta
          </button>
          <button
            onClick={handleWhatsAppClick}
            className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4 text-emerald-500" /> Hubungi WhatsApp Admin
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 4. LOGIN MODAL
// -------------------------------------------------------------
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success && data.userSession) {
        onLoginSuccess(data.userSession);
        onClose();
      } else {
        setErrorMsg(data.message || 'Login gagal');
      }
    } catch {
      setErrorMsg('Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-base font-black font-heading flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" /> LOGIN ADMINISTRATOR
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold mb-1">Username Admin</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="Default: admin123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition text-xs sm:text-sm"
          >
            {isLoading ? 'Memvalidasi...' : 'Masuk Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
};
