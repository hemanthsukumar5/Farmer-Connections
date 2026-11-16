import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { notifAPI } from '../services/api';
import { useState, useEffect } from 'react';

const Icons = {
  Home: '🏠', Explore: '🔍', Sell: '+', Messages: '💬', Profile: '👤',
  Bell: '🔔', Logo: '🌾',
};

export function TopNav({ title, showBack = false, showNotif = true, showLang = true }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (user) {
      notifAPI.list().then(({ data }) => {
        setUnread(data.filter(n => !n.is_read).length);
      }).catch(() => {});
    }
  }, [user]);

  return (
    <div className="top-nav">
      {showBack ? (
        <button className="nav-icon-btn" onClick={() => navigate(-1)}>←</button>
      ) : (
        <div className="top-nav-logo" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: '1.5rem' }}>🌾</span>
          <span>RythuConnect</span>
        </div>
      )}

      {title && <span style={{ fontWeight: 700, fontSize: '1rem' }}>{title}</span>}

      <div className="top-nav-actions">
        {showLang && (
          <button className="nav-icon-btn" onClick={() => navigate('/settings/language')}
            style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--green-primary)' }}>
            {i18n.language.toUpperCase()}
          </button>
        )}
        {showNotif && user && (
          <button className="nav-icon-btn" onClick={() => navigate('/notifications')}>
            🔔
            {unread > 0 && <span className="badge">{unread > 9 ? '9+' : unread}</span>}
          </button>
        )}
        {user && (
          <button className="nav-icon-btn" onClick={() => navigate('/profile')}
            style={{ background: 'var(--green-light)', color: 'var(--green-primary)', fontWeight: 700 }}>
            {user.full_name?.[0]?.toUpperCase() || '👤'}
          </button>
        )}
      </div>
    </div>
  );
}

export function BottomNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname === path;

  const items = [
    { path: '/home', icon: '🏠', label: t('nav.home') },
    { path: '/marketplace', icon: '🔍', label: t('nav.explore') },
    { path: '/add-crop', icon: '+', label: t('nav.sell'), isSell: true, role: 'farmer' },
    { path: '/profile', icon: '👤', label: t('nav.profile') },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        if (item.role && user?.role !== item.role) {
          if (item.isSell) return (
            <button key={item.path} className="bottom-nav-item bottom-nav-sell" onClick={() => navigate('/marketplace')}>
              <span className="nav-icon" style={{ fontWeight: 800 }}>🔍</span>
            </button>
          );
          return null;
        }
        return (
          <button
            key={item.path}
            className={`bottom-nav-item ${item.isSell ? 'bottom-nav-sell' : ''} ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon" style={{ fontSize: item.isSell ? '1.8rem' : '1.3rem' }}>{item.icon}</span>
            {!item.isSell && <span>{item.label}</span>}
          </button>
        );
      })}
    </nav>
  );
}
