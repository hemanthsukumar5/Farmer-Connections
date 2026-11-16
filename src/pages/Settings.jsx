import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { TopNav, BottomNav } from '../components/Layout';
import toast from 'react-hot-toast';

export default function Settings() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState(user?.full_name || '');
  const [village, setVillage] = useState(user?.village || '');
  const [phoneVisible, setPhoneVisible] = useState(user?.phone_visible || false);
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile({ full_name: name, village, phone_visible: phoneVisible });
      updateUser(data);
      setEditName(false);
      toast.success(t('common.success'));
    } catch { toast.error(t('common.error')); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (pwForm.new_password.length < 8) { toast.error(t('common.minPassword')); return; }
    if (pwForm.new_password !== pwForm.confirm) { toast.error(t('auth.passwordMismatch')); return; }
    setSaving(true);
    try {
      await authAPI.changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password });
      toast.success('Password changed!');
      setPwForm({ current_password: '', new_password: '', confirm: '' });
      setShowPw(false);
    } catch (err) { toast.error(err.response?.data?.current_password?.[0] || t('common.error')); }
    finally { setSaving(false); }
  };

  return (
    <div className="full-page">
      <TopNav showBack title={t('settings.title')} showNotif={false} showLang={false} />
      <div className="page-content">

        {/* Profile */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 16 }}>👤 {t('profile.editProfile')}</h3>
          <div className="form-group">
            <label className="form-label">{t('profile.name')}</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.village')}</label>
            <input className="form-input" placeholder={t('auth.enterVillage')} value={village} onChange={e => setVillage(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={saveProfile} disabled={saving}>
            {saving ? '⏳' : '✓'} {t('profile.saveChanges')}
          </button>
        </div>

        {/* Language */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="profile-menu-item" onClick={() => navigate('/settings/language')} style={{ padding: 0, background: 'none', border: 'none' }}>
            <span className="profile-menu-icon">🌐</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{t('settings.language')}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {{ en: 'English', te: 'తెలుగు', hi: 'हिन्दी' }[user?.preferred_language] || 'English'}
              </div>
            </div>
            <span>›</span>
          </div>
        </div>

        {/* Privacy */}
        {user?.role === 'farmer' && (
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 16 }}>🔒 {t('settings.privacy')}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t('settings.phoneVisibility')}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  {phoneVisible ? t('settings.showPhone') : t('settings.hidePhone')}
                </div>
              </div>
              <div onClick={() => setPhoneVisible(v => !v)}
                style={{ width: 50, height: 28, borderRadius: 14, background: phoneVisible ? 'var(--green-secondary)' : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'all 0.3s', flexShrink: 0 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: phoneVisible ? 25 : 3, transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </div>
            </div>
            {phoneVisible !== user?.phone_visible && (
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12, width: 'auto' }} onClick={saveProfile} disabled={saving}>
                {t('profile.saveChanges')}
              </button>
            )}
          </div>
        )}

        {/* Change Password */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowPw(v => !v)}>
            <h3>🔐 {t('settings.changePassword')}</h3>
            <span style={{ color: 'var(--text-secondary)' }}>{showPw ? '▲' : '▼'}</span>
          </div>
          {showPw && (
            <div style={{ marginTop: 16 }}>
              <div className="form-group">
                <label className="form-label">{t('settings.currentPassword')}</label>
                <input className="form-input" type="password" value={pwForm.current_password} onChange={e => setPwForm(f => ({ ...f, current_password: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('settings.newPassword')}</label>
                <input className="form-input" type="password" value={pwForm.new_password} onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('settings.confirmNewPassword')}</label>
                <input className="form-input" type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
              </div>
              <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={changePassword} disabled={saving}>
                {saving ? '⏳' : '🔐'} {t('settings.updatePassword')}
              </button>
            </div>
          )}
        </div>

        {/* Help */}
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/help')}>
          <div className="profile-menu-item" style={{ padding: 0, background: 'none', border: 'none' }}>
            <span className="profile-menu-icon">❓</span>
            <span style={{ flex: 1, fontWeight: 600 }}>{t('profile.help')}</span>
            <span>›</span>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
