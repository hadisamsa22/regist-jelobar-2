import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, Send, CheckCircle2, AlertTriangle, TrendingUp, RefreshCw, X, Copy } from 'lucide-react';
import type { Peserta, DashboardStats } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Peserta[];
  stats: DashboardStats;
  selectedParticipant?: Peserta | null;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  participants,
  stats,
  selectedParticipant,
}) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'insights'>('whatsapp');
  const [msgType, setMsgType] = useState<'REMINDER_BAYAR' | 'KONFIRMASI_LUNAS' | 'INFO_JERSEY'>('REMINDER_BAYAR');
  const [chosenParticipant, setChosenParticipant] = useState<Peserta | null>(selectedParticipant || null);
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [insights, setInsights] = useState<{
    ringkasan?: string;
    analisaKlub?: string;
    rekomendasiPanitia?: string[];
  } | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  useEffect(() => {
    if (selectedParticipant) {
      setChosenParticipant(selectedParticipant);
    } else if (participants.length > 0 && !chosenParticipant) {
      const unpaid = participants.find((p) => p.statusPembayaran === 'BELUM BAYAR');
      setChosenParticipant(unpaid || participants[0]);
    }
  }, [selectedParticipant, participants]);

  useEffect(() => {
    if (isOpen && activeTab === 'insights' && !insights) {
      fetchInsights();
    }
  }, [isOpen, activeTab]);

  const fetchInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const res = await fetch('/api/gemini/insights');
      const data = await res.json();
      if (data.success && data.insights) {
        setInsights(data.insights);
      }
    } catch (err) {
      console.error('Failed to fetch Gemini insights:', err);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleGenerateWhatsApp = async () => {
    if (!chosenParticipant) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/gemini/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: msgType,
          participant: {
            noRegistrasi: chosenParticipant.noRegistrasi,
            nama: chosenParticipant.nama,
            club: chosenParticipant.club,
            ukuranJersey: chosenParticipant.ukuranJersey,
            nominal: chosenParticipant.nominal || 150000,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setGeneratedMessage(data.message);
      }
    } catch (err) {
      console.error('Error generating WhatsApp message with Gemini:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSendToWhatsApp = () => {
    if (!chosenParticipant || !generatedMessage) return;
    let cleanPhone = chosenParticipant.noHp.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(generatedMessage)}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-4 my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-black font-heading text-slate-900 dark:text-white flex items-center gap-2">
                Gemini Intelligence Asisten
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full uppercase">
                  gemini-3.8-flash
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Otomatisasi pesan WhatsApp & ringkasan eksekutif event realtime
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition ${
              activeTab === 'whatsapp'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            WhatsApp Generator
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition ${
              activeTab === 'insights'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Executive Insights & Rekomendasi
          </button>
        </div>

        {/* TAB 1: WHATSAPP GENERATOR */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-xs">Pilih Peserta Target</label>
                <select
                  value={chosenParticipant?.noRegistrasi || ''}
                  onChange={(e) => {
                    const found = participants.find((p) => p.noRegistrasi === e.target.value);
                    if (found) setChosenParticipant(found);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                >
                  {participants.map((p) => (
                    <option key={p.noRegistrasi} value={p.noRegistrasi}>
                      #{p.noRegistrasi} - {p.nama} ({p.statusPembayaran})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-xs">Jenis Pesan</label>
                <select
                  value={msgType}
                  onChange={(e) => setMsgType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-blue-600"
                >
                  <option value="REMINDER_BAYAR">Pengingat Pembayaran (Belum Bayar)</option>
                  <option value="KONFIRMASI_LUNAS">Konfirmasi Lunas & Kartu Peserta</option>
                  <option value="INFO_JERSEY">Pengambilan Jersey & Jadwal Event</option>
                </select>
              </div>
            </div>

            {chosenParticipant && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">TARGET PESERTA</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {chosenParticipant.nama} (#{chosenParticipant.noRegistrasi})
                  </span>
                  <span className="text-slate-500 ml-1">[{chosenParticipant.club}]</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Jersey: {chosenParticipant.ukuranJersey}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    {chosenParticipant.noHp}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleGenerateWhatsApp}
              disabled={isGenerating}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              {isGenerating ? 'Gemini Sedang Menyusun Pesan...' : 'Buat Draf Pesan Cerdas Sekarang'}
            </button>

            {generatedMessage && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Draf Pesan WhatsApp:
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copySuccess ? 'Tersalin!' : 'Salin Teks'}
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={generatedMessage}
                  onChange={(e) => setGeneratedMessage(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-sans leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleSendToWhatsApp}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-2 transition"
                  >
                    <Send className="w-4 h-4" />
                    Buka Langsung di WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EXECUTIVE INSIGHTS */}
        {activeTab === 'insights' && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Analisis real-time berdasarkan data pendaftaran, kuota, klub, dan rekapitulasi dana.
              </span>
              <button
                onClick={fetchInsights}
                disabled={isLoadingInsights}
                className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isLoadingInsights ? 'animate-spin' : ''}`} />
                Segarkan Analisis
              </button>
            </div>

            {isLoadingInsights ? (
              <div className="p-8 text-center space-y-2">
                <Sparkles className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-semibold">Gemini sedang menganalisis dataset event...</p>
              </div>
            ) : insights ? (
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-2xl space-y-1.5">
                  <div className="font-extrabold text-blue-900 dark:text-blue-300 text-xs uppercase flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Ringkasan Eksekutif
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {insights.ringkasan}
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-1.5">
                  <div className="font-extrabold text-emerald-900 dark:text-emerald-300 text-xs uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Analisis Klub & Permintaan Jersey
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {insights.analisaKlub}
                  </p>
                </div>

                {insights.rekomendasiPanitia && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-2">
                    <div className="font-extrabold text-amber-900 dark:text-amber-300 text-xs uppercase flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Rekomendasi Tindakan Panitia
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {insights.rekomendasiPanitia.map((rek, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="font-black text-amber-600">{idx + 1}.</span>
                          <span>{rek}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
