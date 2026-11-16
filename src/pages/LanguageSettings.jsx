import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LanguageCards } from '../components/Common';
import { authAPI } from '../services/api';
import { TopNav } from '../components/Layout';
import i18n from '../i18n';
import toast from 'react-hot-toast';

export default function LanguageSettings() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(user?.preferred_language || i18n.language || 'en');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAPI.updateLanguage(selected);
      updateUser({ preferred_language: selected });
      toast.success(t('common.success'));
      navigate(-1);
    } catch { toast.error(t('common.error')); }
    finally { setSaving(false); }
  };

  return (
    <div className="full-page">
      <TopNav showBack title={t('profile.languageSettings')} showNotif={false} showLang={false} />
      <div className="page-content">
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ marginBottom: 8 }}>{t('auth.selectLanguage')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('auth.languageHint')}</p>
        </div>
        <LanguageCards selected={selected} onChange={lang => { setSelected(lang); i18n.changeLanguage(lang); localStorage.setItem('rythuconnect_lang', lang); }} />
        <div style={{ marginTop: 28 }}>
          <button id="save-language-btn" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '⏳ ' + t('common.loading') : '✓ ' + t('profile.saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
}
