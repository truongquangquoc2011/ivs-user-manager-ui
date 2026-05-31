'use client';
import React, { useState } from 'react';
import { profileApi } from '@/src/lib/api';
import { useAuth } from '@/src/hook/useAuth';

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Chưa kích hoạt',
  LOCKED: 'Bị khóa',
};

export default function ProfilePage() {
  const { profile, loading, reload } = useAuth();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullname: '', phoneNumber: '' });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const [pwModal, setPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  const openEdit = () => {
    if (!profile) return;
    setForm({ fullname: profile.fullname || '', phoneNumber: profile.phoneNumber || '' });
    setEditError('');
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setEditError('');
    try {
      await profileApi.update(form);
      reload();
      setEditing(false);
    } catch (e: any) { setEditError(e.message); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    setPwError('');
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError('Mật khẩu xác nhận không khớp');
      return;
    }
    setPwSaving(true);
    try {
      await profileApi.changePassword({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
      setPwSuccess(true);
      setPwForm({ oldPassword: '', newPassword: '', confirm: '' });
      setTimeout(() => { setPwSuccess(false); setPwModal(false); }, 1500);
    } catch (e: any) { setPwError(e.message); }
    finally { setPwSaving(false); }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg text-sm outline-none";
  const inputStyle = { background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' };

  if (loading) {
    return <div className="p-8 text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải...</div>;
  }

  if (!profile) {
    return <div className="p-8 text-sm" style={{ color: 'var(--danger)' }}>Không thể tải thông tin hồ sơ.</div>;
  }

  const initials = (profile.fullname || profile.email).charAt(0).toUpperCase();

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-xl font-semibold mb-7">Hồ sơ cá nhân</h1>

      {/* Avatar + basic */}
      <div className="rounded-2xl p-6 mb-4 flex items-center gap-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-semibold flex-shrink-0" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-base">{profile.fullname || '—'}</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{profile.email}</p>
          <div className="flex items-center gap-2 mt-2">
            {profile.groups.map(g => (
              <span key={g.id} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                {g.name}
              </span>
            ))}
            <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{
              background: profile.status === 'ACTIVE' ? 'var(--success-light)' : 'var(--bg)',
              color: profile.status === 'ACTIVE' ? 'var(--success)' : 'var(--text-muted)',
            }}>
              {STATUS_LABEL[profile.status] || profile.status}
            </span>
          </div>
        </div>
      </div>

      {/* Info fields */}
      <div className="rounded-2xl p-6 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-sm">Thông tin chi tiết</h3>
          {!editing && (
            <button onClick={openEdit} className="text-xs font-medium cursor-pointer" style={{ color: 'var(--accent)' }}>Chỉnh sửa</button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            {editError && <p className="text-xs" style={{ color: 'var(--danger)' }}>{editError}</p>}
            <div>
              <label className="text-xs font-medium uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Họ tên</label>
              <input className={inputCls} style={inputStyle} value={form.fullname} onChange={e => setForm(f => ({ ...f, fullname: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Số điện thoại</label>
              <input className={inputCls} style={inputStyle} value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-lg text-sm cursor-pointer" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Hủy</button>
              <button onClick={handleSaveProfile} disabled={saving} className="flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-60" style={{ background: 'var(--bg-sidebar)', color: '#f0efe8' }}>
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {[
              { label: 'Email', value: profile.email },
              { label: 'Họ tên', value: profile.fullname || '—' },
              { label: 'Số điện thoại', value: profile.phoneNumber || '—' },
              { label: 'Mã người dùng', value: `#${profile.id}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span className="text-sm">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permissions summary */}
      {profile.permissions.length > 0 && (
        <div className="rounded-2xl p-6 mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="font-semibold text-sm mb-4">Quyền truy cập</h3>
          <div className="space-y-2">
            {profile.permissions.map(perm => (
              <div key={perm.featureCode} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-sm">{perm.featureName}</span>
                <div className="flex gap-2">
                  {perm.canView && (
                    <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>Xem</span>
                  )}
                  {perm.canEdit && (
                    <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>Sửa</span>
                  )}
                  {!perm.canView && !perm.canEdit && (
                    <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>Không có</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Change password button */}
      <button
        onClick={() => { setPwError(''); setPwSuccess(false); setPwModal(true); }}
        className="text-sm font-medium cursor-pointer px-4 py-2.5 rounded-xl"
        style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
      >
        Đổi mật khẩu
      </button>

      {/* Change password modal */}
      {pwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-base">Đổi mật khẩu</h3>
              <button onClick={() => setPwModal(false)} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>

            {pwSuccess ? (
              <div className="py-6 text-center">
                <p className="text-sm font-medium" style={{ color: 'var(--success)' }}>✓ Đổi mật khẩu thành công!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pwError && <p className="text-xs" style={{ color: 'var(--danger)' }}>{pwError}</p>}
                {[
                  { label: 'Mật khẩu hiện tại', key: 'oldPassword' },
                  { label: 'Mật khẩu mới', key: 'newPassword' },
                  { label: 'Xác nhận mật khẩu mới', key: 'confirm' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-xs font-medium uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                    <input type="password" className={inputCls} style={inputStyle} value={(pwForm as any)[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setPwModal(false)} className="flex-1 py-2.5 rounded-xl text-sm cursor-pointer" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Hủy</button>
                  <button onClick={handleChangePassword} disabled={pwSaving} className="flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-60" style={{ background: 'var(--bg-sidebar)', color: '#f0efe8' }}>
                    {pwSaving ? 'Đang lưu...' : 'Xác nhận'}
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