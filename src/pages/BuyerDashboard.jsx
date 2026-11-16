import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { cropAPI, chatAPI, favoritesAPI } from '../services/api';
import { TopNav, BottomNav } from '../components/Layout';
import { CropCard, CATEGORIES, LoadingSpinner } from '../components/Common';

export default function BuyerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recent, setRecent] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      cropAPI.list({ status: 'active', ordering: '-created_at', page_size: 6 }),
      favoritesAPI.list(),
      chatAPI.conversations(),
    ]).then(([cropsRes, favRes, convRes]) => {
      setRecent(cropsRes.data.results || cropsRes.data);
      setFavorites(favRes.data.slice(0, 3));
      setConversations(convRes.data.slice(0, 3));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="full-page">
      <TopNav />
      <div className="page-content">
        {/* Welcome */}
        <div style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', borderRadius: 'var(--radius)', padding: '20px', color: 'white', marginBottom: 20 }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>🛒</div>
          <h2 style={{ color: 'white', marginBottom: 4 }}>{t('dashboard.welcome')}, {user?.full_name}!</h2>
          <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>Find fresh crops directly from farmers</p>
        </div>

        {/* Search */}
        <div className="search-bar" style={{ marginBottom: 20, cursor: 'pointer' }} onClick={() => navigate('/marketplace')}>
          <span>🔍</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{t('home.searchPlaceholder')}</span>
        </div>

        {/* Categories */}
        <div style={{ marginBottom: 24 }}>
          <div className="section-title">
            {t('dashboard.browseCategories')}
            <button className="section-link" onClick={() => navigate('/marketplace')}>{t('home.viewAll')}</button>
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
            {CATEGORIES.map(cat => (
              <div key={cat.key} onClick={() => navigate(`/marketplace?category=${cat.key}`)}
                style={{ flexShrink: 0, padding: '10px 14px', borderRadius: 20, border: '2px solid var(--border)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600 }}>
                {cat.emoji} {t(`crop.${cat.key}`)}
              </div>
            ))}
          </div>
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            {/* Recent Crops */}
            <div style={{ marginBottom: 24 }}>
              <div className="section-title">
                {t('dashboard.recentlyAdded')}
                <button className="section-link" onClick={() => navigate('/marketplace')}>{t('home.viewAll')}</button>
              </div>
              <div className="crops-grid">
                {recent.slice(0, 4).map(crop => (
                  <CropCard key={crop.id} crop={crop} onClick={() => navigate(`/crops/${crop.id}`)} />
                ))}
              </div>
            </div>

            {/* Favorites */}
            {favorites.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div className="section-title">
                  ❤️ {t('dashboard.favorites')}
                  <button className="section-link" onClick={() => navigate('/favorites')}>{t('home.viewAll')}</button>
                </div>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
                  {favorites.map(fav => {
                    const CROP_EMOJIS = { cotton: '🌿', paddy: '🌾', mirchi: '🌶️', maize: '🌽', turmeric: '🟡', groundnut: '🥜', other: '🌱' };
                    return (
                      <div key={fav.id} onClick={() => navigate(`/crops/${fav.listing}`)}
                        style={{ flexShrink: 0, width: 120, background: 'white', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden', cursor: 'pointer' }}>
                        <div style={{ height: 70, background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {fav.listing_image
                            ? <img src={fav.listing_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: '2rem' }}>{CROP_EMOJIS[fav.listing_category] || '🌿'}</span>
                          }
                        </div>
                        <div style={{ padding: '8px 8px 10px' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fav.listing_name || `Crop #${fav.listing}`}</div>
                          {fav.listing_price && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--green-primary)', fontWeight: 700, marginTop: 2 }}>₹{Number(fav.listing_price).toLocaleString('en-IN')}/{fav.listing_unit}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Chats */}
            {conversations.length > 0 && (
              <div>
                <div className="section-title">
                  Contact Farmers
                  <button className="section-link" onClick={() => navigate('/marketplace')}>View</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {conversations.map(conv => (
                    <div key={conv.id} className="conversation-item" onClick={() => navigate(`/crops/${conv.listing}`)}>
                      <div className="conversation-avatar">{conv.farmer_name?.[0]?.toUpperCase() || '🧑'}</div>
                      <div className="conversation-info">
                        <div className="conversation-name">{conv.farmer_mobile || conv.farmer_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--green-secondary)', fontWeight: 600 }}>🌿 {conv.crop_name}</div>
                        <div className="conversation-preview">{conv.farmer_mobile ? 'Call now' : 'Contact available on crop page'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
