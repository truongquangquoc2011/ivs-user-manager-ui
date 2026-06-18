"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { authApi, groupApi, safeCall, userApi } from "@/src/lib/api";
import { GroupResponse, UserResponse, UserStatus } from "@/src/types";
import { useAuth } from "@/src/hook/useAuth";

const STATUS_CONFIG: Record<string, { labelKey: string; className: string }> = {
  ACTIVE: { labelKey: "active", className: "bg-[#0ac451] text-white" },
  INACTIVE: { labelKey: "inactive", className: "bg-slate-400 text-white" },
  LOCKED: { labelKey: "banned", className: "bg-red-500 text-white" },
};

const ROLE_CONFIG: Record<string, string> = {
  ProAdmin: "bg-[#193153] text-white",
  Admin: "bg-[#2d4b73] text-white",
  Manager: "bg-[#5c7598] text-white",
  HR: "bg-[#9aa9bf] text-white",
};

type FormErrors = Partial<{
  email: string;
  password: string;
  fullname: string;
  phoneNumber: string;
  status: string;
  groupId: string;
}>;

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
        <button onClick={onClose} className="text-sm opacity-70 hover:opacity-100">
          ✕
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("userPage");
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.INACTIVE;

  return (
    <span className={`inline-flex min-w-[72px] justify-center rounded-full px-3 py-1 text-xs font-bold ${cfg.className}`}>
      {t(cfg.labelKey as any)}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`inline-flex min-w-[90px] justify-center rounded-full px-3 py-1 text-xs font-semibold ${ROLE_CONFIG[role] ?? "bg-slate-200 text-slate-700"}`}>
      {role}
    </span>
  );
}

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[1px]">
      <div className="w-full max-w-[470px] rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-[#193153]">{title}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function UserPage() {
  const t = useTranslations("userPage");
  const { hasPermission } = useAuth();

  const canEdit = hasPermission("USER_MANAGEMENT", "canEdit");
  const canCreate =
    hasPermission("USER_CREATION", "canEdit") ||
    hasPermission("USER_MANAGEMENT", "canEdit");

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState<"fullname" | "email" | "username" | "status" | "role" | "createdAt">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [modalOpen, setModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<UserResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [toast, setToast] = useState<{
    type: ToastType;
    message: string;
  } | null>(null);

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const [form, setForm] = useState<{
    email: string;
    fullname: string;
    phoneNumber: string;
    status: UserStatus;
    groupIds: number[];
  }>({
    email: "",
    fullname: "",
    phoneNumber: "",
    status: "ACTIVE",
    groupIds: [],
  });

  const [regForm, setRegForm] = useState({
    email: "",
    password: "",
    fullname: "",
    phoneNumber: "",
    groupId: "",
  });

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^(0|\+84)[0-9]{9,10}$/.test(phone);

  const validateEditForm = () => {
    const errors: FormErrors = {};

    if (!form.email.trim()) errors.email = t("errors.emailEmpty");
    else if (!validateEmail(form.email.trim())) errors.email = t("errors.emailInvalid");

    if (!form.fullname.trim()) errors.fullname = t("errors.fullnameEmpty");
    else if (form.fullname.trim().length < 2) errors.fullname = t("errors.fullnameShort");

    if (!form.phoneNumber.trim()) errors.phoneNumber = t("errors.phoneEmpty");
    else if (!validatePhone(form.phoneNumber.trim())) errors.phoneNumber = t("errors.phoneInvalid");

    if (!form.status) errors.status = t("errors.statusEmpty");
    if (!form.groupIds.length) errors.groupId = t("errors.groupEmpty");

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = () => {
    const errors: FormErrors = {};

    if (!regForm.email.trim()) errors.email = t("errors.emailEmpty");
    else if (!validateEmail(regForm.email.trim())) errors.email = t("errors.emailInvalid");

    if (!regForm.password.trim()) errors.password = t("errors.passwordEmpty");
    else if (regForm.password.length < 6) errors.password = t("errors.passwordShort");

    if (!regForm.fullname.trim()) errors.fullname = t("errors.fullnameEmpty");
    else if (regForm.fullname.trim().length < 2) errors.fullname = t("errors.fullnameShort");

    if (!regForm.phoneNumber.trim()) errors.phoneNumber = t("errors.phoneEmpty");
    else if (!validatePhone(regForm.phoneNumber.trim())) errors.phoneNumber = t("errors.phoneInvalid");

    if (!regForm.groupId) errors.groupId = t("errors.groupEmpty");

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const load = async () => {
    setLoading(true);

    const skip = (page - 1) * take;

    const [usersRes, groupsRes] = await Promise.all([
      safeCall(() => userApi.getAll({ skip, take }), {
        items: [],
        total: 0,
        skip,
        take,
      }),
      safeCall(() => groupApi.getAll(), []),
    ]);

    setUsers(usersRes.items);
    setTotal(usersRes.total);
    setGroups(groupsRes);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [page, take]);

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir("asc");
  };

  const sortIcon = (key: typeof sortKey) => {
    if (sortKey !== key) return "↕";
    return sortDir === "asc" ? "↑" : "↓";
  };

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    const result = users.filter((user) => {
      const groupNames = user.groups?.map((g) => g.name).join(" ") ?? "";

      const matchSearch =
        !q ||
        user.fullname?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        groupNames.toLowerCase().includes(q);

      const matchRole =
        roleFilter === "ALL" ||
        user.groups?.some((g) => String(g.id) === roleFilter);

      const matchStatus = statusFilter === "ALL" || user.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });

    return [...result].sort((a, b) => {
      const getValue = (user: UserResponse) => {
        if (sortKey === "username") return user.email?.split("@")[0] ?? "";
        if (sortKey === "role") return user.groups?.[0]?.name ?? "";
        if (sortKey === "createdAt") return (user as any).createdAt ?? "";
        return String((user as any)[sortKey] ?? "");
      };

      const av = String(getValue(a)).toLowerCase();
      const bv = String(getValue(b)).toLowerCase();

      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [users, search, roleFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(total / take));
  const fromRow = total === 0 ? 0 : (page - 1) * take + 1;
  const toRow = Math.min(page * take, total);

  const openEdit = (user: UserResponse) => {
    setEditingUser(user);
    setError("");
    setFormErrors({});

    setForm({
      email: user.email ?? "",
      fullname: user.fullname ?? "",
      phoneNumber: user.phoneNumber ?? "",
      status: user.status ?? "ACTIVE",
      groupIds: user.groups?.map((g) => g.id) ?? [],
    });

    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    if (!validateEditForm()) return;

    setSaving(true);
    setError("");

    try {
      await userApi.update(editingUser.id, {
        email: form.email.trim(),
        fullname: form.fullname.trim(),
        phoneNumber: form.phoneNumber.trim(),
        status: form.status,
        groupIds: form.groupIds,
      });

      setModalOpen(false);
      showToast("success", t("messages.updateSuccess"));
      load();
    } catch (e: any) {
      const message = e.message || t("messages.updateFailed");
      setError(message);
      showToast("error", message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setSaving(true);
    setError("");

    try {
      await userApi.delete(deleteConfirm.id);
      setDeleteConfirm(null);
      showToast("success", t("messages.deleteSuccess"));
      load();
    } catch (e: any) {
      const message = e.message || t("messages.deleteFailed");
      setError(message);
      showToast("error", message);
    } finally {
      setSaving(false);
    }
  };

  const handleRegister = async () => {
    if (!validateRegisterForm()) return;

    setSaving(true);
    setError("");

    try {
      await authApi.register({
        ...regForm,
        email: regForm.email.trim(),
        fullname: regForm.fullname.trim(),
        phoneNumber: regForm.phoneNumber.trim(),
        groupId: Number(regForm.groupId),
      });

      setRegisterModalOpen(false);
      setRegForm({
        email: "",
        password: "",
        fullname: "",
        phoneNumber: "",
        groupId: "",
      });
      setFormErrors({});

      showToast("success", t("messages.createSuccess"));
      load();
    } catch (e: any) {
      const message = e.message || t("messages.createFailed");
      setError(message);
      showToast("error", message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#193153] outline-none transition placeholder:text-slate-400 focus:border-[#193153] focus:ring-4 focus:ring-[#193153]/10";
  const errorInputCls = "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/10";
  const fieldErrorCls = "mt-1 px-1 text-xs font-medium text-red-500";

  return (
    <div className="flex min-h-screen w-full bg-white p-6 text-[#193153]">
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      <div className="flex min-h-0 w-full flex-1 flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="mb-8">
          <h1 className="text-[32px] font-extrabold leading-tight tracking-[-0.04em]">
            {t("title")}
          </h1>
          <p className="mt-2 text-[15px] text-[#193153]">{t("subtitle")}</p>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("search")}
                className="h-11 w-[310px] rounded-full border border-slate-300 bg-white pl-12 pr-5 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
              />
            </div>

            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-11 rounded-full border border-slate-300 bg-white px-6 text-sm outline-none">
              <option value="ALL">{t("roleAll")}</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-11 rounded-full border border-slate-300 bg-white px-6 text-sm outline-none">
              <option value="ALL">{t("statusAll")}</option>
              <option value="ACTIVE">{t("active")}</option>
              <option value="INACTIVE">{t("inactive")}</option>
              <option value="LOCKED">{t("banned")}</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <button type="button" className="h-11 rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold">
              ⇧ {t("export")}
            </button>

            {canCreate && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setFormErrors({});
                  setRegForm({
                    email: "",
                    password: "",
                    fullname: "",
                    phoneNumber: "",
                    groupId: "",
                  });
                  setRegisterModalOpen(true);
                }}
                className="h-11 rounded-full bg-[#193153] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#12243f]"
              >
                ＋ {t("addUser")}
              </button>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="h-11 bg-[#193153] text-white">
                <th className="w-12 px-3">
                  <input type="checkbox" className="h-4 w-4 rounded" />
                </th>
                <th className="px-4 font-bold">
                  <button onClick={() => handleSort("fullname")} className="hover:underline">
                    {t("fullName")} {sortIcon("fullname")}
                  </button>
                </th>
                <th className="px-4 font-bold">
                  <button onClick={() => handleSort("email")} className="hover:underline">
                    {t("email")} {sortIcon("email")}
                  </button>
                </th>
                <th className="px-4 font-bold">
                  <button onClick={() => handleSort("username")} className="hover:underline">
                    {t("username")} {sortIcon("username")}
                  </button>
                </th>
                <th className="px-4 font-bold">
                  <button onClick={() => handleSort("status")} className="hover:underline">
                    {t("status")} {sortIcon("status")}
                  </button>
                </th>
                <th className="px-4 font-bold">
                  <button onClick={() => handleSort("role")} className="hover:underline">
                    {t("role")} {sortIcon("role")}
                  </button>
                </th>
                <th className="px-4 font-bold">
                  <button onClick={() => handleSort("createdAt")} className="hover:underline">
                    {t("joinedDate")} {sortIcon("createdAt")}
                  </button>
                </th>
                <th className="px-4 text-center font-bold">{t("actions")}</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    {t("loading")}
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    {t("noData")}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => {
                  const username = user.email?.split("@")[0] || `user${user.id}`;
                  const avatarText = (user.fullname || user.email || "?").charAt(0).toUpperCase();

                  return (
                    <tr key={user.id} className={`h-[42px] border-b border-slate-200 ${index % 2 === 0 ? "bg-white" : "bg-[#f1f6fc]"}`}>
                      <td className="px-3">
                        <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                      </td>

                      <td className="px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold">
                            {avatarText}
                          </div>
                          <span className="font-medium">{user.fullname || t("noName")}</span>
                        </div>
                      </td>

                      <td className="px-4">{user.email}</td>
                      <td className="px-4">{username}</td>

                      <td className="px-4">
                        <StatusBadge status={user.status} />
                      </td>

                      <td className="px-4">
                        <div className="flex flex-wrap gap-2">
                          {user.groups?.length ? user.groups.map((g) => <RoleBadge key={g.id} role={g.name} />) : "-"}
                        </div>
                      </td>

                      <td className="px-4">
                        {(user as any).createdAt
                          ? new Date((user as any).createdAt).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "-"}
                      </td>

                      <td className="px-4">
                        <div className="flex items-center justify-center gap-4">
                          {canEdit && (
                            <>
                              <button onClick={() => openEdit(user)} className="text-[#193153] hover:text-blue-600" title="Edit">
                                ✎
                              </button>

                              <button onClick={() => setDeleteConfirm(user)} className="text-red-400 hover:text-red-600" title="Delete">
                                ♲
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-3">
            <span className="font-bold">{t("rowsPerPage")}</span>

            <select
              value={take}
              onChange={(e) => {
                setTake(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-full border border-slate-200 px-3 py-1"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>

            <span>
              {fromRow}-{toRow} {t("of")} <b>{total}</b> {t("rows")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setPage(1)} disabled={page === 1} className="rounded-full border px-3 py-1 disabled:opacity-40">
              «
            </button>

            <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="rounded-full border px-3 py-1 disabled:opacity-40">
              ‹
            </button>

            <span className="px-3 font-semibold">
              {page} / {totalPages}
            </span>

            <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} className="rounded-full border px-3 py-1 disabled:opacity-40">
              ›
            </button>

            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="rounded-full border px-3 py-1 disabled:opacity-40">
              »
            </button>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t("editUser")}>
        <div className="space-y-4">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

          <div>
            <input
              className={`${inputCls} ${formErrors.email ? errorInputCls : ""}`}
              placeholder={t("emailPlaceholder")}
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                setFormErrors({ ...formErrors, email: undefined });
              }}
            />
            {formErrors.email && <p className={fieldErrorCls}>{formErrors.email}</p>}
          </div>

          <div>
            <input
              className={`${inputCls} ${formErrors.fullname ? errorInputCls : ""}`}
              placeholder={t("fullnamePlaceholder")}
              value={form.fullname}
              onChange={(e) => {
                setForm({ ...form, fullname: e.target.value });
                setFormErrors({ ...formErrors, fullname: undefined });
              }}
            />
            {formErrors.fullname && <p className={fieldErrorCls}>{formErrors.fullname}</p>}
          </div>

          <div>
            <input
              className={`${inputCls} ${formErrors.phoneNumber ? errorInputCls : ""}`}
              placeholder={t("phonePlaceholder")}
              value={form.phoneNumber}
              onChange={(e) => {
                setForm({ ...form, phoneNumber: e.target.value });
                setFormErrors({ ...formErrors, phoneNumber: undefined });
              }}
            />
            {formErrors.phoneNumber && <p className={fieldErrorCls}>{formErrors.phoneNumber}</p>}
          </div>

          <div>
            <select
              className={`${inputCls} ${formErrors.status ? errorInputCls : ""}`}
              value={form.status}
              onChange={(e) => {
                setForm({ ...form, status: e.target.value as UserStatus });
                setFormErrors({ ...formErrors, status: undefined });
              }}
            >
              <option value="ACTIVE">{t("active")}</option>
              <option value="INACTIVE">{t("inactive")}</option>
              <option value="LOCKED">{t("banned")}</option>
            </select>
            {formErrors.status && <p className={fieldErrorCls}>{formErrors.status}</p>}
          </div>

          <div>
            <select
              className={`${inputCls} ${formErrors.groupId ? errorInputCls : ""}`}
              value={form.groupIds[0] ?? ""}
              onChange={(e) => {
                setForm({
                  ...form,
                  groupIds: e.target.value ? [Number(e.target.value)] : [],
                });
                setFormErrors({ ...formErrors, groupId: undefined });
              }}
            >
              <option value="">{t("selectRole")}</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            {formErrors.groupId && <p className={fieldErrorCls}>{formErrors.groupId}</p>}
          </div>

          <button onClick={handleSave} disabled={saving} className="h-12 w-full rounded-xl bg-[#193153] text-sm font-bold text-white disabled:opacity-50">
            {saving ? t("saving") : t("save")}
          </button>
        </div>
      </Modal>

      <Modal open={registerModalOpen} onClose={() => setRegisterModalOpen(false)} title={t("addUserModal")}>
        <div className="space-y-4">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

          <div>
            <input
              className={`${inputCls} ${formErrors.email ? errorInputCls : ""}`}
              placeholder={t("emailPlaceholder")}
              value={regForm.email}
              onChange={(e) => {
                setRegForm({ ...regForm, email: e.target.value });
                setFormErrors({ ...formErrors, email: undefined });
              }}
            />
            {formErrors.email && <p className={fieldErrorCls}>{formErrors.email}</p>}
          </div>

          <div>
            <input
              className={`${inputCls} ${formErrors.password ? errorInputCls : ""}`}
              placeholder={t("passwordPlaceholder")}
              type="password"
              value={regForm.password}
              onChange={(e) => {
                setRegForm({ ...regForm, password: e.target.value });
                setFormErrors({ ...formErrors, password: undefined });
              }}
            />
            {formErrors.password && <p className={fieldErrorCls}>{formErrors.password}</p>}
          </div>

          <div>
            <input
              className={`${inputCls} ${formErrors.fullname ? errorInputCls : ""}`}
              placeholder={t("fullnamePlaceholder")}
              value={regForm.fullname}
              onChange={(e) => {
                setRegForm({ ...regForm, fullname: e.target.value });
                setFormErrors({ ...formErrors, fullname: undefined });
              }}
            />
            {formErrors.fullname && <p className={fieldErrorCls}>{formErrors.fullname}</p>}
          </div>

          <div>
            <input
              className={`${inputCls} ${formErrors.phoneNumber ? errorInputCls : ""}`}
              placeholder={t("phonePlaceholder")}
              value={regForm.phoneNumber}
              onChange={(e) => {
                setRegForm({ ...regForm, phoneNumber: e.target.value });
                setFormErrors({ ...formErrors, phoneNumber: undefined });
              }}
            />
            {formErrors.phoneNumber && <p className={fieldErrorCls}>{formErrors.phoneNumber}</p>}
          </div>

          <div>
            <select
              className={`${inputCls} ${formErrors.groupId ? errorInputCls : ""}`}
              value={regForm.groupId}
              onChange={(e) => {
                setRegForm({ ...regForm, groupId: e.target.value });
                setFormErrors({ ...formErrors, groupId: undefined });
              }}
            >
              <option value="">{t("selectRole")}</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            {formErrors.groupId && <p className={fieldErrorCls}>{formErrors.groupId}</p>}
          </div>

          <button onClick={handleRegister} disabled={saving} className="h-12 w-full rounded-xl bg-[#193153] text-sm font-bold text-white disabled:opacity-50">
            {saving ? t("creating") : t("create")}
          </button>
        </div>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title={t("deleteUser")}>
        <p className="mb-5 text-sm text-slate-500">
          {t("deleteConfirm")} <b>{deleteConfirm?.fullname || deleteConfirm?.email}</b>?
        </p>

        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold">
            {t("cancel")}
          </button>

          <button onClick={handleDelete} disabled={saving} className="h-10 rounded-xl bg-red-500 px-4 text-sm font-bold text-white disabled:opacity-50">
            {saving ? t("deleting") : t("delete")}
          </button>
        </div>
      </Modal>
    </div>
  );
}