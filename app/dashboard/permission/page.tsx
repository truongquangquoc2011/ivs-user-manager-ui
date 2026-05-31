'use client';
import React, { useEffect, useState } from 'react';
import { groupApi, featureApi, safeCall } from '@/src/lib/api';
import { GroupResponse, FeatureResponse, GroupPermission } from '@/src/types';
import { useAuth } from '@/src/hook/useAuth';

export default function PermissionPage() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('PERMISSION_MANAGEMENT', 'canEdit');

  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [features, setFeatures] = useState<FeatureResponse[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupResponse | null>(null);
  const [permissions, setPermissions] = useState<GroupPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      const [groups, feats] = await Promise.all([
        safeCall(() => groupApi.getAll(), []),
        safeCall(() => featureApi.getAll(), []),
      ]);
      setGroups(groups);
      setFeatures(feats);
      if (groups.length > 0) await loadPerms(groups[0], feats);
      setLoading(false);
    };
    init();
  }, []);

  const loadPerms = async (group: GroupResponse, featList?: FeatureResponse[]) => {
    setSelectedGroup(group);
    const fList = featList ?? features;
    const perms = await safeCall(() => groupApi.getPermissions(group.id), []);
    const permsMap = Object.fromEntries(perms.map((p: any) => [p.featureCode, p]));
    setPermissions(fList.map(f => permsMap[f.code] ?? {
      featureCode: f.code,
      featureName: f.name,
      featurePath: f.path,
      canView: false,
      canEdit: false,
    }));
  };

  const toggle = (code: string, field: 'canView' | 'canEdit') => {
    if (!canEdit) return;
    setPermissions(prev => prev.map(p => {
      if (p.featureCode !== code) return p;
      if (field === 'canView' && p.canView) return { ...p, canView: false, canEdit: false };
      if (field === 'canEdit' && !p.canView) return { ...p, canView: true, canEdit: true };
      return { ...p, [field]: !p[field] };
    }));
  };

  const handleSave = async () => {
    if (!selectedGroup) return;
    setSaving(true);
    setError('');
    try {
      await groupApi.updatePermissions(selectedGroup.id, permissions);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-7">
        <div>
          <h1 className="text-xl font-semibold mb-1">Phân quyền</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Cấu hình quyền truy cập cho từng nhóm</p>
        </div>
        {canEdit && (
          <button
            onClick={handleSave}
            disabled={saving || !selectedGroup}
            className="px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-60 transition-colors"
            style={{ background: saved ? 'var(--success)' : 'var(--bg-sidebar)', color: '#f0efe8' }}
          >
            {saving ? 'Đang lưu...' : saved ? '✓ Đã lưu' : 'Lưu cấu hình'}
          </button>
        )}
      </div>

      {!canEdit && (
        <div className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2" style={{ background: 'var(--warning-light)', color: 'var(--warning)', border: '1px solid #fde68a' }}>
          <span>⚠</span> Bạn chỉ có quyền xem, không thể chỉnh sửa phân quyền.
        </div>
      )}

      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>{error}</div>
      )}

      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {/* Group tabs */}
        <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider mr-2" style={{ color: 'var(--text-muted)' }}>Nhóm:</span>
          {groups.map(g => (
            <button
              key={g.id}
              onClick={() => loadPerms(g)}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              style={{
                background: selectedGroup?.id === g.id ? 'var(--bg-sidebar)' : 'var(--bg-card)',
                color: selectedGroup?.id === g.id ? '#f0efe8' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Tính năng</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Path</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Xem</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Sửa</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm, i) => (
                <tr key={perm.featureCode} style={{ borderBottom: i < permissions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium">{perm.featureName}</p>
                    <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>{perm.featureCode}</p>
                  </td>
                  <td className="px-5 py-4 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{perm.featurePath || '—'}</td>
                  <td className="px-5 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={perm.canView}
                      onChange={() => toggle(perm.featureCode, 'canView')}
                      disabled={!canEdit}
                      className="w-4 h-4 cursor-pointer accent-blue-600"
                    />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={perm.canEdit}
                      onChange={() => toggle(perm.featureCode, 'canEdit')}
                      disabled={!canEdit}
                      className="w-4 h-4 cursor-pointer accent-blue-600"
                    />
                  </td>
                </tr>
              ))}
              {permissions.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Không có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}