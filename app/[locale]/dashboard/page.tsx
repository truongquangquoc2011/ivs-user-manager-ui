"use client";

import Link from "next/link";
import { useAuth } from "@/src/hook/useAuth";
import { useLocale } from "next-intl";
import { useMemo } from "react";

import {
  Users,
  LayoutGrid,
  Key,
  UserCircle,
  Shield,
  TrendingUp,
  Bell,
  Settings,
  ArrowRight,
  Check,
  Lock,
} from "lucide-react";

/** MODULE SET CỨNG */
const MODULES = [
  {
    title: "Users",
    desc: "Quản lý tài khoản người dùng",
    href: "user",
    feature: "USER_MANAGEMENT",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Groups",
    desc: "Quản lý nhóm",
    href: "group",
    feature: "GROUP_MANAGEMENT",
    icon: LayoutGrid,
    color: "bg-green-50 text-green-600",
  },
  {
    title: "Permissions",
    desc: "Phân quyền hệ thống",
    href: "permission",
    feature: "PERMISSION_MANAGEMENT",
    icon: Key,
    color: "bg-amber-50 text-amber-600",
  },
  {
    title: "Profile",
    desc: "Thông tin cá nhân",
    href: "profile",
    feature: "PROFILE",
    icon: UserCircle,
    color: "bg-purple-50 text-purple-600",
  },
];

export default function DashboardHome() {
  const { profile, hasPermission } = useAuth();
  const locale = useLocale();

  // ================= PROFILE =================
  const displayName = profile?.fullname || profile?.email || "User";

  const initials = useMemo(() => {
    return displayName
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [displayName]);

  const avatar = profile?.avatar;

  // ================= STATS (SET CỨNG) =================
  const stats = [
    { label: "Tổng Users", value: 120, icon: Users },
    { label: "Đang hoạt động", value: 95, icon: TrendingUp },
    { label: "Groups", value: 8, icon: Shield },
    { label: "Permissions", value: 10, icon: Key },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">

        <div className="flex items-center gap-4">

          {/* AVATAR */}
          <div className="h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center overflow-hidden font-semibold">
            {avatar ? (
              <img
                src={avatar}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          {/* NAME */}
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Xin chào, {displayName}
            </h1>
            <p className="text-sm text-slate-500">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2">
          <button className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2">
            <Bell size={14} /> Thông báo
          </button>
          <button className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2">
            <Settings size={14} /> Cài đặt
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Icon size={14} />
                {s.label}
              </div>
              <p className="text-2xl font-semibold mt-1">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* MODULES */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {MODULES.map((m) => {
          const Icon = m.icon;

          const allowed =
            m.feature === "PROFILE" || hasPermission(m.feature, "canView");

          const card = (
            <div
              className={`rounded-2xl border p-5 transition ${
                allowed
                  ? "bg-white hover:-translate-y-1 hover:shadow-md cursor-pointer"
                  : "bg-slate-50 opacity-60 cursor-not-allowed"
              }`}
            >
              <div className={`p-2 inline-flex rounded-lg mb-3 ${m.color}`}>
                <Icon size={18} />
              </div>

              <h3 className="font-semibold text-slate-900">
                {m.title}
              </h3>

              <p className="text-sm text-slate-500 mt-1 mb-4">
                {m.desc}
              </p>

              <div className="flex justify-between items-center">
                {allowed ? (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <Check size={10} /> Allowed
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                    <Lock size={10} /> No access
                  </span>
                )}

                <ArrowRight size={14} className="text-slate-400" />
              </div>
            </div>
          );

          if (!allowed) return <div key={m.href}>{card}</div>;

          return (
            <Link
              key={m.href}
              href={`/${locale}/dashboard/${m.href}`}
            >
              {card}
            </Link>
          );
        })}
      </div>
    </div>
  );
}