"use client";
import React, { useState, useEffect } from "react";
import { MOCK_GROUPS, MOCK_USERS, ROLE_SETTINGS } from "@/src/mock/data";

export default function GroupManagementPage() {
  const [groups, setGroups] = useState(MOCK_GROUPS);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [groupNameInput, setGroupNameInput] = useState("");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    setCurrentUser(savedUser);
  }, []);

  const canEdit = currentUser
    ? ROLE_SETTINGS[currentUser.groupName]?.editC
    : false;

  const handleAction = (group = null) => {
    if (!canEdit) {
      alert(
        `⚠️ Quyền hạn của ${currentUser?.groupName} không đủ. Bạn chỉ được xem danh sách nhóm, không được chỉnh sửa!`,
      );
      return;
    }
    setEditingGroup(group);
    setGroupNameInput(group ? (group as any).groupName : "");
    setIsModalOpen(true);
  };

  const handleKick = (name: string) => {
    if (!canEdit) {
      alert(
        "⚠️ Hành động bị từ chối: Bạn không có quyền loại thành viên khỏi nhóm.",
      );
      return;
    }
    alert(`Hệ thống: Đã loại ${name} thành công.`);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            Màn hình C: Quản lý Nhóm
          </h1>
          <p className="text-sm text-slate-500">
            Thiết lập danh mục nhóm và quản lý thành viên
          </p>
        </div>
        <button
          onClick={() => handleAction()}
          className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
            canEdit
              ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          + Tạo nhóm mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group: any) => (
          <div
            key={group.id}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h2 className="font-bold text-indigo-600 uppercase">
                {group.groupName}
              </h2>
              <button
                onClick={() => handleAction(group)}
                className="text-xs font-bold text-indigo-500 hover:underline cursor-pointer"
              >
                SỬA TÊN
              </button>
            </div>

            <ul className="space-y-2">
              {MOCK_USERS.filter(
                (u: any) => u.groupName === group.groupName,
              ).map((u: any) => (
                <li
                  key={u.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-xl group/item"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {u.fullName}
                  </span>
                  <button
                    onClick={() => handleKick(u.fullName)}
                    className="opacity-0 group-hover/item:opacity-100 text-red-500 text-xs font-bold transition-all cursor-pointer"
                  >
                    LOẠI BỎ
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full">
            <h2 className="text-xl font-bold mb-6">
              {editingGroup ? "Cập nhật tên nhóm" : "Tạo nhóm mới"}
            </h2>
            <input
              value={groupNameInput}
              onChange={(e) => setGroupNameInput(e.target.value)}
              className="w-full border-2 border-slate-100 p-3 rounded-xl mb-6 outline-none focus:border-indigo-500"
              placeholder="Nhập tên nhóm..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 font-bold text-slate-400"
              >
                Hủy
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
