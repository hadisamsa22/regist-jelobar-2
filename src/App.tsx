import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { CekDataView } from './components/CekDataView';
import { AdminView } from './components/AdminView';
import {
  RegistrationModal,
  PaymentModal,
  SuccessModal,
  LoginModal,
} from './components/Modals';
import { AiAssistantModal } from './components/AiAssistantModal';
import { AiReceiptModal } from './components/AiReceiptModal';
import { ParticipantCard } from './components/ParticipantCard';
import type {
  Peserta,
  Pembayaran,
  RekeningBank,
  PengaturanEvent,
  AuditLog,
  DashboardStats,
  UserSession,
} from './types';
import { X, Printer, Phone } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState<'landing' | 'cekData' | 'admin'>('landing');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('jelobar_theme') === 'dark';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Data State
  const [settings, setSettings] = useState<PengaturanEvent>({
    NAMA_EVENT: 'FORM REGISTRASI JELOBAR #2',
    LOGO: 'https://b.top4top.io/p_39179gqj91.png',
    TANGGAL_EVENT: '2026-10-18',
    LOKASI: 'Kantor Bupati Lombok Barat',
    KUOTA: '1000',
    BIAYA: '150000',
    UKURAN_JERSEY: 'XS,S,M,L,XL,XXL,XXXL,XXXXL',
    WA_ADMIN: '6281234567890',
    DESKRIPSI_EVENT:
      'Trabas Akbar Jelobar #2 2027! Nikmati rute pemandangan alam terbaik, jersey eksklusif, dan doorprize spektakuler.',
    INFO_PEMBAYARAN:
      'Silakan lakukan transfer sesuai nominal ke rekening bank resmi di bawah ini. Harap simpan dan unggah bukti transfer untuk verifikasi admin.',
    INFO_KARTU:
      'Kartu Peserta Resmi Event Jelobar. Wajib ditunjukkan saat pengambilan jersey & rute acara.',
  });

  const [bankAccounts, setBankAccounts] = useState<RekeningBank[]>([]);
  const [participants, setParticipants] = useState<Peserta[]>([]);
  const [payments, setPayments] = useState<Pembayaran[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [bookedNumbers, setBookedNumbers] = useState<Array<{ noRegistrasi: string; status: string }>>([]);
  const [stats, setStats] = useState<DashboardStats>({
    kuota: 1000,
    totalPeserta: 0,
    pesertaAktif: 0,
    sisaKuota: 1000,
    belumBayar: 0,
    menungguVerifikasi: 0,
    lunas: 0,
    ditolak: 0,
    totalPembayaran: 0,
  });

  // User Auth Session
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    const saved = sessionStorage.getItem('jelobar_admin_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Modal Visibility States
  const [showRegModal, setShowRegModal] = useState(false);
  const [regModalNoReg, setRegModalNoReg] = useState('');
  const [regIsAdminMode, setRegIsAdminMode] = useState(false);

  const [showPayModal, setShowPayModal] = useState(false);
  const [payModalNoReg, setPayModalNoReg] = useState('');

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastRegistered, setLastRegistered] = useState<Peserta | null>(null);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAiAssistantModal, setShowAiAssistantModal] = useState(false);
  const [aiAssistantTargetParticipant, setAiAssistantTargetParticipant] = useState<Peserta | null>(null);

  const [showAiScanModal, setShowAiScanModal] = useState(false);
  const [selectedScanPayment, setSelectedScanPayment] = useState<Pembayaran | null>(null);

  const [previewCardParticipant, setPreviewCardParticipant] = useState<Peserta | null>(null);
  const [detailParticipant, setDetailParticipant] = useState<Peserta | null>(null);

  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);

  // Sync Dark Mode with DOM
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('jelobar_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('jelobar_theme', 'light');
    }
  }, [darkMode]);

  // Initial & Polling Data Sync
  useEffect(() => {
    loadPublicData();
    if (userSession) {
      loadAdminData();
    }

    const interval = setInterval(() => {
      loadPublicData();
      if (userSession) {
        loadAdminData();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [userSession]);

  const loadPublicData = async () => {
    try {
      const res = await fetch('/api/public-data');
      const data = await res.json();
      if (data.success) {
        if (data.settings) setSettings(data.settings);
        if (data.bankAccounts) setBankAccounts(data.bankAccounts);
        if (data.bookedNumbers) setBookedNumbers(data.bookedNumbers);
      }
    } catch (e) {
      console.error('Error fetching public data', e);
    }
  };

  const loadAdminData = async () => {
    try {
      const [resPeserta, resPay, resBanks, resAudit] = await Promise.all([
        fetch('/api/peserta'),
        fetch('/api/pembayaran'),
        fetch('/api/bank-accounts'),
        fetch('/api/audit-logs'),
      ]);

      const dataPeserta = await resPeserta.json();
      if (dataPeserta.success) {
        setParticipants(dataPeserta.data);
        if (dataPeserta.stats) setStats(dataPeserta.stats);
      }

      const dataPay = await resPay.json();
      if (dataPay.success) setPayments(dataPay.data);

      const dataBanks = await resBanks.json();
      if (dataBanks.success) setBankAccounts(dataBanks.data);

      const dataAudit = await resAudit.json();
      if (dataAudit.success) setAuditLogs(dataAudit.data);
    } catch (e) {
      console.error('Error fetching admin data', e);
    }
  };

  const handleCopyBank = (rek: string, bank: string) => {
    navigator.clipboard.writeText(rek);
    setCopiedBankId(rek);
    setTimeout(() => setCopiedBankId(null), 2500);
  };

  const handleRegistrationSuccess = (newParticipant: Peserta) => {
    setLastRegistered(newParticipant);
    setShowSuccessModal(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    loadPublicData();
    if (userSession) loadAdminData();
  };

  const handleLoginSuccess = (session: UserSession) => {
    setUserSession(session);
    sessionStorage.setItem('jelobar_admin_session', JSON.stringify(session));
    setActivePage('admin');
    loadAdminData();
  };

  const handleLogout = () => {
    setUserSession(null);
    sessionStorage.removeItem('jelobar_admin_session');
    setActivePage('landing');
  };

  const handleVerifyPayment = async (idTransaksi: string, status: 'LUNAS' | 'DITOLAK') => {
    try {
      const res = await fetch('/api/pembayaran/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idTransaksi, status }),
      });
      const data = await res.json();
      if (data.success) {
        loadAdminData();
        loadPublicData();
      }
    } catch (err) {
      alert('Gagal memverifikasi');
    }
  };

  const handleSaveBank = async (bankData: Partial<RekeningBank>) => {
    try {
      const res = await fetch('/api/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankData),
      });
      const data = await res.json();
      if (data.success) {
        loadAdminData();
        loadPublicData();
      }
    } catch {
      alert('Gagal menyimpan bank');
    }
  };

  const handleToggleBank = async (id: string) => {
    try {
      const res = await fetch(`/api/bank-accounts/${id}/toggle`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        loadAdminData();
        loadPublicData();
      }
    } catch {
      alert('Gagal mengubah status');
    }
  };

  const handleDeleteBank = async (id: string) => {
    if (!confirm('Yakin ingin menghapus rekening ini?')) return;
    try {
      const res = await fetch(`/api/bank-accounts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadAdminData();
        loadPublicData();
      }
    } catch {
      alert('Gagal menghapus');
    }
  };

  const handleSaveSettings = async (newSettings: Partial<PengaturanEvent>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      const data = await res.json();
      if (data.success) {
        alert('Pengaturan berhasil disimpan!');
        setSettings(data.settings);
        loadPublicData();
      }
    } catch {
      alert('Gagal menyimpan pengaturan');
    }
  };

  const handleDeleteParticipant = async (noReg: string, nama: string) => {
    if (!confirm(`Hapus data peserta ${nama} (#${noReg})?`)) return;
    try {
      const res = await fetch(`/api/peserta/${encodeURIComponent(noReg)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadAdminData();
        loadPublicData();
      }
    } catch {
      alert('Gagal menghapus peserta');
    }
  };

  const handleExportCsv = () => {
    if (participants.length === 0) {
      alert('Belum ada data peserta untuk diekspor');
      return;
    }
    const headers = [
      'NO_REGISTRASI',
      'NAMA',
      'NO_HP',
      'CLUB',
      'NAMA_JERSEY',
      'UKURAN_JERSEY',
      'STATUS_REGISTRASI',
      'STATUS_PEMBAYARAN',
      'TANGGAL_REGISTRASI',
    ];
    let csv = '\uFEFF' + headers.join(',') + '\n';
    participants.forEach((p) => {
      const row = [
        `"${p.noRegistrasi}"`,
        `"${p.nama}"`,
        `"${p.noHp}"`,
        `"${p.club}"`,
        `"${p.namaJersey || p.nama}"`,
        `"${p.ukuranJersey}"`,
        `"${p.statusRegistrasi}"`,
        `"${p.statusPembayaran}"`,
        `"${p.tanggalRegistrasi}"`,
      ];
      csv += row.join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DATA_PESERTA_JELOBAR_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const sizes = (settings.UKURAN_JERSEY || 'XS,S,M,L,XL,XXL,XXXL,XXXXL')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200 bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 font-sans">
      <Navbar
        settings={settings}
        activePage={activePage}
        setActivePage={(p) => setActivePage(p as any)}
        openRegistrasi={() => {
          setRegIsAdminMode(false);
          setRegModalNoReg('');
          setShowRegModal(true);
        }}
        openPembayaran={() => {
          setPayModalNoReg('');
          setShowPayModal(true);
        }}
        openAiAssistant={() => setShowAiAssistantModal(true)}
        openLogin={() => setShowLoginModal(true)}
        userSession={userSession}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className="flex-grow">
        {activePage === 'landing' && (
          <LandingView
            settings={settings}
            bankAccounts={bankAccounts}
            openRegistrasi={() => {
              setRegIsAdminMode(false);
              setRegModalNoReg('');
              setShowRegModal(true);
            }}
            openPembayaran={() => {
              setPayModalNoReg('');
              setShowPayModal(true);
            }}
            openAiAssistant={() => setShowAiAssistantModal(true)}
            goToCekData={() => setActivePage('cekData')}
            onCopyBank={handleCopyBank}
            copiedBankId={copiedBankId}
          />
        )}

        {activePage === 'cekData' && (
          <CekDataView
            bookedNumbers={bookedNumbers}
            onSelectAvailableNumber={(no) => {
              setRegIsAdminMode(false);
              setRegModalNoReg(no);
              setShowRegModal(true);
            }}
            openRegistrasi={() => {
              setRegIsAdminMode(false);
              setRegModalNoReg('');
              setShowRegModal(true);
            }}
          />
        )}

        {activePage === 'admin' && (
          <AdminView
            stats={stats}
            participants={participants}
            payments={payments}
            bankAccounts={bankAccounts}
            settings={settings}
            auditLogs={auditLogs}
            onRefresh={() => {
              loadAdminData();
              loadPublicData();
            }}
            onLogout={handleLogout}
            onAddParticipant={() => {
              setRegIsAdminMode(true);
              setRegModalNoReg('');
              setShowRegModal(true);
            }}
            onViewParticipant={(p) => setDetailParticipant(p)}
            onEditParticipant={(p) => {
              setDetailParticipant(p);
            }}
            onDeleteParticipant={handleDeleteParticipant}
            onPrintCard={(p) => setPreviewCardParticipant(p)}
            onVerifyPayment={handleVerifyPayment}
            onOpenAiScan={(payment) => {
              setSelectedScanPayment(payment);
              setShowAiScanModal(true);
            }}
            onSaveBank={handleSaveBank}
            onToggleBank={handleToggleBank}
            onDeleteBank={handleDeleteBank}
            onSaveSettings={handleSaveSettings}
            onOpenAiAssistant={() => setShowAiAssistantModal(true)}
            onExportCsv={handleExportCsv}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700 dark:text-slate-300">{settings.NAMA_EVENT} &copy; 2026</p>
        <p className="mt-1">
          Aplikasi Registrasi Realtime & Database Cloud &bull; WhatsApp Admin: {settings.WA_ADMIN}
        </p>
      </footer>

      {/* Modals */}
      <RegistrationModal
        isOpen={showRegModal}
        onClose={() => setShowRegModal(false)}
        sizes={sizes}
        settings={settings}
        onSuccess={handleRegistrationSuccess}
        initialNoReg={regModalNoReg}
        isAdminMode={regIsAdminMode}
      />

      <PaymentModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        bankAccounts={bankAccounts}
        defaultNoReg={payModalNoReg}
        onPaymentSubmitted={() => {
          loadPublicData();
          if (userSession) loadAdminData();
        }}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        participant={lastRegistered}
        onOpenPayment={() => {
          if (lastRegistered) setPayModalNoReg(lastRegistered.noRegistrasi);
          setShowPayModal(true);
        }}
        onPrintCard={() => {
          if (lastRegistered) setPreviewCardParticipant(lastRegistered);
        }}
        adminWa={settings.WA_ADMIN}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <AiAssistantModal
        isOpen={showAiAssistantModal}
        onClose={() => setShowAiAssistantModal(false)}
        participants={participants}
        stats={stats}
        selectedParticipant={aiAssistantTargetParticipant}
      />

      <AiReceiptModal
        isOpen={showAiScanModal}
        onClose={() => {
          setShowAiScanModal(false);
          setSelectedScanPayment(null);
        }}
        payment={selectedScanPayment}
        onApprove={(id) => handleVerifyPayment(id, 'LUNAS')}
        onReject={(id) => handleVerifyPayment(id, 'DITOLAK')}
      />

      {/* Participant Card Preview Modal */}
      {previewCardParticipant && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 text-center my-6">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold font-heading">KARTU PESERTA RESMI</h3>
              <button
                onClick={() => setPreviewCardParticipant(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center py-2">
              <ParticipantCard participant={previewCardParticipant} settings={settings} />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Cetak / Download PDF
              </button>
              <button
                onClick={() => setPreviewCardParticipant(null)}
                className="px-4 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Participant Detail Modal */}
      {detailParticipant && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card bg-white dark:bg-slate-900 border rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 my-6">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-base font-bold font-heading">DETAIL PESERTA</h3>
              <button onClick={() => setDetailParticipant(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-400">NO REGISTRASI:</span>
                <span className="font-black text-amber-500 text-sm font-mono">#{detailParticipant.noRegistrasi}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-400">NAMA LENGKAP:</span>
                <span className="font-bold">{detailParticipant.nama}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-400">WHATSAPP / HP:</span>
                <span className="font-semibold">{detailParticipant.noHp}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-400">CLUB:</span>
                <span className="font-bold text-blue-600">{detailParticipant.club}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-400">NAMA JERSEY:</span>
                <span className="font-semibold uppercase">{detailParticipant.namaJersey || '-'}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-400">UKURAN JERSEY:</span>
                <span className="font-bold text-amber-500">{detailParticipant.ukuranJersey}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-400">STATUS BAYAR:</span>
                <span className="font-bold text-emerald-600">{detailParticipant.statusPembayaran}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-400">ALAMAT:</span>
                <span>{detailParticipant.alamat || '-'}</span>
              </div>
              {detailParticipant.buktiPembayaran && detailParticipant.buktiPembayaran !== '-' && (
                <div>
                  <span className="text-slate-400 block mb-1">BUKTI PEMBAYARAN:</span>
                  <img
                    src={detailParticipant.buktiPembayaran}
                    alt="Bukti Transfer"
                    className="max-h-48 rounded-xl border object-contain bg-black/5"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => {
                  let clean = detailParticipant.noHp.replace(/\D/g, '');
                  if (clean.startsWith('0')) clean = '62' + clean.slice(1);
                  window.open(`https://wa.me/${clean}`, '_blank');
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" /> Chat WhatsApp
              </button>
              <button
                onClick={() => setDetailParticipant(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden print area for bulk / individual prints */}
      <div id="printArea" className="hidden"></div>
    </div>
  );
}
