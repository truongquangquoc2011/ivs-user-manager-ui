"use client";
import React, { useEffect, useState } from "react";
import { groupApi, userApi, safeCall } from "@/src/lib/api";
import { GroupResponse, GroupUserResponse, UserResponse } from "@/src/types";
import { useAuth } from "@/src/hook/useAuth";

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
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-base">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
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

    // Load members của từng group — bỏ qua nếu 403
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
    setGroupModal(true);
  };

  const handleSaveGroup = async () => {
    setSaving(true);
    setError("");
    try {
      if (editingGroup) {
        await groupApi.update(editingGroup.id, groupForm);
      } else {
        await groupApi.create(groupForm);
      }
      setGroupModal(false);
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
    setMemberModal(true);
  };

  const handleAddUser = async () => {
    if (!selectedGroup || !addUserId) return;
    setSaving(true);
    try {
      await groupApi.addUser(selectedGroup.id, Number(addUserId));
      const r = await groupApi.getUsers(selectedGroup.id);
      setGroupUsers((prev) => ({ ...prev, [selectedGroup.id]: r.data }));
      setAddUserId("");
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
    } catch (e: any) {
      alert(e.message);
    }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg text-sm outline-none";
  const inputStyle = {
    background: "var(--bg)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
  };

  const membersInModal = selectedGroup
    ? (groupUsers[selectedGroup.id] ?? [])
    : [];
  const usersNotInGroup = allUsers.filter(
    (u) => !u.groups || u.groups.length === 0,
  );

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-7">
        <div>
          <h1 className="text-xl font-semibold mb-1">Quản lý nhóm</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {groups.length} nhóm trong hệ thống
          </p>
        </div>
        {canEdit && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
            style={{ background: "var(--bg-sidebar)", color: "#f0efe8" }}
          >
            <span>+</span> Tạo nhóm
          </button>
        )}
      </div>

      {loading ? (
        <div
          className="text-center py-16 text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Đang tải...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => {
            const members = groupUsers[group.id] ?? [];
            return (
              <div
                key={group.id}
                className="rounded-2xl p-5"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                {/* Group header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{
                          background: "var(--accent-light)",
                          color: "var(--accent)",
                        }}
                      >
                        {group.name.charAt(0)}
                      </div>
                      <h3 className="font-semibold text-sm">{group.name}</h3>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: group.isActive
                            ? "var(--success-light)"
                            : "var(--bg)",
                          color: group.isActive
                            ? "var(--success)"
                            : "var(--text-muted)",
                          border: "1px solid currentColor",
                        }}
                      >
                        {group.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {group.description && (
                      <p
                        className="text-xs mt-1.5 ml-10"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {group.description}
                      </p>
                    )}
                  </div>
                  {canEdit && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(group)}
                        className="text-xs font-medium cursor-pointer"
                        style={{ color: "var(--accent)" }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="text-xs font-medium cursor-pointer"
                        style={{ color: "var(--danger)" }}
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </div>

                {/* Members */}
                <div
                  style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: "12px",
                  }}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {members.length} thành viên
                    </span>
                    <button
                      onClick={() => openMembers(group)}
                      className="text-xs font-medium cursor-pointer"
                      style={{ color: "var(--accent)" }}
                    >
                      Quản lý
                    </button>
                  </div>
                  <div className="space-y-1">
                    {members.slice(0, 3).map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg"
                        style={{ background: "var(--bg)" }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                          style={{
                            background: "var(--accent-light)",
                            color: "var(--accent)",
                          }}
                        >
                          {(m.fullname || m.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">
                            {m.fullname || "—"}
                          </p>
                          <p
                            className="text-xs truncate"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {m.email}
                          </p>
                        </div>
                      </div>
                    ))}
                    {members.length > 3 && (
                      <p
                        className="text-xs pl-2 pt-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        +{members.length - 3} người khác
                      </p>
                    )}
                    {members.length === 0 && (
                      <p
                        className="text-xs pl-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Chưa có thành viên
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Group create/edit modal */}
      <Modal
        open={groupModal}
        onClose={() => setGroupModal(false)}
        title={editingGroup ? "Cập nhật nhóm" : "Tạo nhóm mới"}
      >
        <div className="space-y-4">
          {error && (
            <p className="text-xs" style={{ color: "var(--danger)" }}>
              {error}
            </p>
          )}
          <div>
            <label
              className="text-xs font-medium uppercase tracking-wider block mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Tên nhóm
            </label>
            <input
              className={inputCls}
              style={inputStyle}
              value={groupForm.name}
              onChange={(e) =>
                setGroupForm((f) => ({ ...f, name: e.target.value }))
              }
            />
          </div>
          <div>
            <label
              className="text-xs font-medium uppercase tracking-wider block mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Mô tả
            </label>
            <textarea
              rows={2}
              className={inputCls}
              style={inputStyle}
              value={groupForm.description}
              onChange={(e) =>
                setGroupForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
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
              className="flex-1 py-2.5 rounded-xl text-sm cursor-pointer"
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
              className="flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-60"
              style={{ background: "var(--bg-sidebar)", color: "#f0efe8" }}
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Members modal */}
      <Modal
        open={memberModal}
        onClose={() => setMemberModal(false)}
        title={`Thành viên — ${selectedGroup?.name}`}
      >
        <div className="space-y-4">
          {error && (
            <p className="text-xs" style={{ color: "var(--danger)" }}>
              {error}
            </p>
          )}

          {/* Current members */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Danh sách hiện tại
            </p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {membersInModal.length === 0 && (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Chưa có thành viên
                </p>
              )}
              {membersInModal.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg"
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
                      className="text-xs cursor-pointer"
                      style={{ color: "var(--danger)" }}
                    >
                      Loại
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add member */}
          {canEdit && (
            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "12px",
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                Thêm thành viên
              </p>
              <div className="flex gap-2">
                <select
                  className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                  style={inputStyle}
                  value={addUserId}
                  onChange={(e) => setAddUserId(e.target.value)}
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
                  disabled={saving || !addUserId}
                  className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
                  style={{ background: "var(--accent)", color: "white" }}
                >
                  Thêm
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
