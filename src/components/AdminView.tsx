import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Building2,
  Printer,
  FileSpreadsheet,
  Sliders,
  History,
  RotateCw,
  LogOut,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Download,
} from 'lucide-react';
import type { Peserta, Pembayaran, RekeningBank, PengaturanEvent, AuditLog, DashboardStats } from '../types';
import { ParticipantCard } from './ParticipantCard';

interface AdminViewProps {
  stats: DashboardStats;
  participants: Peserta[];
  payments: Pembayaran[];
  bankAccounts: RekeningBank[];
  settings: PengaturanEvent;
  auditLogs: AuditLog[];
  onRefresh: () => void;
  onLogout: () => void;
  onAddParticipant: () => void;
  onViewParticipant: (p: Peserta) => void;
  onEditParticipant: (p: Peserta) => void;
  onDeleteParticipant: (id: string, nama: string) => void;
  onPrintCard: (p: Peserta) => void;
  onVerifyPayment: (id: string, status: 'LUNAS' | 'DITOLAK') => void;
  onOpenAiScan: (payment: Pembayaran) => void;
  onSaveBank: (bank: Partial<RekeningBank>) => void;
  onToggleBank: (id: string) => void;
  onDeleteBank: (id: string) => void;
  onSaveSettings: (settings: Partial<PengaturanEvent>) => void;
  onOpenAiAssistant: () => void;
  onExportCsv: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  stats,
  participants,
  payments,
  bankAccounts,
  settings,
  auditLogs,
  onRefresh,
  onLogout,
  onAddParticipant,
  onViewParticipant,
  onEditParticipant,
  onDeleteParticipant,
  onPrintCard,
  onVerifyPayment,
  onOpenAiScan,
  onSaveBank,
  onToggleBank,
  onDeleteBank,
  onSaveSettings,
  onOpenAiAssistant,
  onExportCsv,
}) => {
  const [activeTab, setActiveTab] = useState<
    'dash' | 'peserta' | 'bayar' | 'bank' | 'cetak' | 'laporan' | 'setting' | 'audit'
  >('dash');

  // Filters for Data Peserta
  const [searchPeserta, setSearchPeserta] = useState('');
  const [filterUkuran, setFilterUkuran] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Bank Form State
  const [bankForm, setBankForm] = useState<Partial<RekeningBank>>({
    namaBank: '',
    nomorRekening: '',
    atasNama: '',
    keterangan: '',
    status: 'AKTIF',
  });

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState<PengaturanEvent>(settings);

  // Bulk Print Filters
  const [printStatus, setPrintStatus] = useState('LUNAS');
  const [printStart, setPrintStart] = useState('');
  const [printEnd, setPrintEnd] = useState('');

  // Filter participants
  const filteredPeserta = participants.filter((p) => {
    const q = searchPeserta.toLowerCase().trim();
    const matchQ =
      !q ||
      p.noRegistrasi.toLowerCase().includes(q) ||
      p.nama.toLowerCase().includes(q) ||
      p.noHp.includes(q) ||
      p.club.toLowerCase().includes(q);
    const matchUkuran = !filterUkuran || p.ukuranJersey === filterUkuran;
    const matchStatus = !filterStatus || p.statusPembayaran === filterStatus;
    return matchQ && matchUkuran && matchStatus;
  });

  // Bulk print filtered list
  const bulkPrintList = participants.filter((p) => {
    if (p.statusRegistrasi === 'BATAL') return false;
    if (printStatus && p.statusPembayaran !== printStatus) return false;
    if (printStart && p.noRegistrasi.toLowerCase() < printStart.toLowerCase()) return false;
    if (printEnd && p.noRegistrasi.toLowerCase() > printEnd.toLowerCase()) return false;
    return true;
  });

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredPeserta.map((p) => p.noRegistrasi)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelectOne = (noReg: string) => {
    const next = new Set(selectedIds);
    if (next.has(noReg)) next.delete(noReg);
    else next.add(noReg);
    setSelectedIds(next);
  };

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.namaBank || !bankForm.nomorRekening || !bankForm.atasNama) {
      alert('Nama Bank, Nomor Rekening, dan Atas Nama wajib diisi!');
      return;
    }
    onSaveBank(bankForm);
    setBankForm({ namaBank: '', nomorRekening: '', atasNama: '', keterangan: '', status: 'AKTIF' });
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(settingsForm);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header Card */}
      <div className="glass-card p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Administrator Jelobar</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 uppercase">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-500">Panel Kontrol Utama & Manajemen Event Jelobar #2</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenAiAssistant}
            className="p-2.5 text-xs bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow"
          >
            <Sparkles className="w-4 h-4 text-amber-300" /> Asisten Gemini
          </button>
          <button
            onClick={onRefresh}
            className="p-2.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl flex items-center gap-1.5 font-semibold"
          >
            <RotateCw className="w-4 h-4 text-blue-600" /> Refresh
          </button>
          <button
            onClick={onLogout}
            className="p-2.5 text-xs bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 text-rose-600 dark:text-rose-300 rounded-xl flex items-center gap-1.5 font-semibold"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto pb-1 gap-2 border-b border-slate-200 dark:border-slate-800 text-sm font-medium">
        {[
          { id: 'dash', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'peserta', label: 'Data Peserta', icon: Users },
          { id: 'bayar', label: 'Verifikasi Pembayaran', icon: CreditCard },
          { id: 'bank', label: 'Rekening Bank', icon: Building2 },
          { id: 'cetak', label: 'Cetak Kartu Massal', icon: Printer },
          { id: 'laporan', label: 'Laporan & Rekap', icon: FileSpreadsheet },
          { id: 'setting', label: 'Pengaturan Event', icon: Sliders },
          { id: 'audit', label: 'Audit Log', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 font-bold ${
                isActive
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-950'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: DASHBOARD */}
      {activeTab === 'dash' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="glass-card p-4 rounded-2xl border-l-4 border-blue-600 shadow-sm">
              <div className="text-xs text-slate-500 uppercase font-semibold">Total Peserta</div>
              <div className="text-2xl font-black mt-1 font-heading text-slate-900 dark:text-white">
                {stats.totalPeserta}
              </div>
            </div>
            <div className="glass-card p-4 rounded-2xl border-l-4 border-rose-500 shadow-sm">
              <div className="text-xs text-slate-500 uppercase font-semibold">Belum Bayar</div>
              <div className="text-2xl font-black mt-1 font-heading text-rose-500">
                {stats.belumBayar}
              </div>
            </div>
            <div className="glass-card p-4 rounded-2xl border-l-4 border-amber-500 shadow-sm">
              <div className="text-xs text-slate-500 uppercase font-semibold">Menunggu Verifikasi</div>
              <div className="text-2xl font-black mt-1 font-heading text-amber-500">
                {stats.menungguVerifikasi}
              </div>
            </div>
            <div className="glass-card p-4 rounded-2xl border-l-4 border-emerald-500 shadow-sm">
              <div className="text-xs text-slate-500 uppercase font-semibold">Lunas</div>
              <div className="text-2xl font-black mt-1 font-heading text-emerald-500">
                {stats.lunas}
              </div>
            </div>
            <div className="glass-card p-4 rounded-2xl border-l-4 border-red-600 shadow-sm">
              <div className="text-xs text-slate-500 uppercase font-semibold">Ditolak</div>
              <div className="text-2xl font-black mt-1 font-heading text-red-600">
                {stats.ditolak}
              </div>
            </div>
            <div className="glass-card p-4 rounded-2xl border-l-4 border-teal-500 shadow-sm">
              <div className="text-xs text-slate-500 uppercase font-semibold">Total Dana</div>
              <div className="text-xl font-black mt-1 font-heading text-teal-600">
                Rp {stats.totalPembayaran.toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold font-heading">Peserta Terbaru Terdaftar</h3>
                <button onClick={() => setActiveTab('peserta')} className="text-xs font-semibold text-blue-600 hover:underline">
                  Lihat Semua &rarr;
                </button>
              </div>
              <div className="space-y-2">
                {participants.slice(0, 5).map((p) => (
                  <div
                    key={p.noRegistrasi}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-blue-600 font-mono">#{p.noRegistrasi}</span>
                      <span className="font-semibold">{p.nama}</span>
                      <span className="text-slate-400">({p.club})</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.statusPembayaran === 'LUNAS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {p.statusPembayaran}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold font-heading flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Asisten Pintar Gemini AI
                </h3>
                <button
                  onClick={onOpenAiAssistant}
                  className="px-3 py-1 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  Buka Asisten
                </button>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Gunakan Gemini AI untuk memindai bukti transfer secara otomatis (OCR Verifier), menghasilkan ringkasan eksekutif event, dan menyusun pesan WhatsApp broadcast pengingat bayar untuk peserta.
              </p>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300">
                <div className="font-bold">STATUS DATABASE REALTIME: AKTIF</div>
                <div className="text-[11px] mt-0.5">Semua data tersimpan otomatis di server & file persistensi.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DATA PESERTA */}
      {activeTab === 'peserta' && (
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-2xl border space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={onAddParticipant}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" /> Tambah Peserta Baru
                </button>
                <button
                  onClick={onExportCsv}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Ekspor CSV
                </button>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Total: {filteredPeserta.length} peserta
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t">
              <input
                type="text"
                value={searchPeserta}
                onChange={(e) => setSearchPeserta(e.target.value)}
                placeholder="Cari No Reg / Nama / HP / Club..."
                className="text-xs px-3 py-2 rounded-xl border bg-white dark:bg-slate-900"
              />
              <select
                value={filterUkuran}
                onChange={(e) => setFilterUkuran(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border bg-white dark:bg-slate-900"
              >
                <option value="">Semua Ukuran Jersey</option>
                {settings.UKURAN_JERSEY.split(',').map((sz) => (
                  <option key={sz} value={sz.trim()}>
                    {sz.trim()}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border bg-white dark:bg-slate-900"
              >
                <option value="">Semua Status Bayar</option>
                <option value="BELUM BAYAR">BELUM BAYAR</option>
                <option value="MENUNGGU VERIFIKASI">MENUNGGU VERIFIKASI</option>
                <option value="LUNAS">LUNAS</option>
                <option value="DITOLAK">DITOLAK</option>
              </select>
            </div>
          </div>

          <div className="glass-card rounded-2xl border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 font-bold uppercase border-b">
                  <tr>
                    <th className="p-3 text-center w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.size > 0 && selectedIds.size === filteredPeserta.length}
                        onChange={(e) => toggleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="p-3">NO REGISTRASI</th>
                    <th className="p-3">NAMA PESERTA</th>
                    <th className="p-3">CLUB</th>
                    <th className="p-3">JERSEY</th>
                    <th className="p-3 text-center">UKURAN</th>
                    <th className="p-3">TGL REGISTRASI</th>
                    <th className="p-3 text-center">STATUS BAYAR</th>
                    <th className="p-3 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPeserta.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-6 text-slate-400">
                        Tidak ada data yang cocok
                      </td>
                    </tr>
                  ) : (
                    filteredPeserta.map((p) => (
                      <tr key={p.noRegistrasi} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(p.noRegistrasi)}
                            onChange={() => toggleSelectOne(p.noRegistrasi)}
                          />
                        </td>
                        <td className="p-3 font-black text-blue-600 font-mono tracking-wider">
                          #{p.noRegistrasi}
                        </td>
                        <td className="p-3 font-semibold">
                          <div>{p.nama}</div>
                          <div className="text-[10px] text-slate-400">{p.noHp}</div>
                        </td>
                        <td className="p-3 uppercase font-medium">{p.club}</td>
                        <td className="p-3 uppercase">{p.namaJersey || '-'}</td>
                        <td className="p-3 text-center font-bold text-amber-500">{p.ukuranJersey}</td>
                        <td className="p-3 text-slate-500">{p.tanggalRegistrasi}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.statusPembayaran === 'LUNAS'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {p.statusPembayaran}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => onViewParticipant(p)} className="p-1 hover:bg-slate-100 rounded" title="Lihat">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => onEditParticipant(p)} className="p-1 text-amber-600 hover:bg-amber-50 rounded" title="Edit">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => onPrintCard(p)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Kartu">
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => onDeleteParticipant(p.noRegistrasi, p.nama)} className="p-1 text-rose-600 hover:bg-rose-50 rounded" title="Hapus">
                              <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* SUB-TAB 3: VERIFIKASI PEMBAYARAN */}
      {activeTab === 'bayar' && (
        <div className="glass-card rounded-2xl border overflow-hidden shadow-sm space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-heading">Riwayat & Verifikasi Pembayaran</h3>
            <span className="text-xs text-slate-500">{payments.length} transaksi</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold uppercase border-b">
                <tr>
                  <th className="p-3">ID TRX</th>
                  <th className="p-3">NO REGISTRASI</th>
                  <th className="p-3">NAMA PESERTA</th>
                  <th className="p-3 text-right">NOMINAL</th>
                  <th className="p-3 text-center">STATUS</th>
                  <th className="p-3 text-center">BUKTI</th>
                  <th className="p-3 text-center">VERIFIKASI</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-slate-400">
                      Belum ada transaksi pembayaran
                    </td>
                  </tr>
                ) : (
                  payments.map((trx) => (
                    <tr key={trx.idTransaksi} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono text-blue-600 font-semibold">{trx.idTransaksi}</td>
                      <td className="p-3 font-black text-amber-500 font-mono">#{trx.noRegistrasi}</td>
                      <td className="p-3 font-semibold">{trx.namaPeserta}</td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        Rp {trx.nominal.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            trx.status === 'LUNAS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {trx.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {trx.buktiPembayaran && trx.buktiPembayaran !== '-' ? (
                          <button
                            onClick={() => onOpenAiScan(trx)}
                            className="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 mx-auto shadow"
                          >
                            <Sparkles className="w-3 h-3 text-amber-300" /> Scan AI
                          </button>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onVerifyPayment(trx.idTransaksi, 'LUNAS')}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700"
                          >
                            Lunas
                          </button>
                          <button
                            onClick={() => onVerifyPayment(trx.idTransaksi, 'DITOLAK')}
                            className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold hover:bg-rose-700"
                          >
                            Tolak
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
      )}

      {/* SUB-TAB 4: REKENING BANK */}
      {activeTab === 'bank' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card p-5 rounded-2xl border space-y-4 h-fit">
            <h3 className="text-sm font-bold font-heading">Tambah / Edit Rekening Bank</h3>
            <form onSubmit={handleBankSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nama Bank</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BANK BCA"
                  value={bankForm.namaBank || ''}
                  onChange={(e) => setBankForm({ ...bankForm, namaBank: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 1234567890"
                  value={bankForm.nomorRekening || ''}
                  onChange={(e) => setBankForm({ ...bankForm, nomorRekening: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Atas Nama (A.n.)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PANITIA JELOBAR"
                  value={bankForm.atasNama || ''}
                  onChange={(e) => setBankForm({ ...bankForm, atasNama: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Keterangan</label>
                <input
                  type="text"
                  placeholder="Contoh: Rekening utama transfer"
                  value={bankForm.keterangan || ''}
                  onChange={(e) => setBankForm({ ...bankForm, keterangan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Status</label>
                <select
                  value={bankForm.status || 'AKTIF'}
                  onChange={(e) => setBankForm({ ...bankForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 font-bold"
                >
                  <option value="AKTIF">AKTIF (Tampil di Publik)</option>
                  <option value="NONAKTIF">NONAKTIF (Disembunyikan)</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow"
              >
                Simpan Rekening
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 glass-card rounded-2xl border overflow-hidden shadow-sm">
            <div className="p-4 border-b font-bold text-sm">Daftar Rekening Terdaftar</div>
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold uppercase">
                <tr>
                  <th className="p-3">BANK</th>
                  <th className="p-3">NO REKENING</th>
                  <th className="p-3">A.N.</th>
                  <th className="p-3 text-center">STATUS</th>
                  <th className="p-3 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bankAccounts.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="p-3 font-bold text-blue-600">{b.namaBank}</td>
                    <td className="p-3 font-mono font-bold">{b.nomorRekening}</td>
                    <td className="p-3 uppercase">{b.atasNama}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === 'AKTIF' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setBankForm(b)} className="p-1 hover:bg-slate-100 rounded" title="Edit">
                          <Edit className="w-3.5 h-3.5 text-amber-600" />
                        </button>
                        <button onClick={() => onToggleBank(b.id)} className="p-1 hover:bg-slate-100 rounded" title="Toggle">
                          {b.status === 'AKTIF' ? (
                            <ToggleRight className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-slate-400" />
                          )}
                        </button>
                        <button onClick={() => onDeleteBank(b.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded" title="Hapus">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: CETAK MASSAL */}
      {activeTab === 'cetak' && (
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={printStatus}
                onChange={(e) => setPrintStatus(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border bg-white dark:bg-slate-900"
              >
                <option value="">Semua Status Bayar</option>
                <option value="LUNAS">Hanya Status LUNAS</option>
              </select>
              <input
                type="text"
                placeholder="Start No Reg..."
                value={printStart}
                onChange={(e) => setPrintStart(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 w-28"
              />
              <input
                type="text"
                placeholder="End No Reg..."
                value={printEnd}
                onChange={(e) => setPrintEnd(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 w-28"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600">{bulkPrintList.length} Peserta Terpilih</span>
              <button
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Cetak / Download PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bulkPrintList.map((p) => (
              <div key={p.noRegistrasi} className="flex justify-center">
                <ParticipantCard participant={p} settings={settings} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: LAPORAN & REKAP */}
      {activeTab === 'laporan' && (
        <div className="glass-card p-6 rounded-2xl border space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-3">
            <div>
              <h3 className="text-base font-bold font-heading">REKAPITULASI & LAPORAN EVENT</h3>
              <p className="text-xs text-slate-500">Ringkasan laporan peserta, klub, jersey, dan keuangan.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => window.print()} className="px-3.5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5">
                <Printer className="w-4 h-4" /> Cetak Laporan
              </button>
              <button onClick={onExportCsv} className="px-3.5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5">
                <Download className="w-4 h-4" /> Ekspor CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-500">Rekap Klub / Komunitas</h4>
              <div className="space-y-1.5 text-xs max-h-60 overflow-y-auto">
                {Array.from(new Set(participants.map((p) => p.club))).map((club) => {
                  const count = participants.filter((p) => p.club === club).length;
                  return (
                    <div key={club} className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border">
                      <span className="font-semibold uppercase">{club}</span>
                      <span className="font-bold text-blue-600">{count} Peserta</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-500">Rekap Ukuran Jersey</h4>
              <div className="space-y-1.5 text-xs">
                {settings.UKURAN_JERSEY.split(',').map((sz) => {
                  const cleanSz = sz.trim();
                  const count = participants.filter((p) => p.ukuranJersey === cleanSz).length;
                  return (
                    <div key={cleanSz} className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border">
                      <span>Ukuran {cleanSz}</span>
                      <span className="font-bold text-amber-600">{count} Pcs</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-500">Ringkasan Keuangan</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border">
                  <span>Total Pendaftar</span>
                  <span className="font-bold">{stats.totalPeserta}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800">
                  <span>Lunas</span>
                  <span className="font-bold">{stats.lunas}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-800">
                  <span>Belum Bayar</span>
                  <span className="font-bold">{stats.belumBayar}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 font-bold">
                  <span>Total Dana Terkumpul</span>
                  <span>Rp {stats.totalPembayaran.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: PENGATURAN EVENT */}
      {activeTab === 'setting' && (
        <div className="glass-card p-6 rounded-2xl border space-y-4 max-w-3xl">
          <h3 className="text-base font-bold font-heading flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" /> Pengaturan Informasi Event
          </h3>
          <form onSubmit={handleSettingsSubmit} className="space-y-3 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Nama Resmi Event</label>
                <input
                  type="text"
                  required
                  value={settingsForm.NAMA_EVENT}
                  onChange={(e) => setSettingsForm({ ...settingsForm, NAMA_EVENT: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-900"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">URL Logo</label>
                <input
                  type="url"
                  required
                  value={settingsForm.LOGO}
                  onChange={(e) => setSettingsForm({ ...settingsForm, LOGO: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Tanggal Event</label>
                <input
                  type="date"
                  required
                  value={settingsForm.TANGGAL_EVENT}
                  onChange={(e) => setSettingsForm({ ...settingsForm, TANGGAL_EVENT: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Target Kuota</label>
                <input
                  type="number"
                  required
                  value={settingsForm.KUOTA}
                  onChange={(e) => setSettingsForm({ ...settingsForm, KUOTA: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Biaya Registrasi (Rp)</label>
                <input
                  type="number"
                  required
                  value={settingsForm.BIAYA}
                  onChange={(e) => setSettingsForm({ ...settingsForm, BIAYA: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">WhatsApp Admin</label>
                <input
                  type="text"
                  required
                  value={settingsForm.WA_ADMIN}
                  onChange={(e) => setSettingsForm({ ...settingsForm, WA_ADMIN: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-900"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Lokasi Event</label>
                <input
                  type="text"
                  required
                  value={settingsForm.LOKASI}
                  onChange={(e) => setSettingsForm({ ...settingsForm, LOKASI: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-900"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Ukuran Jersey (Pisah Koma)</label>
                <input
                  type="text"
                  required
                  value={settingsForm.UKURAN_JERSEY}
                  onChange={(e) => setSettingsForm({ ...settingsForm, UKURAN_JERSEY: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-900"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Deskripsi Event</label>
                <textarea
                  rows={2}
                  value={settingsForm.DESKRIPSI_EVENT}
                  onChange={(e) => setSettingsForm({ ...settingsForm, DESKRIPSI_EVENT: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-900"
                />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow">
              Simpan Pengaturan Event
            </button>
          </form>
        </div>
      )}

      {/* SUB-TAB 8: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="glass-card rounded-2xl border overflow-hidden shadow-sm space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-heading">Catatan Aktivitas Sistem (Audit Log)</h3>
            <span className="text-xs text-slate-500">{auditLogs.length} catatan</span>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 font-bold uppercase">
              <tr>
                <th className="p-2.5">TIMESTAMP</th>
                <th className="p-2.5">USER</th>
                <th className="p-2.5">AKSI</th>
                <th className="p-2.5">NO REG</th>
                <th className="p-2.5">KETERANGAN</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="p-2.5 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-2.5 font-semibold text-blue-600">{log.username}</td>
                  <td className="p-2.5 font-bold uppercase">{log.aksi}</td>
                  <td className="p-2.5 font-mono text-amber-600">{log.noRegistrasi || '-'}</td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-300">{log.keterangan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
