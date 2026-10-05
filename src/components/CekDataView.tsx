import React, { useState } from 'react';
import { Search, ShieldAlert, CheckCircle, XCircle, UserPlus, ListOrdered } from 'lucide-react';

interface CekDataViewProps {
  bookedNumbers: Array<{ noRegistrasi: string; status: string }>;
  onSelectAvailableNumber: (noReg: string) => void;
  openRegistrasi: () => void;
}

export const CekDataView: React.FC<CekDataViewProps> = ({
  bookedNumbers,
  onSelectAvailableNumber,
  openRegistrasi,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const cleanTerm = searchTerm.trim().toLowerCase();
  const isExactBooked = cleanTerm
    ? bookedNumbers.some((item) => item.noRegistrasi.toLowerCase() === cleanTerm)
    : false;

  const filteredList = cleanTerm
    ? bookedNumbers.filter((item) => item.noRegistrasi.toLowerCase().includes(cleanTerm))
    : bookedNumbers;

  const handleSearchClick = () => {
    setHasSearched(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header Card */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            Privasi Data Terlindungi
          </div>
          <h2 className="text-2xl font-black font-heading bg-gradient-to-r from-blue-700 to-cyan-500 bg-clip-text text-transparent">
            PENGECEKAN NOMOR BOOKING PESERTA
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Periksa ketersediaan nomor registrasi pilihan Anda. Halaman ini hanya menampilkan status nomor yang sudah terbooking tanpa menampilkan informasi identitas pribadi peserta.
          </p>
        </div>

        {/* Input & Search Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHasSearched(true);
              }}
              placeholder="Ketik No Registrasi yang ingin dicek (contoh: 001, 007, 100)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-inner font-mono font-bold uppercase"
            />
          </div>

          <button
            onClick={handleSearchClick}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow transition flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" /> Cek Nomor
          </button>

          <button
            onClick={() => {
              setSearchTerm('');
              setHasSearched(false);
            }}
            className="w-full sm:w-auto bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm px-4 py-3 rounded-2xl transition"
          >
            Tampilkan Semua
          </button>
        </div>
      </div>

      {/* Specific Check Result Banner */}
      {cleanTerm && hasSearched && (
        <div>
          {isExactBooked ? (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-extrabold text-sm sm:text-base">
                    NO REGISTRASI #{cleanTerm.toUpperCase()} SUDAH TERBOOKING!
                  </div>
                  <div className="text-xs text-rose-600 dark:text-rose-300">
                    Nomor ini sudah diambil peserta lain. Silakan cari atau daftarkan nomor lain.
                  </div>
                </div>
              </div>
              <button
                onClick={openRegistrasi}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow"
              >
                Daftar Nomor Lain
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-extrabold text-sm sm:text-base">
                    NO REGISTRASI #{cleanTerm.toUpperCase()} TERSEDIA!
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-300">
                    Nomor ini belum ada yang mengambil dan siap Anda daftarkan sekarang.
                  </div>
                </div>
              </div>
              <button
                onClick={() => onSelectAvailableNumber(cleanTerm.toUpperCase())}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" /> Ambil Nomor Ini Sekarang &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grid of Booked Numbers Container */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold font-heading flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-blue-600" />
              Daftar Nomor Registrasi Yang Sudah Terbooking
            </h3>
            <p className="text-xs text-slate-400">
              Nomor-nomor berikut ini sudah terdaftar dan tidak dapat digunakan lagi.
            </p>
          </div>
          <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            {filteredList.length} Nomor Terbooking
          </span>
        </div>

        {filteredList.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 space-y-1">
            <p className="text-sm font-semibold">Tidak ada nomor booking yang cocok</p>
            <p className="text-xs">Silakan coba nomor lain atau bersihkan pencarian.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 max-h-[500px] overflow-y-auto p-1">
            {filteredList.map((item) => (
              <div
                key={item.noRegistrasi}
                className="p-3 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-center space-y-1 hover:border-blue-400 transition shadow-sm"
              >
                <div className="text-base font-black font-mono text-blue-600 dark:text-blue-400 tracking-wider">
                  #{item.noRegistrasi}
                </div>
                <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 uppercase">
                  TERBOOKING
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
