import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

// Initialize GoogleGenAI client with required telemetry header
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface ReceiptAnalysisResult {
  nominal: number | null;
  bankTujuan: string;
  namaPengirim: string;
  namaPenerima: string;
  tanggal: string;
  nomorReferensi: string;
  keabsahan: 'VALID' | 'MENCURIGAKAN' | 'BURAM';
  rekomendasi: 'SETUJUI_LUNAS' | 'PERLU_CEK_MANUAL' | 'TOLAK';
  catatanAnalisis: string;
  rawText?: string;
}

export async function analyzeReceiptWithGemini(
  base64ImageWithHeader: string,
  expectedAmount: number
): Promise<ReceiptAnalysisResult> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return {
        nominal: expectedAmount,
        bankTujuan: 'Terdeteksi',
        namaPengirim: 'Terdeteksi',
        namaPenerima: 'Panitia Jelobar',
        tanggal: new Date().toISOString().split('T')[0],
        nomorReferensi: 'REF-' + Math.floor(100000 + Math.random() * 900000),
        keabsahan: 'VALID',
        rekomendasi: 'PERLU_CEK_MANUAL',
        catatanAnalisis: 'Mode pengujian: API Key belum dikonfigurasi, silakan verifikasi manual.',
      };
    }

    // Extract mime type and raw base64
    let mimeType = 'image/jpeg';
    let base64Data = base64ImageWithHeader;

    if (base64ImageWithHeader.startsWith('data:')) {
      const match = base64ImageWithHeader.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    const prompt = `Anda adalah asisten OCR & Auditor Pembayaran untuk panitia Event Trabas Jelobar.
Tugas Anda adalah memeriksa foto struk/bukti transfer bank/QRIS/m-banking yang dilampirkan.
Biaya pendaftaran resmi event adalah: Rp ${expectedAmount.toLocaleString('id-ID')}.

Periksa secara seksama:
1. Nominal uang yang ditransfer (apakah sesuai Rp ${expectedAmount} atau beda).
2. Nama Bank tujuan atau QRIS.
3. Nama penerima atau atas nama.
4. Nama pengirim / rekening asal.
5. Tanggal dan jam transfer.
6. Nomor referensi / ID transaksi bank.
7. Apakah bukti terlihat asli (screenshot m-banking asli) atau ada indikasi editan/buram/tidak terbaca.

Berikan analisis dalam format JSON terstruktur.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nominal: {
              type: Type.NUMBER,
              description: 'Nominal transfer yang tertera pada struk dalam angka bulat, contoh: 150000',
            },
            bankTujuan: {
              type: Type.STRING,
              description: 'Nama bank atau layanan tujuan (BCA, Mandiri, BRI, QRIS, dll)',
            },
            namaPengirim: {
              type: Type.STRING,
              description: 'Nama pengirim rekening/pengguna yang tertera',
            },
            namaPenerima: {
              type: Type.STRING,
              description: 'Nama penerima transfer',
            },
            tanggal: {
              type: Type.STRING,
              description: 'Tanggal transfer terdeteksi (YYYY-MM-DD atau teks tanggal)',
            },
            nomorReferensi: {
              type: Type.STRING,
              description: 'Nomor referensi / nomor struk / jurnal transaksi',
            },
            keabsahan: {
              type: Type.STRING,
              description: 'Pilihan: VALID, MENCURIGAKAN, atau BURAM',
            },
            rekomendasi: {
              type: Type.STRING,
              description: 'Pilihan: SETUJUI_LUNAS, PERLU_CEK_MANUAL, atau TOLAK',
            },
            catatanAnalisis: {
              type: Type.STRING,
              description: 'Penjelasan ringkas hasil analisa dalam Bahasa Indonesia untuk panitia.',
            },
          },
          required: [
            'bankTujuan',
            'keabsahan',
            'rekomendasi',
            'catatanAnalisis',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      nominal: typeof parsed.nominal === 'number' ? parsed.nominal : null,
      bankTujuan: parsed.bankTujuan || 'Tidak terdeteksi',
      namaPengirim: parsed.namaPengirim || 'Tidak tertera',
      namaPenerima: parsed.namaPenerima || 'Tidak tertera',
      tanggal: parsed.tanggal || new Date().toISOString().split('T')[0],
      nomorReferensi: parsed.nomorReferensi || '-',
      keabsahan: ['VALID', 'MENCURIGAKAN', 'BURAM'].includes(parsed.keabsahan)
        ? parsed.keabsahan
        : 'BURAM',
      rekomendasi: ['SETUJUI_LUNAS', 'PERLU_CEK_MANUAL', 'TOLAK'].includes(
        parsed.rekomendasi
      )
        ? parsed.rekomendasi
        : 'PERLU_CEK_MANUAL',
      catatanAnalisis:
        parsed.catatanAnalisis || 'Struk telah dianalisis oleh AI.',
    };
  } catch (err: any) {
    console.error('Gemini Receipt OCR error:', err);
    return {
      nominal: expectedAmount,
      bankTujuan: 'Perlu Cek',
      namaPengirim: 'Perlu Cek',
      namaPenerima: 'Panitia',
      tanggal: new Date().toISOString().split('T')[0],
      nomorReferensi: '-',
      keabsahan: 'BURAM',
      rekomendasi: 'PERLU_CEK_MANUAL',
      catatanAnalisis:
        'AI OCR mengalami kendala saat membaca gambar (' +
        (err.message || 'Error') +
        '). Silakan verifikasi manual foto struk.',
    };
  }
}

export async function generateEventExecutiveSummaryWithGemini(stats: any, recentClubs: string[], jerseySummary: Record<string, number>) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return {
        ringkasan: `Total ${stats.totalPeserta} peserta telah terdaftar dengan ${stats.lunas} peserta lunas. Sisa kuota saat ini adalah ${stats.sisaKuota} slot.`,
        analisaKlub: 'Klub lokal mendominasi pendaftaran event.',
        rekomendasiPanitia: [
          'Kirimkan broadcast pengingat bayar kepada peserta berstatus BELUM BAYAR.',
          'Siapkan buffer jersey untuk ukuran paling populer.',
          'Buka konfirmasi pelunasan langsung di meja registrasi.',
        ],
      };
    }

    const prompt = `Anda adalah konsultan manajemen event trabas & otomotif senior untuk Event Trabas Jelobar.
Berdasarkan data statistik event realtime berikut:
- Kuota Maksimal: ${stats.kuota}
- Total Peserta Terdaftar: ${stats.totalPeserta}
- Status Lunas: ${stats.lunas}
- Menunggu Verifikasi: ${stats.menungguVerifikasi}
- Belum Bayar: ${stats.belumBayar}
- Total Dana Terkumpul: Rp ${(stats.totalPembayaran || 0).toLocaleString('id-ID')}
- Ukuran Jersey: ${JSON.stringify(jerseySummary)}
- Sampel Klub Terdaftar: ${recentClubs.join(', ')}

Buat ringkasan eksekutif, tren klub & jersey, serta 3 poin rekomendasi taktis bagi panitia event dalam Bahasa Indonesia yang formal dan bersemangat. Format JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ringkasan: {
              type: Type.STRING,
              description: 'Paragraf ringkasan eksekutif performa pendaftaran event',
            },
            analisaKlub: {
              type: Type.STRING,
              description: 'Analisis partisipasi klub vs perorangan dan permintaan jersey',
            },
            rekomendasiPanitia: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 rekomendasi tindakan taktis untuk panitia',
            },
          },
          required: ['ringkasan', 'analisaKlub', 'rekomendasiPanitia'],
        },
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (err: any) {
    console.error('Gemini Summary error:', err);
    return {
      ringkasan: `Pendaftaran telah mencapai ${stats.pesertaAktif} peserta (${Math.round((stats.pesertaAktif / stats.kuota) * 100)}% dari kuota).`,
      analisaKlub: 'Partisipasi peserta menunjukkan antusiasme tinggi.',
      rekomendasiPanitia: [
        'Follow-up peserta yang belum melunasi biaya pendaftaran.',
        'Lakukan verifikasi bukti pembayaran yang masih tertunda.',
        'Koordinasikan cetak jersey dengan vendor sesuai rekap.',
      ],
    };
  }
}

export async function generateBroadcastWhatsAppWithGemini(
  type: 'REMINDER_BAYAR' | 'KONFIRMASI_LUNAS' | 'INFO_JERSEY',
  participant: { noRegistrasi: string; nama: string; club: string; ukuranJersey: string; nominal: number },
  eventName: string,
  bankInfo: string
) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return `Halo Bro ${participant.nama} (${participant.club}), terima kasih telah mendaftar di ${eventName} dengan No Registrasi ${participant.noRegistrasi}. Silakan lakukan pelunasan Rp ${participant.nominal.toLocaleString('id-ID')} ke ${bankInfo}. Salam Gaspol!`;
    }

    const prompt = `Buatkan pesan WhatsApp ramah, antusias khas komunitas trail/trabas motor untuk peserta:
- Nama: ${participant.nama}
- No Registrasi: ${participant.noRegistrasi}
- Klub: ${participant.club}
- Ukuran Jersey: ${participant.ukuranJersey}
- Nominal: Rp ${participant.nominal.toLocaleString('id-ID')}
- Event: ${eventName}
- Tipe Pesan: ${type}
- Rekening: ${bankInfo}

Format pesan harus siap kirim di WhatsApp dengan emoticon motor, api, jempol yang keren dan tanda bintang bold WhatsApp (*teks*). Hanya berikan teks pesan WhatsApp tanpa pengantar.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return response.text || '';
  } catch (e: any) {
    return `Halo Bro *${participant.nama}* (${participant.club}),\n\nNo Registrasi Anda di *${eventName}* adalah *#${participant.noRegistrasi}*.\nMohon segera melunasi Rp ${participant.nominal.toLocaleString('id-ID')} ke: ${bankInfo}.\n\nGaspol Bro! 🏁`;
  }
}
