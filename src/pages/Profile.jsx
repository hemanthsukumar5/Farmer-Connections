import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { TopNav, BottomNav } from '../components/Layout';
import { cropAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ active: null, sold: null });

  useEffect(() => {
    if (user?.role === 'farmer') {
      Promise.all([
        cropAPI.myListings({ status: 'active' }),
        cropAPI.myListings({ status: 'sold' }),
      ]).then(([activeRes, soldRes]) => {
        const activeData = activeRes.data.results || activeRes.data;
        const soldData = soldRes.data.results || soldRes.data;
        setStats({ active: activeData.length, sold: soldData.length });
      }).catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      toast.success(t('auth.logoutSuccess'));
      navigate('/');
    }
  };

  const menuItems = [
    { icon: '✏️', label: t('profile.editProfile'), path: '/settings', id: 'edit-profile' },
    { icon: '⚙️', label: t('profile.settings'), path: '/settings', id: 'settings' },
    { icon: '🌐', label: t('profile.languageSettings'), path: '/settings/language', id: 'lang-settings' },
    ...(user?.role === 'farmer' ? [{ icon: '📋', label: t('home.myListings'), path: '/my-listings', id: 'my-listings' }] : []),
    ...(user?.role === 'buyer' ? [{ icon: '❤️', label: t('common.favorites'), path: '/favorites', id: 'favorites' }] : []),
    { icon: '❓', label: t('profile.help'), path: '/help', id: 'help' },
    { icon: '🏠', label: t('profile.about'), path: '/', id: 'about' },
  ];

  const roleLabel = user?.role === 'farmer' ? t('auth.farmer') : t('auth.buyer');

  return (
    <div className="full-page">
      <TopNav title={t('profile.title')} showNotif={false} showLang={false} />
      <div className="page-content">
        {/* Profile Header */}
        <div className="profile-header card" style={{ marginBottom: 20 }}>
          <div className="profile-avatar" style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--green-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white', margin: '0 auto 12px' }}>
            {user?.full_name?.[0]?.toUpperCase() || '👤'}
          </div>
          <div className="profile-name">{user?.full_name}</div>
          <div className="profile-role">{roleLabel} • {user?.district}, {user?.state}</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
            <span style={{ background: 'var(--green-light)', color: 'var(--green-primary)', padding: '4px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>
              📱 {user?.mobile_number}
            </span>
          </div>
        </div>

        {/* Stats for farmers */}
        {user?.role === 'farmer' && (
          <div className="stats-row" style={{ marginBottom: 20 }}>
            <div className="stat-pill" onClick={() => navigate('/my-listings')} style={{ cursor: 'pointer' }}>
              <div className="stat-pill-number" style={{ color: 'var(--green-secondary)' }}>
                {stats.active === null ? '…' : stats.active}
              </div>
              <div className="stat-pill-label">{t('dashboard.activeListings')}</div>
            </div>
            <div className="stat-pill" onClick={() => navigate('/my-listings?status=sold')} style={{ cursor: 'pointer' }}>
              <div className="stat-pill-number" style={{ color: 'var(--amber)' }}>
                {stats.sold === null ? '…' : stats.sold}
              </div>
              <div className="stat-pill-label">{t('dashboard.soldCrops')}</div>
            </div>
          </div>
        )}

        {/* Menu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {menuItems.map(item => (
            <div key={item.id} id={item.id} className="profile-menu-item" onClick={() => navigate(item.path)}>
              <span className="profile-menu-icon">{item.icon}</span>
              <span className="profile-menu-label">{item.label}</span>
              <span className="profile-menu-arrow">›</span>
            </div>
          ))}
          <div className="profile-menu-item" id="logout-btn" onClick={handleLogout} style={{ color: 'var(--red)' }}>
            <span className="profile-menu-icon" style={{ color: 'var(--red)' }}>🚪</span>
            <span className="profile-menu-label" style={{ color: 'var(--red)' }}>{t('profile.logout')}</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
          <p>RythuConnect v1.0</p>
          <p style={{ marginTop: 4 }}>Your Crops. Your Price. Your Market.</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
