"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (!savedUser) {
      router.push("/login");
    } else {
      setUser(savedUser);
    }
  }, [router]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-800 text-white p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-8 text-blue-400 uppercase tracking-tighter">Hệ Thống Phân Quyền</h2>
        <nav className="space-y-4">
          <a href="/dashboard/user" className="block p-2 hover:bg-slate-700 rounded transition font-medium">👥 Quản lý Người dùng</a>
          <a href="/dashboard/groups" className="block p-2 hover:bg-slate-700 rounded transition font-medium">📁 Quản lý Nhóm</a>
          {/* Chỉ Admin mới thấy mục Phân quyền */}
          {user.groupName === "Admin" && (
            <a href="/dashboard/permissions" className="block p-2 hover:bg-slate-700 rounded transition font-medium border-l-4 border-blue-500 pl-4">⚙️ Phân quyền</a>
          )}
          <div className="pt-8 border-t border-slate-700">
            <a href="/dashboard/profile" className="block p-2 text-sm text-gray-400 hover:text-white">Cá nhân</a>
            <button 
              onClick={() => { localStorage.clear(); router.push("/"); }}
              className="block p-2 text-sm text-red-400 hover:text-red-300 w-full text-left"
            >
              Đăng xuất
            </button>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white p-4 shadow-sm flex justify-between items-center px-8">
          <div className="text-sm text-gray-500 font-medium">Trang quản trị / <span className="text-gray-800 uppercase">{user.groupName}</span></div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-700">{user.fullName}</span>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
               {user.fullName[0]}
            </div>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}