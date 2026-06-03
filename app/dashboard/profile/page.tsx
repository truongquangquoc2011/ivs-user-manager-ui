"use client";
import React, { useState } from "react";
import { profileApi } from "@/src/lib/api";
import { useAuth } from "@/src/hook/useAuth";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Chưa kích hoạt",
  LOCKED: "Bị khóa",
};

type FormErrors = {
  fullname?: string;
  phoneNumber?: string;
};

type PwErrors = {
  oldPassword?: string;
  newPassword?: string;
  confirm?: string;
};

export default function ProfilePage() {
  const { profile, loading, reload } = useAuth();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullname: "",
    phoneNumber: "",
    avatar: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editError, setEditError] = useState("");

  const [pwModal, setPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [pwErrors, setPwErrors] = useState<PwErrors>({});
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  const validateProfile = () => {
    const errors: FormErrors = {};
    const fullname = form.fullname.trim();
    const phoneNumber = form.phoneNumber.trim();

    if (!fullname) errors.fullname = "Vui lòng nhập họ tên";
    else if (fullname.length < 2)
      errors.fullname = "Họ tên phải có ít nhất 2 ký tự";
    else if (fullname.length > 60)
      errors.fullname = "Họ tên không được vượt quá 60 ký tự";
    else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(fullname)) {
      errors.fullname = "Họ tên không được chứa số hoặc ký tự đặc biệt";
    }

    if (phoneNumber && !/^0\d{9}$/.test(phoneNumber)) {
      errors.phoneNumber = "Số điện thoại phải gồm 10 số và bắt đầu bằng 0";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = () => {
    const errors: PwErrors = {};
    const { oldPassword, newPassword, confirm } = pwForm;

    if (!oldPassword.trim())
      errors.oldPassword = "Vui lòng nhập mật khẩu hiện tại";

    if (!newPassword.trim()) errors.newPassword = "Vui lòng nhập mật khẩu mới";
    else if (!/[A-Z]/.test(newPassword))
      errors.newPassword = "Mật khẩu mới phải có ít nhất 1 chữ hoa";
    else if (!/[a-z]/.test(newPassword))
      errors.newPassword = "Mật khẩu mới phải có ít nhất 1 chữ thường";
    else if (!/\d/.test(newPassword))
      errors.newPassword = "Mật khẩu mới phải có ít nhất 1 số";
    else if (oldPassword && oldPassword === newPassword) {
      errors.newPassword = "Mật khẩu mới không được trùng mật khẩu hiện tại";
    }

    if (!confirm.trim()) errors.confirm = "Vui lòng xác nhận mật khẩu mới";
    else if (newPassword !== confirm)
      errors.confirm = "Mật khẩu xác nhận không khớp";

    setPwErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openEdit = () => {
    if (!profile) return;
    setForm({
      fullname: profile.fullname || "",
      phoneNumber: profile.phoneNumber || "",
      avatar: profile.avatar || "",
    });
    setFormErrors({});
    setEditError("");
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    setEditError("");
    if (!validateProfile()) return;

    setSaving(true);
    try {
      await profileApi.update({
        fullname: form.fullname.trim(),
        phoneNumber: form.phoneNumber.trim(),
        avatar: form.avatar,
      });
      reload();
      setEditing(false);
    } catch (e: any) {
      setEditError(e.message || "Cập nhật hồ sơ thất bại");
    } finally {
      setSaving(false);
    }
  };
  const handleUploadAvatar = async (file?: File) => {
    if (!file) return;

    if (
      !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
        file.type,
      )
    ) {
      setEditError("Chỉ cho phép ảnh JPG, JPEG, PNG hoặc WEBP");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setEditError("Ảnh không được vượt quá 5MB");
      return;
    }

    setUploadingAvatar(true);
    setEditError("");

    try {
      const res = await profileApi.uploadAvatar(file);
      const avatarUrl = res.data.avatar;

      setForm((f) => ({ ...f, avatar: avatarUrl }));
      await reload();
    } catch (e: any) {
      setEditError(e.message || "Upload avatar thất bại");
    } finally {
      setUploadingAvatar(false);
    }
  };
  const handleChangePassword = async () => {
    setPwError("");
    if (!validatePassword()) return;

    setPwSaving(true);
    try {
      await profileApi.changePassword({
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword,
        confirmPassword: pwForm.confirm,
      });

      setPwSuccess(true);
      setPwForm({ oldPassword: "", newPassword: "", confirm: "" });
      setPwErrors({});

      setTimeout(() => {
        setPwSuccess(false);
        setPwModal(false);
      }, 1500);
    } catch (e: any) {
      setPwError(e.message || "Đổi mật khẩu thất bại");
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-sm text-slate-400">Đang tải...</div>;
  }

  if (!profile) {
    return (
      <div className="p-8 text-sm text-red-500">
        Không thể tải thông tin hồ sơ.
      </div>
    );
  }

  const initials = (profile.fullname || profile.email).charAt(0).toUpperCase();

  const inputBase =
  "flex h-12 w-full items-center rounded-xl border border-slate-100 bg-[#f8f8f8] px-5 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-500/20";
  const labelBase = "mb-2 block text-[13px] font-medium text-slate-700";
  const errorBase = "mt-1.5 text-xs text-red-500";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
  <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white">
        <div className="h-[74px] bg-gradient-to-r from-[#b9d6f3] via-[#f3efe9] to-[#fff8dc]" />

        <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-10 pt-6">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-2xl font-semibold text-white shadow-md">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>

                {editing && (
                  <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-blue-500 text-xs text-white shadow-md">
                    {uploadingAvatar ? "..." : "✎"}
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleUploadAvatar(e.target.files?.[0])}
                    />
                  </label>
                )}
              </div>

              <div>
                <h1 className="text-[17px] font-semibold text-slate-950">
                  {profile.fullname || "—"}
                </h1>
                <p className="mt-1 text-sm text-slate-400">{profile.email}</p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.groups.map((g) => (
                    <span
                      key={g.id}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600"
                    >
                      {g.name}
                    </span>
                  ))}

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      profile.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {STATUS_LABEL[profile.status] || profile.status}
                  </span>
                </div>
              </div>
            </div>

            {!editing && (
              <button
                onClick={openEdit}
                className="rounded-md bg-blue-500 px-7 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600"
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-6">
              {editError && <p className="text-sm text-red-500">{editError}</p>}

              <div className="grid grid-cols-1 gap-x-7 gap-y-5 md:grid-cols-2">
                <div>
                  <label className={labelBase}>Full Name</label>
                  <input
                    className={`${inputBase} ${formErrors.fullname ? "ring-2 ring-red-500/20" : ""}`}
                    value={form.fullname}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, fullname: e.target.value }));
                      setFormErrors((err) => ({ ...err, fullname: undefined }));
                    }}
                    placeholder="Your Full Name"
                  />
                  {formErrors.fullname && (
                    <p className={errorBase}>{formErrors.fullname}</p>
                  )}
                </div>

                <div>
                  <label className={labelBase}>Phone Number</label>
                  <input
                    className={`${inputBase} ${formErrors.phoneNumber ? "ring-2 ring-red-500/20" : ""}`}
                    value={form.phoneNumber}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, phoneNumber: e.target.value }));
                      setFormErrors((err) => ({
                        ...err,
                        phoneNumber: undefined,
                      }));
                    }}
                    placeholder="Your Phone Number"
                    maxLength={10}
                  />
                  {formErrors.phoneNumber && (
                    <p className={errorBase}>{formErrors.phoneNumber}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormErrors({});
                    setEditError("");
                  }}
                  className="rounded-md bg-slate-100 px-7 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
                >
                  Hủy
                </button>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="rounded-md bg-blue-500 px-7 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-60"
                >
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-7 gap-y-5 md:grid-cols-2">
              <div>
                <label className={labelBase}>Email</label>
                <div className={inputBase}>{profile.email}</div>
              </div>

              <div>
                <label className={labelBase}>Full Name</label>
                <div className={inputBase}>{profile.fullname || "—"}</div>
              </div>

              <div>
                <label className={labelBase}>Phone Number</label>
                <div className={inputBase}>{profile.phoneNumber || "—"}</div>
              </div>

              <div>
                <label className={labelBase}>User ID</label>
                <div className={inputBase}>#{profile.id}</div>
              </div>
            </div>
          )}

          <div className="mt-7">
            <h2 className="mb-4 text-[15px] font-semibold text-slate-950">
              My email Address
            </h2>

            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                ✉
              </div>

              <div>
                <p className="text-sm font-medium text-slate-800">
                  {profile.email}
                </p>
              </div>
            </div>
          </div>

          {profile.permissions.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-[15px] font-semibold text-slate-950">
                Quyền truy cập
              </h2>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {profile.permissions.map((perm) => (
                  <div
                    key={perm.featureCode}
                    className="flex items-center justify-between rounded-xl bg-[#f8f8f8] px-4 py-3"
                  >
                    <span className="text-sm font-medium text-slate-700">
                      {perm.featureName}
                    </span>

                    <div className="flex gap-2">
                      {perm.canView && (
                        <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
                          Xem
                        </span>
                      )}

                      {perm.canEdit && (
                        <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">
                          Sửa
                        </span>
                      )}

                      {!perm.canView && !perm.canEdit && (
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-400">
                          Không có
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setPwError("");
              setPwErrors({});
              setPwSuccess(false);
              setPwModal(true);
            }}
            className="mt-7 rounded-md bg-blue-50 px-5 py-2.5 text-sm font-medium text-blue-500 transition hover:bg-blue-100"
          >
            Đổi mật khẩu
          </button>
        </div>
      </div>

      {pwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-950">
                Đổi mật khẩu
              </h3>

              <button
                onClick={() => {
                  setPwModal(false);
                  setPwError("");
                  setPwErrors({});
                  setPwForm({ oldPassword: "", newPassword: "", confirm: "" });
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {pwSuccess ? (
              <div className="py-6 text-center">
                <p className="text-sm font-medium text-emerald-600">
                  ✓ Đổi mật khẩu thành công!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pwError && <p className="text-xs text-red-500">{pwError}</p>}

                {[
                  { label: "Mật khẩu hiện tại", key: "oldPassword" },
                  { label: "Mật khẩu mới", key: "newPassword" },
                  { label: "Xác nhận mật khẩu mới", key: "confirm" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className={labelBase}>{label}</label>

                    <input
                      type="password"
                      className={`${inputBase} ${
                        pwErrors[key as keyof PwErrors]
                          ? "ring-2 ring-red-500/20"
                          : ""
                      }`}
                      value={pwForm[key as keyof typeof pwForm]}
                      onChange={(e) => {
                        setPwForm((f) => ({ ...f, [key]: e.target.value }));
                        setPwErrors((err) => ({ ...err, [key]: undefined }));
                      }}
                    />

                    {pwErrors[key as keyof PwErrors] && (
                      <p className={errorBase}>
                        {pwErrors[key as keyof PwErrors]}
                      </p>
                    )}
                  </div>
                ))}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setPwModal(false);
                      setPwError("");
                      setPwErrors({});
                      setPwForm({
                        oldPassword: "",
                        newPassword: "",
                        confirm: "",
                      });
                    }}
                    className="flex-1 rounded-md bg-slate-100 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
                  >
                    Hủy
                  </button>

                  <button
                    onClick={handleChangePassword}
                    disabled={pwSaving}
                    className="flex-1 rounded-md bg-blue-500 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-60"
                  >
                    {pwSaving ? "Đang lưu..." : "Xác nhận"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
