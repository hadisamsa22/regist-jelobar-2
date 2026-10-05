import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { Peserta, PengaturanEvent } from '../types';

interface ParticipantCardProps {
  participant: Peserta;
  settings: PengaturanEvent;
  isPrintVersion?: boolean;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  settings,
  isPrintVersion = false,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const regId = participant.noRegistrasi || participant.id;
  const clubName = participant.club || participant.asalInstansi || 'Perorangan';
  const logoUrl = settings.LOGO || 'https://b.top4top.io/p_39179gqj91.png';
  const qrContent =
    participant.qrCodeText ||
    `${regId}|${participant.nama}|${clubName}|${participant.ukuranJersey}`;

  useEffect(() => {
    QRCode.toDataURL(qrContent, {
      width: 140,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Error generating QR Code', err));
  }, [qrContent]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LUNAS':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
      case 'MENUNGGU VERIFIKASI':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30';
      case 'BELUM BAYAR':
        return 'bg-rose-500/20 text-rose-300 border-rose-400/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
    }
  };

  return (
    <div
      className={`participant-card-print relative overflow-hidden rounded-3xl p-5 text-white transition-all shadow-xl font-sans ${
        isPrintVersion
          ? 'w-full max-w-[380px] bg-slate-900 border border-slate-700'
          : 'w-full max-w-[400px] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 border border-blue-500/30'
      }`}
    >
      {/* Decorative Blur Background Element */}
      <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-12 -top-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-3 relative z-10">
        <div className="flex items-center space-x-3">
          <img
            src={logoUrl}
            alt="Logo Event"
            className="h-10 w-auto object-contain bg-white rounded-xl p-1 shadow-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80?text=JELOBAR';
            }}
          />
          <div>
            <div className="text-[10px] font-black tracking-widest text-amber-400 uppercase">
              KARTU PESERTA RESMI
            </div>
            <div className="text-xs font-black font-heading tracking-tight text-white line-clamp-1">
              {settings.NAMA_EVENT}
            </div>
          </div>
        </div>

        <span
          className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${getStatusColor(
            participant.statusPembayaran
          )}`}
        >
          {participant.statusPembayaran}
        </span>
      </div>

      {/* Card Body */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="space-y-2 flex-1">
          <div>
            <div className="text-[9px] text-blue-300 font-bold uppercase tracking-wider">
              NO REGISTRASI
            </div>
            <div className="text-2xl font-black font-mono tracking-wider text-amber-400">
              #{regId}
            </div>
          </div>

          <div>
            <div className="text-[9px] text-blue-300 font-bold uppercase">
              NAMA PESERTA
            </div>
            <div className="text-sm font-extrabold text-white uppercase line-clamp-1">
              {participant.nama}
            </div>
          </div>

          <div>
            <div className="text-[9px] text-blue-300 font-bold uppercase">
              CLUB / KOMUNITAS
            </div>
            <div className="text-xs font-bold text-slate-200 uppercase line-clamp-1">
              {clubName}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-xs">
            <div>
              <div className="text-[8px] text-blue-300 uppercase font-semibold">
                NAMA JERSEY
              </div>
              <div className="font-bold text-white text-[11px] truncate uppercase">
                {participant.namaJersey || participant.nama}
              </div>
            </div>
            <div>
              <div className="text-[8px] text-blue-300 uppercase font-semibold">
                UKURAN JERSEY
              </div>
              <div className="font-extrabold text-amber-400 text-xs">
                {participant.ukuranJersey}
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center bg-white p-2 rounded-2xl shadow-lg flex-shrink-0">
          {qrCodeDataUrl ? (
            <img
              src={qrCodeDataUrl}
              alt={`QR Code ${regId}`}
              className="w-20 h-20 object-contain rounded-lg"
            />
          ) : (
            <div className="w-20 h-20 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
              Loading QR...
            </div>
          )}
          <span className="text-[9px] font-black text-slate-900 mt-1 font-mono tracking-wider">
            {regId}
          </span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400 relative z-10">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
          Terverifikasi Sistem
        </span>
        <span className="italic">Wajib dibawa saat pengambilan race pack</span>
      </div>
    </div>
  );
};
