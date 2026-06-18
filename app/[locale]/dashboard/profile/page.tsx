"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { profileApi } from "@/src/lib/api";
import { useAuth } from "@/src/hook/useAuth";

const STATUS_CONFIG: Record<string, { labelKey: string; className: string }> = {
  ACTIVE: {
    labelKey: "status.active",
    className: "bg-emerald-50 text-emerald-600",
  },
  INACTIVE: {
    labelKey: "status.inactive",
    className: "bg-slate-100 text-slate-500",
  },
  LOCKED: {
    labelKey: "status.locked",
    className: "bg-red-50 text-red-600",
  },
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

type ToastType = "success" | "error" | "warning";

function Toast({
  type,
  message,
  onClose,
}: {
  type: ToastType;
  message: string;
  onClose: () => void;
}) {
  const bg =
    type === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : type === "warning"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-red-50 text-red-700 border-red-200";

  return (
    <div
      className={`fixed right-6 top-6 z-[9999] min-w-[280px] rounded-xl border px-4 py-3 shadow-lg ${bg}`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="text-sm opacity-70 hover:opacity-100"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const t = useTranslations("profilePage");
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

  const [toast, setToast] = useState<{
    type: ToastType;
    message: string;
  } | null>(null);

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const validateProfile = () => {
    const errors: FormErrors = {};
    const fullname = form.fullname.trim();
    const phoneNumber = form.phoneNumber.trim();

    if (!fullname) errors.fullname = t("errors.fullnameEmpty");
    else if (fullname.length < 2) errors.fullname = t("errors.fullnameShort");
    else if (fullname.length > 60) errors.fullname = t("errors.fullnameLong");
    else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(fullname)) {
      errors.fullname = t("errors.fullnameInvalid");
    }

    if (phoneNumber && !/^0\d{9}$/.test(phoneNumber)) {
      errors.phoneNumber = t("errors.phoneInvalid");
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = () => {
    const errors: PwErrors = {};
    const { oldPassword, newPassword, confirm } = pwForm;

    if (!oldPassword.trim()) {
      errors.oldPassword = t("errors.oldPasswordEmpty");
    }

    if (!newPassword.trim()) errors.newPassword = t("errors.newPasswordEmpty");
    else if (!/[A-Z]/.test(newPassword)) {
      errors.newPassword = t("errors.passwordUppercase");
    } else if (!/[a-z]/.test(newPassword)) {
      errors.newPassword = t("errors.passwordLowercase");
    } else if (!/\d/.test(newPassword)) {
      errors.newPassword = t("errors.passwordNumber");
    } else if (oldPassword && oldPassword === newPassword) {
      errors.newPassword = t("errors.passwordSame");
    }

    if (!confirm.trim()) errors.confirm = t("errors.confirmEmpty");
    else if (newPassword !== confirm) {
      errors.confirm = t("errors.confirmNotMatch");
    }

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

      await reload();
      setEditing(false);
      showToast("success", t("messages.updateSuccess"));
    } catch (e: any) {
      const message = e.message || t("messages.updateFailed");
      setEditError(message);
      showToast("error", message);
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
      const message = t("messages.avatarTypeInvalid");
      setEditError(message);
      showToast("error", message);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const message = t("messages.avatarSizeInvalid");
      setEditError(message);
      showToast("error", message);
      return;
    }

    setUploadingAvatar(true);
    setEditError("");

    try {
      const res = await profileApi.uploadAvatar(file);
      const avatarUrl = res.data.avatar;

      setForm((f) => ({ ...f, avatar: avatarUrl }));
      await reload();
      showToast("success", t("messages.avatarSuccess"));
    } catch (e: any) {
      const message = e.message || t("messages.avatarUploadFailed");
      setEditError(message);
      showToast("error", message);
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
      showToast("success", t("messages.changePasswordSuccess"));

      setTimeout(() => {
        setPwSuccess(false);
        setPwModal(false);
      }, 1500);
    } catch (e: any) {
      const message = e.message || t("messages.changePasswordFailed");
      setPwError(message);
      showToast("error", message);
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-sm text-slate-400">{t("loading")}</div>;
  }

  if (!profile) {
    return <div className="p-8 text-sm text-red-500">{t("loadFailed")}</div>;
  }

  const initials = (profile.fullname || profile.email).charAt(0).toUpperCase();
  const statusConfig = STATUS_CONFIG[profile.status];

  const inputBase =
    "flex h-12 w-full items-center rounded-xl border border-slate-100 bg-[#f8f8f8] px-5 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-500/20";

  const labelBase = "mb-2 block text-[13px] font-medium text-slate-700";
  const errorBase = "mt-1.5 text-xs text-red-500";

  return (
    <div className="w-full bg-white">
      {" "}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      <div className="w-full flex flex-col bg-white">
        <div className="h-[74px] bg-gradient-to-r from-[#b9d6f3] via-[#f3efe9] to-[#fff8dc]" />
        <div className="px-8 pb-10 pt-6">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-2xl font-semibold text-white shadow-md">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={t("avatarAlt")}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>

                {editing && (
                  <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-blue-500 text-xs text-white shadow-md">
                    {uploadingAvatar ? t("uploading") : "✎"}
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
                  {profile.fullname || t("empty")}
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
                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusConfig?.className ?? "bg-slate-100 text-slate-500"}`}
                  >
                    {statusConfig ? t(statusConfig.labelKey) : profile.status}
                  </span>
                </div>
              </div>
            </div>

            {!editing && (
              <button
                onClick={openEdit}
                className="rounded-md bg-blue-500 px-7 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600"
              >
                {t("buttons.edit")}
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-6">
              {editError && <p className="text-sm text-red-500">{editError}</p>}

              <div className="grid grid-cols-1 gap-x-7 gap-y-5 md:grid-cols-2">
                <div>
                  <label className={labelBase}>{t("fields.fullname")}</label>
                  <input
                    className={`${inputBase} ${formErrors.fullname ? "ring-2 ring-red-500/20" : ""}`}
                    value={form.fullname}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, fullname: e.target.value }));
                      setFormErrors((err) => ({ ...err, fullname: undefined }));
                    }}
                    placeholder={t("placeholders.fullname")}
                  />
                  {formErrors.fullname && (
                    <p className={errorBase}>{formErrors.fullname}</p>
                  )}
                </div>

                <div>
                  <label className={labelBase}>{t("fields.phoneNumber")}</label>
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
                    placeholder={t("placeholders.phoneNumber")}
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
                  {t("buttons.cancel")}
                </button>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="rounded-md bg-blue-500 px-7 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-60"
                >
                  {saving ? t("buttons.saving") : t("buttons.save")}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-7 gap-y-5 md:grid-cols-2">
              <div>
                <label className={labelBase}>{t("fields.email")}</label>
                <div className={inputBase}>{profile.email}</div>
              </div>

              <div>
                <label className={labelBase}>{t("fields.fullname")}</label>
                <div className={inputBase}>
                  {profile.fullname || t("empty")}
                </div>
              </div>

              <div>
                <label className={labelBase}>{t("fields.phoneNumber")}</label>
                <div className={inputBase}>
                  {profile.phoneNumber || t("empty")}
                </div>
              </div>

              <div>
                <label className={labelBase}>{t("fields.userId")}</label>
                <div className={inputBase}>#{profile.id}</div>
              </div>
            </div>
          )}

          <div className="mt-7">
            <h2 className="mb-4 text-[15px] font-semibold text-slate-950">
              {t("emailSectionTitle")}
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
                {t("permissionsTitle")}
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
                          {t("permissions.view")}
                        </span>
                      )}

                      {perm.canEdit && (
                        <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">
                          {t("permissions.edit")}
                        </span>
                      )}

                      {!perm.canView && !perm.canEdit && (
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-400">
                          {t("permissions.none")}
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
            {t("changePasswordTitle")}
          </button>
        </div>
      </div>
      {pwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-950">
                {t("changePasswordTitle")}
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
                  {t("messages.changePasswordSuccess")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pwError && <p className="text-xs text-red-500">{pwError}</p>}

                {[
                  { label: t("fields.oldPassword"), key: "oldPassword" },
                  { label: t("fields.newPassword"), key: "newPassword" },
                  { label: t("fields.confirmPassword"), key: "confirm" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className={labelBase}>{label}</label>

                    <input
                      type="password"
                      className={`${inputBase} ${pwErrors[key as keyof PwErrors] ? "ring-2 ring-red-500/20" : ""}`}
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
                    {t("buttons.cancel")}
                  </button>

                  <button
                    onClick={handleChangePassword}
                    disabled={pwSaving}
                    className="flex-1 rounded-md bg-blue-500 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-60"
                  >
                    {pwSaving ? t("buttons.saving") : t("buttons.confirm")}
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
