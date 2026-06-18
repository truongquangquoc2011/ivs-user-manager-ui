'use client';

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

export default function ForbiddenPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('forbidden');

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#F5F4F0]">
      {/* Big 403 */}
      <p className="select-none font-black text-[120px] leading-none tracking-[-0.06em] text-slate-200 lg:text-[180px]">
        403
      </p>

      {/* Icon */}
      <div className="mb-5 -mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f0efe8"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <h1 className="mb-2 text-xl font-extrabold tracking-[-0.03em] text-slate-900">
        {t('title')}
      </h1>

      <p className="mb-8 max-w-xs text-center text-sm leading-relaxed text-slate-400">
        {t('message')}
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[.98]"
        >
          {t('back')}
        </button>

        <button
          onClick={() => router.push(`/${locale}/dashboard`)}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black active:scale-[.98]"
        >
          {t('home')}
        </button>
      </div>
    </div>
  );
}