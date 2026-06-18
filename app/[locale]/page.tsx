'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { authApi } from '@/src/lib/api';

const LANGS = [
  { code: 'vi', label: '🇻🇳 VI' },
  { code: 'en', label: '🇺🇸 EN' },
  { code: 'ja', label: '🇯🇵 JA' },
];

export default function LoginPage() {
  const t = useTranslations('login');
  const locale = useLocale();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const switchLocale = (code: string) => {
    const path = window.location.pathname.replace(`/${locale}`, `/${code}`);
    router.push(path);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('email', res.data.email);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.message || t('error'));
      setLoading(false);
    }
  };

  return (
    /*
     * Dùng `fixed inset-0` thay vì `h-screen` để đảm bảo luôn khớp
     * viewport kể cả khi browser mobile có thanh địa chỉ thu/mở.
     * overflow-hidden ở đây là chắc chắn không bao giờ scroll.
     */
    <main className="fixed inset-0 overflow-hidden bg-[#0b1120] lg:grid lg:grid-cols-[50%_1fr]">

      {/* ─── LEFT PANEL ────────────────────────────────────────────── */}
      <section className="relative hidden h-full overflow-hidden lg:flex lg:flex-col lg:justify-end bg-[#0b1120]">

        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_20%,rgba(16,185,129,.18),transparent),radial-gradient(ellipse_50%_40%_at_80%_5%,rgba(148,163,184,.10),transparent)]" />
          {/* Diagonal stripe */}
          <div className="absolute left-[-10%] top-[15%] h-[160px] w-[130%] -rotate-12 border-y border-emerald-500/30 bg-white/[0.03]" />
          {/* Vertical grid lines */}
          <div className="absolute right-[10%] top-0 h-full w-[36%] border-x border-white/[0.07] bg-[repeating-linear-gradient(90deg,rgba(255,255,255,.06)_0px,rgba(255,255,255,.06)_1px,transparent_1px,transparent_14px)]" />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 h-1/3 w-full bg-gradient-to-t from-[#0b1120]/90 to-transparent" />
        </div>

        {/* Bottom content block — fixed height so it never pushes */}
        <div className="relative z-10 flex-shrink-0 border-t-[5px] border-emerald-500 bg-[#0d1526]/90 px-12 py-10 text-white">
          {/* Logo */}
          <div className="mb-6 flex items-center gap-3">
            <span className="text-[22px] font-black leading-none tracking-[-0.08em] text-emerald-400">
              IVS
            </span>
            <span className="text-[17px] font-bold tracking-[-0.03em] text-white/90">
              IVS Company
            </span>
          </div>

          <h2 className="mb-4 max-w-sm text-[42px] font-extrabold leading-[1.06] tracking-[-0.05em] text-white">
            {t('heroTitle')}
          </h2>

          <p className="max-w-xs text-[15px] leading-relaxed text-white/60">
            {t('heroSub')}
          </p>
        </div>
      </section>

      {/* ─── RIGHT PANEL ───────────────────────────────────────────── */}
      <section className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-white px-6 lg:px-[6vw]">

        {/* Language switcher */}
        <div className="absolute top-5 right-5 z-10 flex gap-1.5">
          {LANGS.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLocale(lang.code)}
              className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                locale === lang.code
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Form card — flex-shrink-0 prevents it from compressing */}
        <div className="relative w-full max-w-[440px] flex-shrink-0">

          {/* Header */}
          <div className="mb-8 text-center">
            {/* Show logo on mobile (left panel is hidden) */}
            <div className="mb-5 flex items-center justify-center gap-2 lg:hidden">
              <span className="text-[20px] font-black leading-none tracking-[-0.08em] text-emerald-500">
                IVS
              </span>
              <span className="text-[15px] font-bold text-slate-900">
                IVS Company
              </span>
            </div>

            <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-slate-950">
              {t('title')}
            </h1>
            <p className="mt-2 text-[13px] text-slate-400">
              {t('subtitle')}
            </p>
          </div>

          <form onSubmit={handleLogin} noValidate className="space-y-5">

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                {t('email')} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder={t('emailPlaceholder')}
                required
                className={`h-12 w-full rounded-xl border bg-slate-50 px-4 text-[14px] text-slate-950 outline-none transition-all placeholder:text-slate-300 ${
                  error
                    ? 'border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-400/10'
                    : 'border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10'
                }`}
              />
              {error && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-red-500">
                  <span className="inline-flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border border-red-500 text-[9px]">
                    !
                  </span>
                  {error}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                {t('password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder={t('passwordPlaceholder')}
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-11 text-[14px] text-slate-950 outline-none transition-all placeholder:text-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    /* eye-off */
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    /* eye */
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 select-none">
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-[5px] bg-emerald-500 text-white">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2,6 5,9 10,3"/>
                  </svg>
                </span>
                <span className="text-[13px] text-slate-600">{t('remember')}</span>
              </label>
              <button type="button" className="text-[13px] text-slate-500 hover:text-slate-800 transition-colors">
                {t('forgot')}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-slate-950 text-[14px] font-bold text-white transition hover:bg-black active:scale-[.99] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              {loading ? t('loading') : t('submit')}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="absolute bottom-5 left-0 right-0 hidden justify-center gap-4 text-[12px] text-slate-400 xl:flex">
          <span>© 2025 IVS Company. {t('footer')}</span>
          <span className="text-slate-700 hover:text-slate-950 cursor-pointer transition-colors">{t('terms')}</span>
          <span className="text-slate-700 hover:text-slate-950 cursor-pointer transition-colors">{t('privacy')}</span>
        </div>
      </section>
    </main>
  );
}