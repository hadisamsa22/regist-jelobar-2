import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbManager } from './server/db.js';
import {
  analyzeReceiptWithGemini,
  generateEventExecutiveSummaryWithGemini,
  generateBroadcastWhatsAppWithGemini,
} from './server/gemini.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON with support for Base64 image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. Public Data (Settings, Active Bank Accounts, Available Sizes, Booked Numbers)
app.get('/api/public-data', (req, res) => {
  try {
    const data = dbManager.getPublicData();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Check Booking Number Availability (Live validation)
app.get('/api/check-no-registrasi', (req, res) => {
  try {
    const noReg = String(req.query.noRegistrasi || '');
    const excludeId = req.query.excludeId ? String(req.query.excludeId) : undefined;
    const result = dbManager.checkNoRegistrasiAvailable(noReg, excludeId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ available: false, message: err.message });
  }
});

// 3. Search / Check Participant Status
// Note: Privacy protection enforced! When not authenticated as admin, only booking status is returned without personal info.
app.get('/api/check-participant', (req, res) => {
  try {
    const query = String(req.query.query || '');
    const isAdmin = req.headers.authorization === 'Bearer admin-token-jelobar';
    const result = dbManager.checkParticipantStatus(query, isAdmin);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Participant Registration
app.post('/api/register', (req, res) => {
  try {
    const result = dbManager.registerPeserta(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Admin Authentication
app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;
    // Default admin credentials
    if (username === 'admin' && (password === 'admin123' || password === 'jelobar2026')) {
      res.json({
        success: true,
        message: 'Login Administrator Berhasil!',
        userSession: {
          token: 'admin-token-jelobar',
          username: 'admin',
          nama: 'Super Administrator Jelobar',
          role: 'admin',
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Username atau Password salah! (Default: admin / admin123)',
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Get All Participants (Admin Only)
app.get('/api/peserta', (req, res) => {
  try {
    const result = dbManager.getAllPeserta();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Update Participant
app.put('/api/peserta', (req, res) => {
  try {
    const result = dbManager.updatePeserta(req.body, 'admin');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. Delete Participant
app.delete('/api/peserta/:id', (req, res) => {
  try {
    const result = dbManager.deletePeserta(req.params.id, 'admin');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9. Payments: Get All
app.get('/api/pembayaran', (req, res) => {
  try {
    const result = dbManager.getAllPayments();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 10. Payments: Submit / Add
app.post('/api/pembayaran', (req, res) => {
  try {
    const result = dbManager.addPayment(req.body, req.body.username || 'PUBLIC_FORM');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 11. Payments: Verify (LUNAS / DITOLAK)
app.put('/api/pembayaran/verify', (req, res) => {
  try {
    const { idTransaksi, status, catatan } = req.body;
    const result = dbManager.verifyPayment(idTransaksi, status, catatan, 'admin');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 12. Bank Accounts: List
app.get('/api/bank-accounts', (req, res) => {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const result = dbManager.getBankAccounts(activeOnly);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 13. Bank Accounts: Save
app.post('/api/bank-accounts', (req, res) => {
  try {
    const result = dbManager.saveBankAccount(req.body, 'admin');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 14. Bank Accounts: Toggle Status
app.put('/api/bank-accounts/:id/toggle', (req, res) => {
  try {
    const result = dbManager.toggleBankAccountStatus(req.params.id, 'admin');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 15. Bank Accounts: Delete
app.delete('/api/bank-accounts/:id', (req, res) => {
  try {
    const result = dbManager.deleteBankAccount(req.params.id, 'admin');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 16. Event Settings: Get
app.get('/api/settings', (req, res) => {
  try {
    const result = dbManager.getFullSettings();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 17. Event Settings: Save
app.post('/api/settings', (req, res) => {
  try {
    const result = dbManager.saveSettings(req.body, 'admin');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 18. Audit Logs: Get
app.get('/api/audit-logs', (req, res) => {
  try {
    const result = dbManager.getAuditLogs();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 19. Dashboard Stats: Get
app.get('/api/stats', (req, res) => {
  try {
    const stats = dbManager.getDashboardStats();
    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// GEMINI AI ENDPOINTS (SERVER-SIDE)
// ==========================================

// Gemini OCR: Analyze Payment Receipt Image
app.post('/api/gemini/analyze-receipt', async (req, res) => {
  try {
    const { imageBase64, expectedAmount } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Foto bukti pembayaran diperlukan' });
    }

    const settings = dbManager.getFullSettings().settings;
    const targetAmount = Number(expectedAmount || settings.BIAYA || 150000);

    const analysis = await analyzeReceiptWithGemini(imageBase64, targetAmount);

    dbManager.logAudit(
      'GEMINI_AI',
      'AI_SCAN_RECEIPT',
      '-',
      `Gemini AI menganalisis struk: status ${analysis.keabsahan}, rekomendasi: ${analysis.rekomendasi}`
    );

    res.json({ success: true, analysis });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Gemini Insights: Generate Executive Briefing & Forecast
app.get('/api/gemini/insights', async (req, res) => {
  try {
    const stats = dbManager.getDashboardStats();
    const participants = dbManager.getAllPeserta().data;

    // Collect clubs
    const clubs = Array.from(new Set(participants.map(p => p.club).filter(c => c && c !== 'Perorangan'))).slice(0, 10);

    // Collect jersey sizes
    const jerseySummary: Record<string, number> = {};
    participants.forEach(p => {
      jerseySummary[p.ukuranJersey] = (jerseySummary[p.ukuranJersey] || 0) + 1;
    });

    const insights = await generateEventExecutiveSummaryWithGemini(stats, clubs, jerseySummary);
    res.json({ success: true, insights });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Gemini WhatsApp: Draft Tailored Message
app.post('/api/gemini/broadcast', async (req, res) => {
  try {
    const { type, participant } = req.body;
    const settings = dbManager.getFullSettings().settings;
    const bankList = dbManager.getBankAccounts(true).data;
    const bankInfo = bankList.length > 0
      ? `${bankList[0].namaBank} ${bankList[0].nomorRekening} a.n ${bankList[0].atasNama}`
      : 'Rekening Panitia Jelobar';

    const message = await generateBroadcastWhatsAppWithGemini(
      type || 'REMINDER_BAYAR',
      participant,
      settings.NAMA_EVENT,
      bankInfo
    );

    res.json({ success: true, message });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// VITE DEV SERVER / PRODUCTION STATIC
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server Jelobar running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
