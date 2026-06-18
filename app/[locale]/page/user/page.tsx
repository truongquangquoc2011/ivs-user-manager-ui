"use client";
import React, { useState, useEffect } from "react";
import { MOCK_USERS, ROLE_SETTINGS } from "@/src/mock/data";

export default function UserManagement() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [userRole, setUserRole] = useState<any>(null);

  useEffect(() => {
    // Lấy thông tin người đang đăng nhập để kiểm tra quyền Edit/View
    const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
    if (loggedInUser) {
      // Lấy cấu hình quyền từ bảng ma trận trong image_956597.png
      setUserRole(ROLE_SETTINGS[loggedInUser.groupName]);
    }
  }, []);

  // Giả sử trang này là "Màn hình A" trong ảnh của bạn
  const canEdit = userRole?.editA ?? false; 

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Danh sách người dùng
          </h1>
          
          {/* Chỉ hiện nút Thêm nếu có quyền Edit (Dấu O trong ảnh) */}
          {canEdit && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded shadow-md hover:bg-blue-700 transition cursor-pointer">
              + Thêm người dùng mới
            </button>
          )}
        </div>
        
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 uppercase text-sm">
              <th className="border p-3 text-left font-semibold">Username</th>
              <th className="border p-3 text-left font-semibold">Họ tên</th>
              <th className="border p-3 text-left font-semibold">Nhóm</th>
              <th className="border p-3 text-center font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition">
                <td className="border p-3 font-medium">{user.username}</td>
                <td className="border p-3">{user.fullName}</td>
                <td className="border p-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    user.groupName === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.groupName}
                  </span>
                </td>
                <td className="border p-3 text-center">
                  {/* Nếu Edit là X (false) thì vô hiệu hóa nút sửa */}
                  <button 
                    disabled={!canEdit}
                    className={`mr-2 font-bold ${canEdit ? 'text-blue-600 hover:underline cursor-pointer' : 'text-gray-300 cursor-not-allowed'}`}
                  >
                    Sửa
                  </button>
                  <button 
                    disabled={!canEdit}
                    className={`font-bold ${canEdit ? 'text-red-600 hover:underline cursor-pointer' : 'text-gray-300 cursor-not-allowed'}`}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Thông báo nếu không có quyền chỉnh sửa */}
        {!canEdit && (
          <p className="mt-4 text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
             ⚠️ Bạn chỉ có quyền **Xem**, không có quyền thay đổi dữ liệu trên màn hình này.
          </p>
        )}
      </div>
    </div>
  );
}