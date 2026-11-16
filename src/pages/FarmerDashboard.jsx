import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { cropAPI, chatAPI } from '../services/api';
import { TopNav, BottomNav } from '../components/Layout';
import { LoadingSpinner } from '../components/Common';

export default function FarmerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ active: 0, sold: 0, totalQty: 0, enquiries: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      cropAPI.myListings({ status: 'active' }),
      cropAPI.myListings({ status: 'sold' }),
      chatAPI.conversations(),
    ]).then(([active, sold, convRes]) => {
      const activeData = active.data.results || active.data;
      const soldData = sold.data.results || sold.data;
      const convData = convRes.data.results || convRes.data;
      const totalQty = activeData.reduce((s, c) => s + parseFloat(c.quantity_available || 0), 0);
      setStats({ active: activeData.length, sold: soldData.length, totalQty: Math.round(totalQty), enquiries: convData.length });
      setRecent(activeData.slice(0, 3));
    }).finally(() => setLoading(false));
  }, []);

  const CropEmoji = { cotton: '🌿', paddy: '🌾', mirchi: '🌶️', maize: '🌽', turmeric: '🟡', groundnut: '🥜', other: '🌱' };

  return (
    <div className="full-page">
      <TopNav />
      <div className="page-content">
        {/* Welcome */}
        <div style={{ background: 'linear-gradient(135deg, #166534, #22C55E)', borderRadius: 'var(--radius)', padding: '20px', color: 'white', marginBottom: 20 }}>
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>🧑‍🌾</div>
          <h2 style={{ color: 'white', marginBottom: 4 }}>{t('dashboard.welcome')}, {user?.full_name}!</h2>
          <p style={{ opacity: 0.85, fontSize: '0.875rem' }}>📍 {user?.village ? `${user.village}, ` : ''}{user?.district}, {user?.state}</p>
        </div>

        {/* Stats */}
        {loading ? <LoadingSpinner /> : (
          <>
            <div className="stats-row" style={{ marginBottom: 20 }}>
              <div className="stat-pill" onClick={() => navigate('/my-listings')} style={{ cursor: 'pointer' }}>
                <div className="stat-pill-number">{stats.active}</div>
                <div className="stat-pill-label">🟢 {t('dashboard.activeListings')}</div>
              </div>
              <div className="stat-pill" onClick={() => navigate('/my-listings?status=sold')} style={{ cursor: 'pointer' }}>
                <div className="stat-pill-number" style={{ color: 'var(--amber)' }}>{stats.sold}</div>
                <div className="stat-pill-label">✅ {t('dashboard.soldCrops')}</div>
              </div>
              <div className="stat-pill">
                <div className="stat-pill-number" style={{ color: 'var(--green-secondary)', fontSize: '1.2rem' }}>{stats.totalQty}</div>
                <div className="stat-pill-label">📦 {t('dashboard.totalQuantity')}</div>
              </div>
              <div className="stat-pill" onClick={() => navigate('/marketplace')} style={{ cursor: 'pointer' }}>
                <div className="stat-pill-number" style={{ color: 'var(--amber)' }}>{stats.enquiries}</div>
                <div className="stat-pill-label">� Enquiries</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="section-title" style={{ marginBottom: 12 }}>Quick Actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {[
                { icon: '➕', label: t('dashboard.addNewCrop'), path: '/add-crop', color: '#166534' },
                { icon: '📋', label: t('home.myListings'), path: '/my-listings', color: '#F59E0B' },
                { icon: '�', label: 'Contact', path: '/marketplace', color: '#3B82F6' },
                { icon: '🛒', label: t('home.buyCrops'), path: '/marketplace', color: '#8B5CF6' },
              ].map((a, i) => (
                <div key={i} onClick={() => navigate(a.path)}
                  style={{ background: 'white', border: '2px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}
                  onTouchStart={e => e.currentTarget.style.transform = 'scale(0.96)'}
                  onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}>
                  <div style={{ fontSize: '1.8rem' }}>{a.icon}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: a.color }}>{a.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Listings */}
            {recent.length > 0 && (
              <div>
                <div className="section-title">
                  {t('dashboard.activeListings')}
                  <button className="section-link" onClick={() => navigate('/my-listings')}>{t('home.viewAll')}</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {recent.map(crop => {
                    const img = crop.images?.find(i => i.is_primary) || crop.images?.[0];
                    return (
                      <div key={crop.id} className="card" style={{ display: 'flex', gap: 12, padding: '14px', cursor: 'pointer' }}
                        onClick={() => navigate(`/crops/${crop.id}`)}>
                        <div style={{ width: 56, height: 56, borderRadius: 10, background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0, overflow: 'hidden' }}>
                          {img ? <img src={img.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : CropEmoji[crop.category] || '🌿'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{crop.crop_name}</div>
                          <div style={{ color: 'var(--green-primary)', fontWeight: 800, fontSize: '0.9rem' }}>₹{Number(crop.price_per_unit).toLocaleString('en-IN')}/{crop.quantity_unit}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>📦 {Number(crop.quantity_available).toLocaleString()} {crop.quantity_unit}</div>
                        </div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>›</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add crop CTA if no listings */}
            {stats.active === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--green-light)', borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🌱</div>
                <h3 style={{ marginBottom: 8, color: 'var(--green-primary)' }}>No crops listed yet</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.875rem' }}>List your first crop and start getting buyers!</p>
                <button className="btn btn-primary" style={{ maxWidth: 220, margin: '0 auto' }} onClick={() => navigate('/add-crop')}>
                  ➕ {t('crop.addCrop')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
