import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';
import type { Pembayaran } from '../types';

interface AiReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Pembayaran | null;
  onApprove: (idTransaksi: string) => void;
  onReject: (idTransaksi: string) => void;
}

export const AiReceiptModal: React.FC<AiReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
  onApprove,
  onReject,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen || !payment) return null;

  const handleStartScan = async () => {
    if (!payment.buktiPembayaran || payment.buktiPembayaran === '-') return;
    setIsScanning(true);
    try {
      const res = await fetch('/api/gemini/analyze-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: payment.buktiPembayaran,
          expectedAmount: payment.nominal,
        }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setResult(data.analysis);
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold font-heading">Gemini AI OCR Verifier</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Bukti Transfer Asli:</span>
            {payment.buktiPembayaran && payment.buktiPembayaran !== '-' ? (
              <img
                src={payment.buktiPembayaran}
                alt="Bukti Transfer"
                className="w-full max-h-60 object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-black/5"
              />
            ) : (
              <div className="p-8 text-center bg-slate-100 rounded-xl text-slate-400">Tidak ada bukti</div>
            )}
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-slate-400 block text-[10px]">PESERTA</span>
              <span className="font-bold text-sm block">{payment.namaPeserta} (#{payment.noRegistrasi})</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">NOMINAL SISTEM</span>
              <span className="font-black text-emerald-600 text-sm">Rp {payment.nominal.toLocaleString('id-ID')}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">REKENING TUJUAN</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{payment.rekeningTujuan}</span>
            </div>

            <button
              onClick={handleStartScan}
              disabled={isScanning || !payment.buktiPembayaran || payment.buktiPembayaran === '-'}
              className="w-full mt-2 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Memindai Bukti...' : 'Scan Bukti dengan Gemini AI'}
            </button>
          </div>
        </div>

        {result && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-[10px] text-slate-500">Hasil Analisis Gemini:</span>
              <span
                className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  result.keabsahan === 'VALID'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {result.keabsahan}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">Nominal Terdeteksi:</span>
                <span className="font-bold text-emerald-600">
                  {result.nominal ? `Rp ${result.nominal.toLocaleString('id-ID')}` : 'Tidak terbaca'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Bank / QRIS:</span>
                <span className="font-bold">{result.bankTujuan}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Nama Pengirim:</span>
                <span className="font-medium">{result.namaPengirim}</span>
              </div>
              <div>
                <span className="text-slate-400 block">No Referensi:</span>
                <span className="font-mono text-[10px]">{result.nomorReferensi}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
              {result.catatanAnalisis}
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t">
          <button
            onClick={() => {
              onReject(payment.idTransaksi);
              onClose();
            }}
            className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold rounded-xl text-xs flex items-center gap-1"
          >
            <XCircle className="w-4 h-4" /> Tolak Bukti
          </button>
          <button
            onClick={() => {
              onApprove(payment.idTransaksi);
              onClose();
            }}
            className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-xl text-xs flex items-center gap-1 shadow"
          >
            <CheckCircle2 className="w-4 h-4" /> Setujui LUNAS
          </button>
        </div>
      </div>
    </div>
  );
};
