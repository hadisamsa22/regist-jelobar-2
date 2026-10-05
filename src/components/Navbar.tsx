import React from 'react';
import { Home, UserPlus, Bookmark, CreditCard, Sparkles, Lock, Moon, Sun, Menu } from 'lucide-react';
import type { UserSession, PengaturanEvent } from '../types';

interface NavbarProps {
  settings: PengaturanEvent;
  activePage: string;
  setActivePage: (page: string) => void;
  openRegistrasi: () => void;
  openPembayaran: () => void;
  openAiAssistant: () => void;
  openLogin: () => void;
  userSession: UserSession | null;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  activePage,
  setActivePage,
  openRegistrasi,
  openPembayaran,
  openAiAssistant,
  openLogin,
  userSession,
  darkMode,
  setDarkMode,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setActivePage('landing')}
          >
            <img
              src={settings.LOGO || 'https://b.top4top.io/p_39179gqj91.png'}
              alt="Logo"
              className="h-10 w-auto object-contain rounded-lg p-0.5 bg-white shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80?text=JELOBAR';
              }}
            />
            <div>
              <span className="text-sm sm:text-base font-black tracking-tight font-heading bg-gradient-to-r from-blue-700 to-cyan-500 bg-clip-text text-transparent block leading-tight">
                {settings.NAMA_EVENT}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 status-pulse"></span>
                Database Realtime Terhubung
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1.5">
            <button
              onClick={() => setActivePage('landing')}
              className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition ${
                activePage === 'landing'
                  ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 font-bold'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Home className="w-4 h-4 text-blue-600" /> Beranda
            </button>

            <button
              onClick={openRegistrasi}
              className="px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-sm transition"
            >
              <UserPlus className="w-4 h-4 text-emerald-600" /> Registrasi Peserta
            </button>

            <button
              onClick={() => setActivePage('cekData')}
              className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition ${
                activePage === 'cekData'
                  ? 'bg-slate-100 dark:bg-slate-800 text-amber-500 font-bold'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark className="w-4 h-4 text-amber-500" /> Cek Nomor Booking
            </button>

            <button
              onClick={openPembayaran}
              className="px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition"
            >
              <CreditCard className="w-4 h-4 text-indigo-500" /> Pelunasan / Bukti
            </button>

            <button
              onClick={openAiAssistant}
              className="px-3 py-2 text-xs sm:text-sm font-bold rounded-xl text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-500" /> Gemini AI
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Ganti Tema"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {userSession ? (
              <button
                onClick={() => setActivePage('admin')}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl shadow transition flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-blue-400" /> Panel Admin
              </button>
            ) : (
              <button
                onClick={openLogin}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl shadow transition flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" /> Login Admin
              </button>
            )}
          </nav>

          {/* Mobile buttons */}
          <div className="flex items-center space-x-1 md:hidden">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-600 dark:text-slate-300 rounded-lg"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-2">
          <button
            onClick={() => {
              setActivePage('landing');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
          >
            <Home className="w-4 h-4 text-blue-600" /> Beranda
          </button>
          <button
            onClick={() => {
              openRegistrasi();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-emerald-600" /> Registrasi Peserta Baru
          </button>
          <button
            onClick={() => {
              setActivePage('cekData');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
          >
            <Bookmark className="w-4 h-4 text-amber-500" /> Cek Nomor Booking
          </button>
          <button
            onClick={() => {
              openPembayaran();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4 text-indigo-500" /> Pelunasan / Bukti Transfer
          </button>
          <button
            onClick={() => {
              openAiAssistant();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-blue-600 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-500" /> Gemini AI Asisten
          </button>
          <div className="pt-2">
            {userSession ? (
              <button
                onClick={() => {
                  setActivePage('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-slate-800 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                <Lock className="w-4 h-4" /> Buka Panel Admin
              </button>
            ) : (
              <button
                onClick={() => {
                  openLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-blue-600 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                <Lock className="w-4 h-4" /> Login Admin
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
