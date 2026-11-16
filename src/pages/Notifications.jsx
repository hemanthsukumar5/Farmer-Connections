import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { notifAPI } from '../services/api';
import { TopNav, BottomNav } from '../components/Layout';
import { EmptyState, LoadingSpinner } from '../components/Common';
import toast from 'react-hot-toast';

const NOTIF_ICONS = {
  message: '💬', offer: '🤝', offer_accepted: '✅',
  offer_rejected: '❌', listing: '📋', system: '🔔',
};

export default function Notifications() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notifAPI.list().then(({ data }) => setNotifications(data)).finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await notifAPI.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    await notifAPI.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast.success(t('notifications.markAllRead'));
  };

  const handleClick = (notif) => {
    markRead(notif.id);
    if (notif.link) navigate(notif.link);
  };

  const formatTime = (dt) => {
    if (!dt) return '';
    const d = new Date(dt);
    const diff = Date.now() - d;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <div className="full-page">
      <TopNav showBack title={t('notifications.title')} showNotif={false} />
      <div className="page-content">
        {unread > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="btn btn-sm btn-outline" style={{ width: 'auto' }} onClick={markAllRead}>
              ✓ {t('notifications.markAllRead')}
            </button>
          </div>
        )}

        {loading ? <LoadingSpinner /> : notifications.length === 0 ? (
          <EmptyState icon="🔔" title={t('notifications.noNotifications')} message="You'll see updates about your crops and messages here." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notifications.map(n => (
              <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                onClick={() => handleClick(n)} style={{ cursor: n.link ? 'pointer' : 'default' }}>
                <span className="notif-icon">{NOTIF_ICONS[n.notification_type] || '🔔'}</span>
                <div className="notif-body">
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-msg">{n.message}</div>
                  <div className="notif-time">{formatTime(n.created_at)}</div>
                </div>
                {!n.is_read && (
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green-secondary)', flexShrink: 0, marginTop: 6 }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
