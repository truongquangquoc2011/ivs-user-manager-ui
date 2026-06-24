"use client";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6">
      <div className="w-full max-w-md text-center">

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/30">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3m0 4h.01M10.29 3.86l-7.5 13A1.5 1.5 0 0 0 4.06 19h15.88a1.5 1.5 0 0 0 1.27-2.14l-7.5-13a1.5 1.5 0 0 0-2.62 0z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-semibold tracking-tight text-white">
          403 - Access Denied
        </h1>

        {/* Description */}
        <p className="mt-4 text-sm leading-6 text-slate-400">
          You don’t have permission to access this page. Please contact your administrator if you believe this is a mistake.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href="/dashboard"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-200 transition"
          >
            Go Home
          </a>

          <button
            onClick={() => window.history.back()}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white hover:bg-white/10 transition"
          >
            Go Back
          </button>
        </div>

        <p className="mt-8 text-xs text-slate-600">
          Error code: FORBIDDEN_ACCESS
        </p>
      </div>
    </div>
  );
}