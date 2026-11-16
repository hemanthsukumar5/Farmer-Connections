import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { chatAPI } from '../services/api';
import { TopNav, BottomNav } from '../components/Layout';
import { EmptyState, LoadingSpinner } from '../components/Common';

export default function Messages() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatAPI.conversations().then(({ data }) => {
      setConversations(data);
    }).finally(() => setLoading(false));
  }, []);

  const formatTime = (dt) => {
    if (!dt) return '';
    const d = new Date(dt);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    if (diff < 172800000) return t('chat.yesterday');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="full-page">
      <TopNav title={t('chat.title')} />
      <div className="page-content">
        <h2 style={{ marginBottom: 16 }}>{t('chat.title')}</h2>
        {loading ? <LoadingSpinner /> : conversations.length === 0 ? (
          <EmptyState icon="💬" title={t('chat.noMessages')} message={t('chat.startConversation')}
            action={<button className="btn btn-primary" style={{ maxWidth: 200, margin: '0 auto' }} onClick={() => navigate('/marketplace')}>
              🔍 {t('home.buyCrops')}
            </button>} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {conversations.map(conv => (
              <div key={conv.id} className="conversation-item" onClick={() => navigate(`/chat/${conv.id}`)}>
                <div className="conversation-avatar">
                  {conv.other_user_name?.[0]?.toUpperCase() || '👤'}
                </div>
                <div className="conversation-info">
                  <div className="conversation-name">{conv.other_user_mobile || conv.other_user_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--green-secondary)', fontWeight: 600, marginBottom: 2 }}>
                    🌿 {conv.crop_name}
                  </div>
                  <div className="conversation-preview">{conv.last_message || t('chat.startConversation')}</div>
                </div>
                <div className="conversation-meta">
                  <div className="conversation-time">{formatTime(conv.last_message_time)}</div>
                  {conv.unread_count > 0 && (
                    <div className="unread-badge">{conv.unread_count}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
