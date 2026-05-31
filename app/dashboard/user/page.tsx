'use client';
import React, { useEffect, useState } from 'react';
import { userApi, groupApi, authApi, safeCall } from '@/src/lib/api';
import { UserResponse, GroupResponse, UserStatus } from '@/src/types';
import { useAuth } from '@/src/hook/useAuth';

const STATUS_CONFIG = {
  ACTIVE: { label: 'Hoạt động', bg: 'var(--success-light)', color: 'var(--success)' },
  INACTIVE: { label: 'Chưa kích hoạt', bg: '#f8f8f6', color: 'var(--text-muted)' },
  LOCKED: { label: 'Bị khóa', bg: 'var(--danger-light)', color: 'var(--danger)' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.INACTIVE;
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

function Modal({
  open, onClose, title, children,
}: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 shadow-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-base">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer" style={{ color: 'var(--text-muted)' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function UserPage() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('USER_MANAGEMENT', 'canEdit');
  const canCreate = hasPermission('USER_CREATION', 'canEdit');

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<UserResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Edit form state
  const [form, setForm] = useState<{ fullname: string; phoneNumber: string; status: UserStatus; groupIds: number[] }>({ fullname: '', phoneNumber: '', status: 'ACTIVE', groupIds: [] });

  // Register form state
  const [regForm, setRegForm] = useState({ email: '', password: '', fullname: '', phoneNumber: '', groupId: '' });

  const load = async () => {
    setLoading(true);
    const [users, groups] = await Promise.all([
      safeCall(() => userApi.getAll(), []),
      safeCall(() => groupApi.getAll(), []),
    ]);
    setUsers(users);
    setGroups(groups);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openEdit = (user: UserResponse) => {
    setEditingUser(user);
    setForm({
      fullname: user.fullname ?? '',
      phoneNumber: user.phoneNumber ?? '',
      status: user.status,
      groupIds: user.groups.map(g => g.id),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    setError('');
    try {
      await userApi.update(editingUser.id, form);
      setModalOpen(false);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    try {
      await userApi.delete(deleteConfirm.id);
      setDeleteConfirm(null);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally { setSaving(false); }
  };

  const handleRegister = async () => {
    setSaving(true);
    setError('');
    try {
      await authApi.register({ ...regForm, groupId: Number(regForm.groupId) });
      setRegisterModalOpen(false);
      setRegForm({ email: '', password: '', fullname: '', phoneNumber: '', groupId: '' });
      load();
    } catch (e: any) {
      setError(e.message);
    } finally { setSaving(false); }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors";
  const inputStyle = { background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-7">
        <div>
          <h1 className="text-xl font-semibold mb-1">Quản lý người dùng</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {users.length} tài khoản trong hệ thống
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => { setError(''); setRegisterModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors"
            style={{ background: 'var(--bg-sidebar)', color: '#f0efe8' }}
          >
            <span>+</span> Thêm người dùng
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {loading ? (
          <div className="p-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                {['Họ tên', 'Email', 'Số điện thoại', 'Nhóm', 'Trạng thái', ''].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr
                  key={user.id}
                  style={{ borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none' }}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                        style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                      >
                        {(user.fullname || user.email).charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{user.fullname || '—'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                  <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{user.phoneNumber || '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.groups.map(g => (
                        <span key={g.id} className="px-2 py-0.5 rounded-md text-xs" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                          {g.name}
                        </span>
                      ))}
                      {user.groups.length === 0 && <span style={{ color: 'var(--text-muted)' }} className="text-sm">—</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={user.status} /></td>
                  <td className="px-5 py-4">
                    {canEdit && (
                      <div className="flex items-center gap-3 justify-end">
                        <button onClick={() => openEdit(user)} className="text-xs font-medium cursor-pointer transition-colors" style={{ color: 'var(--accent)' }}>
                          Sửa
                        </button>
                        <button onClick={() => setDeleteConfirm(user)} className="text-xs font-medium cursor-pointer transition-colors" style={{ color: 'var(--danger)' }}>
                          Xóa
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Cập nhật người dùng">
        <div className="space-y-4">
          {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Họ tên</label>
            <input className={inputCls} style={inputStyle} value={form.fullname} onChange={e => setForm(f => ({ ...f, fullname: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Số điện thoại</label>
            <input className={inputCls} style={inputStyle} value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Trạng thái</label>
            <select className={inputCls} style={inputStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Chưa kích hoạt</option>
              <option value="LOCKED">Bị khóa</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nhóm</label>
            <div className="flex flex-wrap gap-2">
              {groups.map(g => {
                const checked = form.groupIds.includes(g.id);
                return (
                  <label key={g.id} className="flex items-center gap-1.5 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => setForm(f => ({
                        ...f,
                        groupIds: checked ? f.groupIds.filter(id => id !== g.id) : [...f.groupIds, g.id],
                      }))}
                    />
                    {g.name}
                  </label>
                );
              })}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm cursor-pointer" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Hủy</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-60" style={{ background: 'var(--bg-sidebar)', color: '#f0efe8' }}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Register Modal */}
      <Modal open={registerModalOpen} onClose={() => setRegisterModalOpen(false)} title="Thêm người dùng mới">
        <div className="space-y-4">
          {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
          {[
            { label: 'Email', key: 'email', type: 'email' },
            { label: 'Mật khẩu', key: 'password', type: 'password' },
            { label: 'Họ tên', key: 'fullname', type: 'text' },
            { label: 'Số điện thoại', key: 'phoneNumber', type: 'text' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="text-xs font-medium uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
              <input type={type} className={inputCls} style={inputStyle} value={(regForm as any)[key]} onChange={e => setRegForm(f => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nhóm</label>
            <select className={inputCls} style={inputStyle} value={regForm.groupId} onChange={e => setRegForm(f => ({ ...f, groupId: e.target.value }))}>
              <option value="">Chọn nhóm</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setRegisterModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm cursor-pointer" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Hủy</button>
            <button onClick={handleRegister} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-60" style={{ background: 'var(--bg-sidebar)', color: '#f0efe8' }}>
              {saving ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Xác nhận xóa">
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
          Bạn có chắc muốn xóa tài khoản <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{deleteConfirm?.fullname || deleteConfirm?.email}</span>? Hành động này không thể hoàn tác.
        </p>
        {error && <p className="text-xs mb-3" style={{ color: 'var(--danger)' }}>{error}</p>}
        <div className="flex gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl text-sm cursor-pointer" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Hủy</button>
          <button onClick={handleDelete} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-60" style={{ background: 'var(--danger)', color: 'white' }}>
            {saving ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </Modal>
    </div>
  );
}