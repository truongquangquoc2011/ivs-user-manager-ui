'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/src/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('email', res.data.email);
      router.push('/dashboard/user');
    } catch (err: any) {
      setError(err.message || 'The email you entered is not registered, please check again');
      setLoading(false);
    }
  };

  return (
    <main className="grid h-screen overflow-hidden bg-white text-slate-950 lg:grid-cols-[50vw_1fr]">
      <section className="relative hidden h-screen overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-end">
        <div className="absolute inset-x-0 top-0 bottom-[31.5%] overflow-hidden bg-[#07111d]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(16,185,129,.24),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(148,163,184,.18),transparent_26%),linear-gradient(135deg,#020617_0%,#0f172a_48%,#031a16_100%)]" />
          <div className="absolute left-[-8%] top-[18%] h-[180px] w-[120%] rotate-[-14deg] border-y border-emerald-400/40 bg-white/5 shadow-[0_0_70px_rgba(16,185,129,.35)]" />
          <div className="absolute right-[12%] top-0 h-full w-[38%] border-x border-white/10 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,.11)_0px,rgba(255,255,255,.11)_1px,transparent_1px,transparent_12px)] opacity-50" />
          <div className="absolute bottom-0 left-0 h-[42%] w-full bg-gradient-to-t from-black/70 to-transparent" />
        </div>

        <div className="relative z-10 min-h-[31.5vh] border-t-[6px] border-emerald-500 bg-slate-950 px-14 py-10 text-white">
          <div className="mb-7 flex items-center gap-3">
            <span className="text-[34px] font-black leading-none tracking-[-0.12em] text-emerald-500">
              H
            </span>
            <span className="text-xl font-extrabold tracking-[-0.04em]">
              IVS Company
            </span>
          </div>

          <h2 className="mb-5 max-w-xl text-[50px] font-extrabold leading-[1.08] tracking-[-0.055em]">
            Empower your team.
            <br />
            Manage access with clarity.
          </h2>

          <p className="text-lg leading-relaxed text-white/80">
            Internal User Management & Permission Control System.
          </p>
        </div>
      </section>

      <section className="relative flex h-screen items-center justify-center overflow-hidden px-6 py-6 lg:px-[6vw]">
        <div className="relative w-full max-w-[480px]">
          <svg
            className="pointer-events-none absolute -left-16 -top-20 hidden h-24 w-28 opacity-15 lg:block"
            viewBox="0 0 140 120"
            fill="none"
          >
            <path
              d="M9 39C33 2 82 8 104 45C113 60 115 77 112 93"
              stroke="#111827"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M91 72L112 95L132 70"
              stroke="#111827"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="mb-7 text-center">
            <h1 className="text-[28px] font-extrabold leading-tight tracking-[-0.035em] text-slate-950">
              Login first to your account
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Enter your account information to continue
            </p>
          </div>

          <form onSubmit={handleLogin} noValidate>
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-slate-950">
                Email Address <span className="text-red-500">*</span>
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="Input your registered email"
                required
                className={`h-14 w-full rounded-[10px] border bg-white px-5 text-[15px] text-slate-950 outline-none transition placeholder:text-slate-300 ${
                  error
                    ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                }`}
              />

              {error && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-500">
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-red-500 text-[10px]">
                    !
                  </span>
                  {error}
                </p>
              )}
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-slate-950">
                Password <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Input your password account"
                  required
                  className="h-14 w-full rounded-[10px] border border-slate-200 bg-white px-5 pr-12 text-[15px] text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />

                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-800">
                  ⊘
                </span>
              </div>
            </div>

            <div className="mb-6 flex items-center justify-between text-sm text-slate-500">
              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500 text-xs font-bold text-white">
                  ✓
                </span>
                <span>Remember Me</span>
              </div>

              <button type="button" className="text-slate-500">
                Forgot Password
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-[10px] bg-slate-950 text-[15px] font-extrabold text-white transition hover:bg-black active:scale-[.99] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              {loading ? 'Đang xác thực...' : 'Login'}
            </button>
          </form>
        </div>

        <div className="absolute bottom-5 left-6 right-6 hidden justify-center gap-4 text-[13px] text-slate-400 xl:flex">
          <span>© 2025 IVS Company. All rights reserved.</span>
          <span className="text-slate-950">Terms & Conditions</span>
          <span className="text-slate-950">Privacy Policy</span>
        </div>
      </section>
    </main>
  );
}