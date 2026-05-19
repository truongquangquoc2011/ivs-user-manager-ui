"use client";
import React, { useState, useEffect } from "react";
import { MOCK_USERS } from "@/src/mock/data";

export default function ProfilePage() {
  // Giả định lấy user đang đăng nhập
  const [currentUser, setCurrentUser] = useState(MOCK_USERS[0]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Hồ sơ cá nhân</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-4xl font-bold mb-4 border-4 border-white shadow-sm">
            {currentUser.fullName.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{currentUser.fullName}</h2>
          <p className="text-gray-500 text-sm">{currentUser.groupName}</p>
          <span className="mt-3 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
            Tài khoản xác thực
          </span>
        </div>

        {/* Detailed Info */}
        <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">Thông tin chi tiết</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Username</label>
                <p className="mt-1 text-gray-900 font-medium">{currentUser.username}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Mã nhân viên</label>
                <p className="mt-1 text-gray-900 font-medium">#{currentUser.id}000</p>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Email liên hệ</label>
              <p className="mt-1 text-gray-900 font-medium">{currentUser.username}@hutech.edu.vn</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Vai trò hệ thống</label>
              <p className="mt-1 text-blue-600 font-bold">{currentUser.groupName}</p>
            </div>

            <div className="pt-4 flex gap-3">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition cursor-pointer">
                Chỉnh sửa hồ sơ
              </button>
              <a href="/profile/password" className="border border-gray-200 text-gray-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-50 transition text-center cursor-pointer">
                Đổi mật khẩu
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}