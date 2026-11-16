import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { chatAPI, cropAPI } from '../services/api';
import { TopNav } from '../components/Layout';
import { LoadingSpinner } from '../components/Common';
import toast from 'react-hot-toast';

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export default function ChatRoom() {
  const { conversationId } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [offer, setOffer] = useState({ offered_price: '', quantity_requested: 1 });
  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  // Load history
  useEffect(() => {
    Promise.all([
      chatAPI.messages(conversationId),
      chatAPI.conversations(),
    ]).then(([msgRes, convRes]) => {
      setMessages(msgRes.data);
      const conv = convRes.data.find(c => c.id === parseInt(conversationId));
      setConversation(conv);
      setLoading(false);
    }).catch(() => { setLoading(false); navigate('/messages'); });
  }, [conversationId]);

  // WebSocket
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const ws = new WebSocket(`${WS_BASE}/ws/chat/${conversationId}/?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'message') {
        setMessages(prev => [...prev, data.message]);
      } else if (data.type === 'offer') {
        setMessages(prev => [...prev, { ...data.offer, is_offer: true }]);
      }
    };

    ws.onerror = () => { /* fallback to polling */ };
    return () => ws.close();
  }, [conversationId]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const { data } = await chatAPI.sendMessage(conversationId, text.trim());
      setMessages(prev => [...prev, data]);
      setText('');
    } catch { toast.error(t('common.error')); }
    finally { setSending(false); }
  };

  const sendOffer = async () => {
    if (!offer.offered_price) return;
    try {
      await chatAPI.makeOffer(conversationId, {
        ...offer,
        listing: conversation?.listing,
      });
      setShowOffer(false);
      toast.success('Offer sent!');
    } catch { toast.error(t('common.error')); }
  };

  const respondOffer = async (offerId, status) => {
    try {
      await chatAPI.respondOffer(conversationId, offerId, status);
      // Refresh messages
      const { data } = await chatAPI.messages(conversationId);
      setMessages(data);
      toast.success(status === 'accepted' ? t('chat.offerAccepted') : t('chat.offerRejected'));
    } catch { toast.error(t('common.error')); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (loading) return <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center' }}><LoadingSpinner /></div>;

  const otherName = user?.role === 'farmer'
    ? (conversation?.buyer_mobile || conversation?.buyer_name)
    : (conversation?.farmer_mobile || conversation?.farmer_name);

  return (
    <div className="full-page" style={{ height: '100dvh' }}>
      {/* Header */}
      <div className="top-nav">
        <button className="nav-icon-btn" onClick={() => navigate('/messages')}>←</button>
        <div style={{ flex: 1, padding: '0 12px' }}>
          <div style={{ fontWeight: 700 }}>{otherName || 'Chat'}</div>
          {conversation?.crop_name && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              🌿 {conversation.crop_name}
            </div>
          )}
        </div>
        {conversation?.crop_name && (
          <button className="btn btn-sm btn-outline" style={{ width: 'auto', padding: '8px 14px' }}
            onClick={() => navigate(`/crops/${conversation.listing}`)}>
            View Crop
          </button>
        )}
      </div>

      {/* Crop preview strip */}
      {conversation?.crop_price && (
        <div style={{ background: 'var(--green-light)', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>🌿 {conversation.crop_name}</span>
          <span style={{ fontWeight: 800, color: 'var(--green-primary)' }}>₹{Number(conversation.crop_price).toLocaleString('en-IN')}/{conversation.crop_unit}</span>
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '48px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>💬</div>
            <p>{t('chat.startConversation')}</p>
          </div>
        )}
        {messages.map((msg, idx) => {
          const isMine = msg.sender === user?.id || msg.buyer === user?.id;

          // Offer card
          if (msg.is_offer || msg.offered_price) {
            const offerStatus = msg.status || 'pending';
            return (
              <div key={idx} style={{ width: '100%', marginBottom: 8 }}>
                <div className={`offer-card ${offerStatus}`}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>
                    {offerStatus === 'pending' ? '🤝' : offerStatus === 'accepted' ? '✅' : '❌'} {t('chat.offer')}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--green-primary)' }}>
                    ₹{Number(msg.offered_price).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                    for {msg.quantity_requested} {msg.quantity_unit || 'units'}
                  </div>
                  {offerStatus === 'pending' && user?.role === 'farmer' && !isMine && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => respondOffer(msg.id, 'accepted')}>
                        ✅ {t('chat.accept')}
                      </button>
                      <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => respondOffer(msg.id, 'rejected')}>
                        ❌ {t('chat.reject')}
                      </button>
                    </div>
                  )}
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 6, textAlign: 'right' }}>
                    {offerStatus === 'accepted' ? t('chat.offerAccepted') : offerStatus === 'rejected' ? t('chat.offerRejected') : t('chat.offerPending')}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={idx} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
              <div>
                <div className={`message-bubble ${isMine ? 'sent' : 'received'}`}>
                  {msg.message_text}
                </div>
                <div className={`message-time ${isMine ? 'text-center' : ''}`} style={{ textAlign: isMine ? 'right' : 'left', padding: '2px 4px' }}>
                  {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  {msg.read_at && isMine && ' ✓✓'}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Offer Modal */}
      {showOffer && (
        <div className="offer-modal-overlay" onClick={() => setShowOffer(false)}>
          <div className="offer-modal" onClick={e => e.stopPropagation()}>
            <div className="offer-modal-handle" />
            <h3 style={{ marginBottom: 20 }}>🤝 {t('chat.offer')}</h3>
            <div className="form-group">
              <label className="form-label">{t('chat.offerPrice')} (₹)</label>
              <input className="form-input" type="number" inputMode="numeric" placeholder="e.g. 2300"
                value={offer.offered_price} onChange={e => setOffer(o => ({ ...o, offered_price: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('chat.offerQty')}</label>
              <input className="form-input" type="number" inputMode="numeric" min="1"
                value={offer.quantity_requested} onChange={e => setOffer(o => ({ ...o, quantity_requested: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowOffer(false)}>{t('common.cancel')}</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={sendOffer}>{t('chat.sendOffer')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="chat-input-bar">
        {user?.role === 'buyer' && (
          <button onClick={() => setShowOffer(true)}
            style={{ width: 44, height: 44, border: '2px solid var(--amber)', borderRadius: 12, background: 'var(--amber-light)', color: 'var(--amber)', cursor: 'pointer', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}>
            ₹
          </button>
        )}
        <textarea
          className="chat-input"
          placeholder={t('chat.typeMessage')}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button className="chat-send-btn" onClick={sendMessage} disabled={!text.trim() || sending}>
          ➤
        </button>
      </div>
    </div>
  );
}
