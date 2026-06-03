"use client";
import React, { useEffect, useState } from "react";
import { groupApi, userApi, safeCall } from "@/src/lib/api";
import { GroupResponse, GroupUserResponse, UserResponse } from "@/src/types";
import { useAuth } from "@/src/hook/useAuth";

type FormErrors = Partial<{
  name: string;
  description: string;
  addUserId: string;
}>;

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
  const { hasPermission } = useAuth();
  const canEdit = hasPermission("GROUP_MANAGEMENT", "canEdit");

  const [groups, setGroups] = useState<GroupResponse[]>([]);
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

  const validateGroupForm = () => {
    const errors: FormErrors = {};

    if (!groupForm.name.trim()) {
      errors.name = "Tên nhóm không được để trống";
    } else if (groupForm.name.trim().length < 2) {
      errors.name = "Tên nhóm phải có ít nhất 2 ký tự";
    } else if (groupForm.name.trim().length > 50) {
      errors.name = "Tên nhóm không được vượt quá 50 ký tự";
    }

    if (groupForm.description.trim().length > 255) {
      errors.description = "Mô tả không được vượt quá 255 ký tự";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAddMember = () => {
    const errors: FormErrors = {};

    if (!addUserId) {
      errors.addUserId = "Vui lòng chọn người dùng";
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
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async (id: number) => {
    if (!confirm("Xóa nhóm này?")) return;
    try {
      await groupApi.delete(id);
      load();
    } catch (e: any) {
      alert(e.message);
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
      await load();
    } catch (e: any) {
      if (e.message?.includes("Duplicate entry")) {
        setError(
          "Người dùng này đã thuộc một nhóm khác, không thể thêm trùng.",
        );
      } else {
        setError(e.message);
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
      await load();
    } catch (e: any) {
      alert(e.message);
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
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <h1 className="mb-1 text-xl font-semibold">Quản lý nhóm</h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {groups.length} nhóm trong hệ thống
            </p>
          </div>
          {canEdit && (
            <button
              onClick={openCreate}
              className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
              style={{ background: "var(--bg-sidebar)", color: "#f0efe8" }}
            >
              <span>+</span> Tạo nhóm
            </button>
          )}
        </div>

        {loading ? (
          <div
            className="py-16 text-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Đang tải...
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="space-y-4">
              {groups.map((group) => {
                const members = groupUsers[group.id] ?? [];

                return (
                  <div
                    key={group.id}
                    className="
    overflow-hidden
    rounded-2xl
    border
    border-slate-200
    bg-white
    shadow-sm
    hover:shadow-md
    transition-shadow
  "
                  >
                    <div className="flex items-center justify-between bg-slate-50 px-5 py-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-bold text-slate-900">
                          {group.name}
                        </h3>

                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            group.isActive
                              ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                              : "border-slate-300 bg-slate-100 text-slate-500"
                          }`}
                        >
                          {group.isActive ? "Active" : "Inactive"}
                        </span>

                        {group.description && (
                          <span className="text-xs text-slate-400">
                            {group.description}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {canEdit && (
                          <>
                            <button
                              onClick={() => openEdit(group)}
                              className="text-xs font-medium text-[#193153] hover:underline"
                            >
                              Sửa
                            </button>

                            <button
                              onClick={() => handleDeleteGroup(group.id)}
                              className="text-xs font-medium text-red-500 hover:underline"
                            >
                              Xóa
                            </button>
                          </>
                        )}

                      </div>
                    </div>

                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-white text-xs text-slate-900">
                          <th className="px-5 py-3 font-bold">Name</th>
                          <th className="px-5 py-3 font-bold">Level</th>
                          <th className="px-5 py-3 font-bold">Email</th>
                          <th className="px-5 py-3 text-right font-bold">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {members.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-5 py-6 text-center text-xs text-slate-400"
                            >
                              Chưa có thành viên
                            </td>
                          </tr>
                        ) : (
                          members.map((m) => (
                            <tr
                              key={m.id}
                              className="border-b border-slate-50 even:bg-slate-50/70"
                            >
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8eef8] text-xs font-bold text-[#193153]">
                                    {(m.fullname || m.email)
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>

                                  <span className="font-medium text-slate-900">
                                    {m.fullname || "—"}
                                  </span>
                                </div>
                              </td>

                              <td className="px-5 py-3 text-slate-700">
                                {group.name}
                              </td>

                              <td className="px-5 py-3 text-slate-500">
                                {m.email}
                              </td>

                              <td className="px-5 py-3">
                                <div className="flex justify-end gap-3">
                                  {canEdit && (
                                    <button
                                      onClick={() => handleRemoveUser(m.id)}
                                      className="text-xs font-medium text-red-500 hover:underline"
                                    >
                                      Loại
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    <div className="flex items-center justify-between px-5 py-3">
                      {canEdit ? (
                        <button
                          onClick={() => openMembers(group)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#4f63ff] text-xl leading-none text-[#4f63ff] hover:bg-[#4f63ff] hover:text-white"
                        >
                          +
                        </button>
                      ) : (
                        <span />
                      )}

                      <button
                        onClick={() => openMembers(group)}
                        className="rounded-lg bg-black px-4 py-2 text-xs font-medium text-white"
                      >
                        Quản lý thành viên
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
          title={editingGroup ? "Cập nhật nhóm" : "Tạo nhóm mới"}
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
                Tên nhóm
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
                Mô tả
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
              Kích hoạt nhóm
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
                Hủy
              </button>
              <button
                onClick={handleSaveGroup}
                disabled={saving}
                className="flex-1 cursor-pointer rounded-xl py-2.5 text-sm font-medium disabled:opacity-60"
                style={{ background: "var(--bg-sidebar)", color: "#f0efe8" }}
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          open={memberModal}
          onClose={() => setMemberModal(false)}
          title={`Thành viên — ${selectedGroup?.name}`}
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
                Danh sách hiện tại
              </p>
              <div className="max-h-40 space-y-1.5 overflow-y-auto">
                {membersInModal.length === 0 && (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Chưa có thành viên
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
                        Loại
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
                  Thêm thành viên
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
                    <option value="">Chọn người dùng</option>
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
                    Thêm
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
