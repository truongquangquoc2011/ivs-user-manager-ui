"use client";
import React, { useState, useEffect } from "react";
import { MOCK_GROUPS, ROLE_SETTINGS } from "@/src/mock/data";

export default function PermissionPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState("HR");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    setCurrentUser(savedUser);
  }, []);

  const canEdit = currentUser
    ? ROLE_SETTINGS[currentUser.groupName]?.editB
    : false;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    if (!canEdit) {
      e.preventDefault(); 
      alert(
        `⚠️ Quyền hạn ${currentUser?.groupName} của bạn chỉ được XEM, không được CHỈNH SỬA, quyền của các nhóm khác!`,
      );
    }
  };

  const handleSave = () => {
    if (!canEdit) {
      alert("⚠️ Hành động bị từ chối: Bạn không có quyền lưu thay đổi này.");
      return;
    }
    alert("Hệ thống: Đã cập nhật ma trận phân quyền thành công!");
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
              Thiết lập phân quyền
            </h1>
          
          </div>
          <button
            onClick={handleSave}
            className={`px-8 py-3 rounded-2xl font-bold transition-all shadow-lg ${
              canEdit
                ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            LƯU CẤU HÌNH
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex gap-4 items-center">
            <span className="font-bold text-slate-700">
              Chọn nhóm để thiết lập:
            </span>
            <div className="flex gap-2">
              {MOCK_GROUPS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGroup(g.groupName)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    selectedGroup === g.groupName
                      ? "bg-slate-800 text-white shadow-md"
                      : "bg-white text-slate-500 border border-slate-200"
                  }`}
                >
                  {g.groupName}
                </button>
              ))}
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-slate-400 text-[10px] uppercase tracking-[2px] font-black">
                <th className="p-6">Tên màn hình</th>
                <th className="p-6 text-center">Quyền Xem (View)</th>
                <th className="p-6 text-center">Quyền Sửa (Edit)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { id: "A", name: "Quản lý người dùng" },
                { id: "B", name: "Quản lý nhóm" },
                { id: "C", name: "Quản lý phân quyền" },
              ].map((screen) => (
                <tr
                  key={screen.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="p-6 font-bold text-slate-700">
                    {screen.name}
                  </td>
                  <td className="p-6 text-center">
                    <input
                      type="checkbox"
                      className="w-6 h-6 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      onClick={handleCheckboxClick}
                      defaultChecked={true}
                    />
                  </td>
                  <td className="p-6 text-center">
                    <input
                      type="checkbox"
                      className="w-6 h-6 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      onClick={handleCheckboxClick}
                      defaultChecked={selectedGroup === "Admin"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!canEdit && (
          <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-100 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-amber-800 text-sm font-bold">
              Chế độ Read-only: Bạn đang đăng nhập với tư cách{" "}
              {currentUser?.groupName}. Chỉ Admin mới có quyền thay đổi nhóm 
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
