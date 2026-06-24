"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { groupApi, userApi, safeCall } from "@/src/lib/api";
import { GroupResponse, GroupUserResponse, UserResponse } from "@/src/types";
import { useAuth } from "@/src/hook/useAuth";
import { useRouter } from "next/navigation";
type FormErrors = Partial<{
  name: string;
  description: string;
  addUserId: string;
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

function ConfirmPopup({
  open,
  title,
  message,
  cancelText,
  confirmText,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  cancelText: string;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-xl"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <h3 className="mb-2 text-base font-semibold">{title}</h3>
        <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 cursor-pointer rounded-xl py-2.5 text-sm"
            style={{
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 cursor-pointer rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-xl"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg"
            style={{ color: "var(--text-muted)" }}
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export default function GroupPage() {
  const t = useTranslations("groupMgmt");
  const { hasPermission } = useAuth();
  const router = useRouter();
  const canEdit = hasPermission("GROUP_MANAGEMENT", "canEdit");
  const canView = hasPermission("GROUP_MANAGEMENT", "canView");
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  useEffect(() => {
    if (!canView) {
      router.replace("/403"); //  ADD
    }
  }, [canView, router]);
  const [groupUsers, setGroupUsers] = useState<
    Record<number, GroupUserResponse[]>
  >({});
  const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [groupModal, setGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupResponse | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const [memberModal, setMemberModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupResponse | null>(
    null,
  );
  const [addUserId, setAddUserId] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<{
    type: ToastType;
    message: string;
  } | null>(null);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    groupId?: number;
  }>({
    open: false,
  });

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const validateGroupForm = () => {
    const errors: FormErrors = {};

    if (!groupForm.name.trim()) {
      errors.name = t("nameRequired");
    } else if (groupForm.name.trim().length < 2) {
      errors.name = t("nameMin");
    } else if (groupForm.name.trim().length > 50) {
      errors.name = t("nameMax");
    }

    if (groupForm.description.trim().length > 255) {
      errors.description = t("descMax");
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAddMember = () => {
    const errors: FormErrors = {};

    if (!addUserId) {
      errors.addUserId = t("selectUserRequired");
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const load = async () => {
    setLoading(true);

    const [groups, allUsersRes] = await Promise.all([
      safeCall(() => groupApi.getAll(), []),
      safeCall(() => userApi.getAll({ skip: 0, take: 100 }), {
        items: [],
        total: 0,
        skip: 0,
        take: 100,
      }),
    ]);

    setGroups(groups);
    setAllUsers(allUsersRes.items);

    const usersMap: Record<number, GroupUserResponse[]> = {};

    await Promise.all(
      groups.map(async (g) => {
        usersMap[g.id] = await safeCall(() => groupApi.getUsers(g.id), []);
      }),
    );

    setGroupUsers(usersMap);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingGroup(null);
    setGroupForm({ name: "", description: "", isActive: true });
    setError("");
    setFormErrors({});
    setGroupModal(true);
  };

  const openEdit = (g: GroupResponse) => {
    setEditingGroup(g);
    setGroupForm({
      name: g.name,
      description: g.description || "",
      isActive: g.isActive,
    });
    setError("");
    setFormErrors({});
    setGroupModal(true);
  };

  const handleSaveGroup = async () => {
    if (!validateGroupForm()) return;

    setSaving(true);
    setError("");

    try {
      const payload = {
        ...groupForm,
        name: groupForm.name.trim(),
        description: groupForm.description.trim(),
      };

      if (editingGroup) {
        await groupApi.update(editingGroup.id, payload);
      } else {
        await groupApi.create(payload);
      }

      setGroupModal(false);
      setFormErrors({});
      showToast("success", t("saveSuccess"));
      load();
    } catch (e: any) {
      setError(e.message);
      showToast("error", e.message || t("connectError"));
    } finally {
      setSaving(false);
    }
  };

  const askDeleteGroup = (id: number) => {
    setConfirmState({ open: true, groupId: id });
  };

  const handleDeleteGroup = async () => {
    if (!confirmState.groupId) return;

    try {
      await groupApi.delete(confirmState.groupId);
      setConfirmState({ open: false });
      showToast("success", t("deleteSuccess"));
      load();
    } catch (e: any) {
      setConfirmState({ open: false });
      showToast("error", e.message || t("connectError"));
    }
  };

  const openMembers = (g: GroupResponse) => {
    setSelectedGroup(g);
    setAddUserId("");
    setError("");
    setFormErrors({});
    setMemberModal(true);
  };

  const handleAddUser = async () => {
    if (!selectedGroup) return;
    if (!validateAddMember()) return;

    setSaving(true);
    setError("");

    try {
      await groupApi.addUser(selectedGroup.id, Number(addUserId));

      const r = await groupApi.getUsers(selectedGroup.id);
      setGroupUsers((prev) => ({ ...prev, [selectedGroup.id]: r.data }));

      setAddUserId("");
      setFormErrors({});
      showToast("success", t("addUserSuccess"));
      await load();
    } catch (e: any) {
      if (e.message?.includes("Duplicate entry")) {
        setError(t("duplicateUser"));
        showToast("error", t("duplicateUser"));
      } else {
        setError(e.message);
        showToast("error", e.message || t("connectError"));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveUser = async (userId: number) => {
    if (!selectedGroup) return;

    try {
      await groupApi.removeUser(selectedGroup.id, userId);

      const r = await groupApi.getUsers(selectedGroup.id);
      setGroupUsers((prev) => ({ ...prev, [selectedGroup.id]: r.data }));

      showToast("success", t("removeUserSuccess"));
      await load();
    } catch (e: any) {
      showToast("error", e.message || t("connectError"));
    }
  };

  const inputCls = "w-full rounded-lg px-3 py-2.5 text-sm outline-none";

  const inputStyle = {
    background: "var(--bg)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
  };

  const errorInputStyle = {
    background: "rgba(239, 68, 68, 0.06)",
    border: "1px solid rgba(239, 68, 68, 0.45)",
    color: "var(--text-primary)",
  };

  const membersInModal = selectedGroup
    ? (groupUsers[selectedGroup.id] ?? [])
    : [];

  const usersNotInGroup = allUsers.filter(
    (u) => !u.groups || u.groups.length === 0,
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 p-8">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmPopup
        open={confirmState.open}
        title={t("delete")}
        message={t("deleteConfirm")}
        cancelText={t("cancel")}
        confirmText={t("delete")}
        onCancel={() => setConfirmState({ open: false })}
        onConfirm={handleDeleteGroup}
      />

      <div className="flex min-h-0 w-full flex-1 flex-col">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <h1 className="mb-1 text-xl font-semibold">{t("title")}</h1>

            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {t("subtitleCount", { count: groups.length })}
            </p>
          </div>

          {canEdit && (
            <button
              onClick={openCreate}
              className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
              style={{ background: "var(--bg-sidebar)", color: "#f0efe8" }}
            >
              <span>+</span> {t("create")}
            </button>
          )}
        </div>

        {loading ? (
          <div
            className="py-16 text-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            {t("loading")}
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {groups.map((group) => {
                const members = groupUsers[group.id] ?? [];

                return (
                  <div
                    key={group.id}
                    className="flex h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* HEADER */}
                    <div className="border-b bg-slate-50 px-5 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
                            👥
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-900">
                              {group.name}
                            </h3>

                            <p className="text-xs text-slate-500">
                              {members.length} thành viên
                            </p>

                            {group.description && (
                              <p className="mt-1 text-xs text-slate-400">
                                {group.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <span
                          className={`rounded-full border px-2 py-1 text-xs font-medium ${
                            group.isActive
                              ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                              : "border-slate-300 bg-slate-100 text-slate-500"
                          }`}
                        >
                          {group.isActive ? t("active") : t("inactive")}
                        </span>
                      </div>
                    </div>

                    {/* MEMBERS */}
                    <div className="flex-1 overflow-y-auto p-4">
                      {members.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">
                          {t("noMembers")}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {members.slice(0, 6).map((m) => (
                            <div
                              key={m.id}
                              className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2"
                            >
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8eef8] font-bold text-[#193153]">
                                {(m.fullname || m.email)
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-900">
                                  {m.fullname || "—"}
                                </p>

                                <p className="truncate text-xs text-slate-500">
                                  {m.email}
                                </p>
                              </div>

                              {canEdit && (
                                <button
                                  onClick={() => handleRemoveUser(m.id)}
                                  className="text-xs font-medium text-red-500 hover:underline"
                                >
                                  {t("remove")}
                                </button>
                              )}
                            </div>
                          ))}

                          {members.length > 6 && (
                            <div className="pt-2 text-center text-xs font-medium text-slate-500">
                              + {members.length - 6} thành viên khác
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* FOOTER */}
                    <div className="flex items-center justify-between border-t px-5 py-3">
                      <div className="flex items-center gap-2">
                        {canEdit && (
                          <button
                            onClick={() => openEdit(group)}
                            className="text-xs font-medium text-[#193153]"
                          >
                            {t("edit")}
                          </button>
                        )}

                        {canEdit && (
                          <button
                            disabled={members.length > 0}
                            onClick={() => askDeleteGroup(group.id)}
                            className={`text-xs font-medium ${
                              members.length > 0
                                ? "cursor-not-allowed text-slate-400"
                                : "text-red-500 hover:underline"
                            }`}
                          >
                            {t("delete")}
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => openMembers(group)}
                        className="rounded-lg bg-black px-4 py-2 text-xs font-medium text-white"
                      >
                        {t("manageMembers")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Modal
          open={groupModal}
          onClose={() => setGroupModal(false)}
          title={editingGroup ? t("modalUpdate") : t("modalCreate")}
        >
          <div className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
                {error}
              </div>
            )}

            <div>
              <label
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("groupName")}
              </label>

              <input
                className={inputCls}
                style={formErrors.name ? errorInputStyle : inputStyle}
                value={groupForm.name}
                onChange={(e) => {
                  setGroupForm((f) => ({ ...f, name: e.target.value }));
                  setFormErrors((prev) => ({ ...prev, name: undefined }));
                }}
              />

              {formErrors.name && (
                <p className="mt-1 px-1 text-xs font-medium text-red-500">
                  {formErrors.name}
                </p>
              )}
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("description")}
              </label>

              <textarea
                rows={2}
                className={inputCls}
                style={formErrors.description ? errorInputStyle : inputStyle}
                value={groupForm.description}
                onChange={(e) => {
                  setGroupForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }));
                  setFormErrors((prev) => ({
                    ...prev,
                    description: undefined,
                  }));
                }}
              />

              {formErrors.description && (
                <p className="mt-1 px-1 text-xs font-medium text-red-500">
                  {formErrors.description}
                </p>
              )}
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={groupForm.isActive}
                onChange={(e) =>
                  setGroupForm((f) => ({ ...f, isActive: e.target.checked }))
                }
              />
              {t("activeGroup")}
            </label>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setGroupModal(false)}
                className="flex-1 cursor-pointer rounded-xl py-2.5 text-sm"
                style={{
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                {t("cancel")}
              </button>

              <button
                onClick={handleSaveGroup}
                disabled={saving}
                className="flex-1 cursor-pointer rounded-xl py-2.5 text-sm font-medium disabled:opacity-60"
                style={{ background: "var(--bg-sidebar)", color: "#f0efe8" }}
              >
                {saving ? t("saving") : t("save")}
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          open={memberModal}
          onClose={() => setMemberModal(false)}
          title={t("memberTitle", { name: selectedGroup?.name || "" })}
        >
          <div className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
                {error}
              </div>
            )}

            <div>
              <p
                className="mb-2 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                {t("currentMembers")}
              </p>

              <div className="max-h-40 space-y-1.5 overflow-y-auto">
                {membersInModal.length === 0 && (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {t("noMembers")}
                  </p>
                )}

                {membersInModal.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2"
                    style={{ background: "var(--bg)" }}
                  >
                    <div>
                      <p className="text-sm font-medium">{m.fullname || "—"}</p>

                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {m.email}
                      </p>
                    </div>

                    {canEdit && (
                      <button
                        onClick={() => handleRemoveUser(m.id)}
                        className="cursor-pointer text-xs"
                        style={{ color: "var(--danger)" }}
                      >
                        {t("remove")}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {canEdit && (
              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: "12px",
                }}
              >
                <p
                  className="mb-2 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  {t("addMember")}
                </p>

                <div className="flex gap-2">
                  <select
                    className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                    style={formErrors.addUserId ? errorInputStyle : inputStyle}
                    value={addUserId}
                    onChange={(e) => {
                      setAddUserId(e.target.value);
                      setFormErrors((prev) => ({
                        ...prev,
                        addUserId: undefined,
                      }));
                    }}
                  >
                    <option value="">{t("selectUser")}</option>

                    {usersNotInGroup.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullname || u.email}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleAddUser}
                    disabled={saving}
                    className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
                    style={{ background: "var(--accent)", color: "white" }}
                  >
                    {t("add")}
                  </button>
                </div>

                {formErrors.addUserId && (
                  <p className="mt-1 px-1 text-xs font-medium text-red-500">
                    {formErrors.addUserId}
                  </p>
                )}
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
