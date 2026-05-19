"use client";
import React, { useState, useEffect } from "react";
import { MOCK_GROUPS, MOCK_USERS, ROLE_SETTINGS } from "@/src/mock/data";

export default function UserManagementPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    setCurrentUser(savedUser);
  }, []);

  const canEdit = currentUser
    ? ROLE_SETTINGS[currentUser.groupName]?.editA
    : false;

  const handleAction = (user = null) => {
    if (!canEdit) {
      alert("Bạn không có quyền thực hiện chức năng này!");
      return;
    }
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (userName: string) => {
    if (!canEdit) {
      alert("Bạn không có quyền thực hiện chức năng này!");
      return;
    }
    alert(`Đã xóa người dùng: ${userName}`);
  };

  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
        <button
          onClick={() => handleAction()}
          className={`px-4 py-2 rounded-lg transition cursor-pointer ${
            canEdit
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          + Thêm người dùng
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold">Họ tên</th>
              <th className="p-4 font-semibold">Nhóm</th>
              <th className="p-4 font-semibold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-4">{user.fullName}</td>
                <td className="p-4">{user.groupName}</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleAction(user)}
                    className="text-blue-600 cursor-pointer hover:underline mr-6"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(user.fullName)}
                    className="text-red-600 cursor-pointer hover:underline"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {editingUser ? "Cập nhật thông tin" : "Thêm người dùng mới"}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                defaultValue={editingUser?.fullName}
                className="w-full border p-2 rounded"
                placeholder="Họ tên"
              />
              <select
                defaultValue={editingUser?.groupName}
                className="w-full border p-2 rounded"
              >
                {MOCK_GROUPS.map((g) => (
                  <option key={g.id} value={g.groupName}>
                    {g.groupName}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-200 px-4 py-2 rounded"
                >
                  Hủy
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
