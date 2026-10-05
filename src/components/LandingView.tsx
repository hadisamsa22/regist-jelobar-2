import React from 'react';
import { Calendar, MapPin, UserPlus, Bookmark, CreditCard, Building2, Copy, Check, ShieldCheck, Sparkles } from 'lucide-react';
import type { PengaturanEvent, RekeningBank } from '../types';

interface LandingViewProps {
  settings: PengaturanEvent;
  bankAccounts: RekeningBank[];
  openRegistrasi: () => void;
  openPembayaran: () => void;
  openAiAssistant: () => void;
  goToCekData: () => void;
  onCopyBank: (rek: string, bank: string) => void;
  copiedBankId: string | null;
}

export const LandingView: React.FC<LandingViewProps> = ({
  settings,
  bankAccounts,
  openRegistrasi,
  openPembayaran,
  openAiAssistant,
  goToCekData,
  onCopyBank,
  copiedBankId,
}) => {
  const activeBanks = bankAccounts.filter((b) => b.status === 'AKTIF');

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="gradient-hero text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 text-center md:text-left max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs px-3.5 py-1.5 rounded-full font-semibold backdrop-blur-md">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{formatDate(settings.TANGGAL_EVENT)}</span>
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight text-white leading-tight">
              {settings.NAMA_EVENT}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed">
              {settings.DESKRIPSI_EVENT}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <button
                onClick={openRegistrasi}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg hover:shadow-amber-400/30 transition flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <UserPlus className="w-4 h-4 text-slate-950" />
                REGISTRASI PESERTA SEKARANG
              </button>

              <button
                onClick={goToCekData}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-5 py-3.5 rounded-2xl backdrop-blur-md border border-white/20 transition flex items-center gap-2"
              >
                <Bookmark className="w-4 h-4 text-amber-400" />
                Cek Nomor Booking
              </button>

              <button
                onClick={openAiAssistant}
                className="bg-blue-600/60 hover:bg-blue-600 text-white font-bold text-xs sm:text-sm px-4 py-3.5 rounded-2xl backdrop-blur-md border border-blue-400/30 transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Gemini AI
              </button>
            </div>
          </div>

          {/* Event Hero Card Info */}
          <div className="glass-card bg-white/10 dark:bg-slate-900/40 border border-white/20 text-white p-6 rounded-3xl w-full max-w-sm shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
              <img
                src={settings.LOGO || 'https://b.top4top.io/p_39179gqj91.png'}
                alt="Logo Event"
                className="h-12 w-auto object-contain bg-white rounded-xl p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80?text=JELOBAR';
                }}
              />
              <div>
                <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> LOKASI START & FINISH
                </div>
                <div className="text-sm font-bold text-white line-clamp-2">{settings.LOKASI}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] text-blue-200 block uppercase font-medium">BIAYA REGISTRASI</span>
                <span className="font-extrabold text-amber-400 text-sm">
                  Rp {Number(settings.BIAYA || 150000).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                <span className="text-[10px] text-blue-200 block uppercase font-medium">KUOTA MAKSIMAL</span>
                <span className="font-extrabold text-emerald-400 text-sm">
                  {Number(settings.KUOTA || 1000).toLocaleString('id-ID')} Peserta
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 bg-black/20 p-2.5 rounded-xl border border-white/5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Database Google Sheets Realtime & Terverifikasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Quick Action Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
            <UserPlus className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-heading">1. Pendaftaran Peserta</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Pilih No Registrasi manual Anda sendiri, isi data pribadi, CLUB (Perorangan / Nama Club), dan ukuran jersey resmi.
          </p>
          <button
            onClick={openRegistrasi}
            className="mt-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition"
          >
            Buka Form Registrasi &rarr;
          </button>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center text-xl font-bold">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-heading">2. Cek Nomor Booking</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Periksa nomor registrasi yang sudah terbooking secara realtime tanpa menampilkan detail identitas peserta.
          </p>
          <button
            onClick={goToCekData}
            className="mt-2 w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow transition"
          >
            Lihat Nomor Terbooking &rarr;
          </button>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center text-xl font-bold">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-heading">3. Pelunasan / Bukti Bayar</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Pilih foto bukti pembayaran langsung dari galeri HP atau link URL untuk proses verifikasi panitia.
          </p>
          <button
            onClick={openPembayaran}
            className="mt-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition"
          >
            Upload Bukti Pembayaran &rarr;
          </button>
        </div>
      </div>

      {/* Active Bank Accounts Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold font-heading flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Rekening Bank Resmi Pembayaran Event
              </h3>
              <p className="text-xs text-slate-500">
                Transfer hanya ke nomor rekening resmi yang tertera di bawah ini.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi Sistem
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeBanks.length === 0 ? (
              <div className="col-span-3 text-xs text-slate-400 p-4 text-center">
                Belum ada rekening bank yang diaktifkan oleh admin.
              </div>
            ) : (
              activeBanks.map((b) => {
                const isCopied = copiedBankId === b.id;
                return (
                  <div
                    key={b.id}
                    className="p-4 bg-blue-50/70 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 rounded-2xl space-y-1 relative shadow-sm"
                  >
                    <div className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase">
                      {b.namaBank}
                    </div>
                    <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono tracking-wider">
                      {b.nomorRekening}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      a.n. <b>{b.atasNama}</b>
                    </div>
                    <button
                      onClick={() => onCopyBank(b.nomorRekening, b.namaBank)}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-700 shadow-sm hover:bg-blue-50 transition"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Tersalin!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Salin Nomor Rekening
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
