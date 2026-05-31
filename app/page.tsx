'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/src/lib/api';

const TEST_ACCOUNTS = [
  { role: 'ProAdmin', email: 'proadmin@gmail.com', dot: '#c8a96e' },
  { role: 'Admin',   email: 'admin@gmail.com',    dot: '#8b9dc3' },
  { role: 'Manager', email: 'manager@gmail.com',  dot: '#9bc49b' },
  { role: 'HR',      email: 'hr@gmail.com',        dot: '#c49bb3' },
];

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
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
      setError(err.message || 'Không thể kết nối đến máy chủ.');
      setLoading(false);
    }
  };

  const fill = (acc: typeof TEST_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword('123456');
    setError('');
  };

  return (
    <div className="min-h-screen flex bg-[#f4f3ef]">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 flex-col justify-between p-11 bg-[#121210] border-r border-[#1e1e1a]">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[11px] font-bold tracking-wide">
            IV
          </div>
          <span className="text-[13px] font-medium text-[#d0cfc8] tracking-widest uppercase">
            IVS Manager
          </span>
        </div>

        {/* Hero */}
        <div>
          <p className="text-[10px] font-mono text-[#383833] tracking-[0.2em] uppercase mb-5">
            RBAC · v2.0
          </p>
          <h1 className="text-[40px] leading-[1.15] text-[#eeeee6] font-light mb-5">
            Quản lý<br />
            <span className="italic text-[#c8a96e]">phân quyền</span><br />
            người dùng
          </h1>
          <p className="text-[14px] text-[#484842] leading-[1.8] max-w-[300px]">
            Role-based access control — kiểm soát quyền truy cập chính xác cho từng nhóm trong tổ chức.
          </p>
        </div>

        {/* Test accounts */}
        <div>
          <div className="w-9 h-px bg-[#232320] mb-7" />
          <p className="text-[9px] font-mono text-[#333330] tracking-[0.22em] uppercase mb-3">
            Test accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TEST_ACCOUNTS.map(a => (
              <button
                key={a.role}
                type="button"
                onClick={() => fill(a)}
                className="bg-[#181815] border border-[#222220] rounded-[9px] p-3 text-left hover:bg-[#1e1e1a] hover:border-[#2e2e28] transition-colors cursor-pointer"
              >
                <div className="w-1.5 h-1.5 rounded-full mb-2" style={{ background: a.dot }} />
                <span className="block text-[11px] font-semibold text-[#cccbc4] tracking-wide">{a.role}</span>
                <span className="block text-[9px] font-mono text-[#444440] mt-0.5 truncate">{a.email}</span>
              </button>
            ))}
          </div>
          <p className="text-[9px] font-mono text-[#333330] mt-2.5">
            ↑ click để điền nhanh · password: 123456
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[380px]">

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-[32px] font-light text-[#121210] mb-1.5 leading-tight">
              Đăng nhập
            </h2>
            <p className="text-[14px] text-[#88887f]">
              Nhập thông tin tài khoản để tiếp tục
            </p>
          </div>

          <form onSubmit={handleLogin} noValidate>

            {/* Error box */}
            {error && (
              <div className="flex gap-3 p-3.5 mb-5 bg-red-50 border border-red-200 border-l-[3px] border-l-red-500 rounded-lg">
                <span className="text-red-500 text-[15px] mt-0.5 flex-shrink-0">⚠</span>
                <div>
                  <p className="text-[13.5px] font-medium text-red-700 leading-snug">{error}</p>
                  <p className="text-[12px] text-red-400 mt-1">Kiểm tra lại email và mật khẩu rồi thử lại.</p>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label className="block text-[10px] font-mono text-[#888882] tracking-[0.18em] uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="admin@gmail.com"
                required
                className={`w-full px-4 py-3.5 bg-white rounded-[9px] text-[15px] text-[#121210] outline-none transition-all placeholder:text-[#c4c3bc] ${
                  error
                    ? 'border-[1.5px] border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-[1.5px] border-[#e0dfd9] focus:border-[#121210] focus:ring-2 focus:ring-black/5'
                }`}
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-[10px] font-mono text-[#888882] tracking-[0.18em] uppercase mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                required
                className={`w-full px-4 py-3.5 bg-white rounded-[9px] text-[15px] text-[#121210] outline-none transition-all placeholder:text-[#c4c3bc] ${
                  error
                    ? 'border-[1.5px] border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-[1.5px] border-[#e0dfd9] focus:border-[#121210] focus:ring-2 focus:ring-black/5'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#121210] text-[#eeeee6] rounded-[9px] text-[15px] font-medium tracking-wide hover:bg-[#1e1e1a] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập →'}
            </button>
          </form>

          {/* Mobile accounts */}
          <div className="lg:hidden mt-7 pt-6 border-t border-[#dddcd7]">
            <p className="text-[9px] font-mono text-[#aaa89f] tracking-[0.18em] uppercase mb-2.5">
              Test accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              {TEST_ACCOUNTS.map(a => (
                <button
                  key={a.role}
                  type="button"
                  onClick={() => fill(a)}
                  className="p-2.5 bg-white border border-[#e0dfd9] rounded-lg text-left hover:border-[#121210] transition-colors cursor-pointer"
                >
                  <span className="block text-[12px] font-semibold text-[#121210]">{a.role}</span>
                  <span className="block text-[9px] font-mono text-[#aaa89f] mt-0.5 truncate">{a.email}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}