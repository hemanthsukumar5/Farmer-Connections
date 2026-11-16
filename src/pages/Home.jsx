import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cropAPI } from '../services/api';
import { TopNav, BottomNav } from '../components/Layout';
import { CropCard, CATEGORIES, VoiceButton } from '../components/Common';
import toast from 'react-hot-toast';

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');

  useEffect(() => {
    loadCrops();
  }, [selectedCat]);

  const loadCrops = async () => {
    try {
      const params = { status: 'active', ordering: '-created_at', page_size: 10 };
      if (selectedCat) params.category = selectedCat;
      const { data } = await cropAPI.list(params);
      setCrops(data.results || data);
    } catch {
      // show empty state
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/marketplace?search=${encodeURIComponent(search)}`);
  };

  const handleVoiceResult = (text) => {
    toast(`Heard: "${text}"`, { icon: '🎤' });
    setSearch(text);
    navigate(`/marketplace?search=${encodeURIComponent(text)}`);
  };

  const actionCards = [
    {
      icon: '🧑‍🌾', label: t('home.sellCrops'), cls: 'sell',
      onClick: () => user?.role === 'farmer' ? navigate('/add-crop') : toast(t('auth.farmer') + ' only'),
    },
    { icon: '🛒', label: t('home.buyCrops'), cls: 'buy', onClick: () => navigate('/marketplace') },
    { icon: '📋', label: t('home.myListings'), cls: '', onClick: () => user?.role === 'farmer' ? navigate('/my-listings') : navigate('/favorites') },

  ];

  return (
    <div className="full-page">
      <TopNav />

      <div className="page-content">
        {/* Welcome */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: '1.4rem', marginBottom: 4 }}>
            {t('home.welcome')} 🌾
          </h1>
          {user && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {t('dashboard.welcome')}, <strong>{user.full_name}</strong>!
            </p>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              id="home-search"
              placeholder={t('home.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button type="submit" style={{ background: 'var(--green-secondary)', border: 'none', color: 'white', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                {t('common.search')}
              </button>
            )}
          </div>
        </form>

        {/* Action Cards */}
        <div className="action-cards" style={{ marginBottom: 24 }}>
          {actionCards.map((card, i) => (
            <div key={i} className={`action-card ${card.cls}`} onClick={card.onClick}>
              <span className="action-card-icon">{card.icon}</span>
              <span className="action-card-label">{card.label}</span>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div style={{ marginBottom: 24 }}>
          <div className="section-title">
            {t('home.categories')}
            <button className="section-link" onClick={() => { setSelectedCat(''); navigate('/marketplace'); }}>
              {t('home.viewAll')}
            </button>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <div
                key={cat.key}
                className={`category-card ${selectedCat === cat.key ? 'active' : ''}`}
                onClick={() => setSelectedCat(selectedCat === cat.key ? '' : cat.key)}
              >
                <span style={{ fontSize: '2rem' }}>{cat.emoji}</span>
                <span>{t(`crop.${cat.key}`)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Listings */}
        <div>
          <div className="section-title">
            {t('home.recentListings')}
            <button className="section-link" onClick={() => navigate('/marketplace')}>
              {t('home.viewAll')}
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ borderRadius: 16, overflow: 'hidden' }}>
                  <div className="skeleton" style={{ height: 160 }} />
                  <div style={{ padding: 12 }}>
                    <div className="skeleton" style={{ height: 16, marginBottom: 8, borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 12, width: '60%', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : crops.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12, opacity: 0.4 }}>🌱</div>
              <p>{t('crop.noResults')}</p>
            </div>
          ) : (
            <div className="crops-grid">
              {crops.map(crop => (
                <CropCard
                  key={crop.id}
                  crop={crop}
                  onClick={() => navigate(`/crops/${crop.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sell CTA for Farmers */}
        {user?.role === 'farmer' && (
          <div style={{ marginTop: 24, background: 'linear-gradient(135deg, #166534, #22C55E)', borderRadius: 'var(--radius)', padding: 20, color: 'white', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🧑‍🌾</div>
            <h3 style={{ marginBottom: 6 }}>Ready to sell your crops?</h3>
            <p style={{ opacity: 0.85, fontSize: '0.875rem', marginBottom: 16 }}>List your crops in 5 simple steps</p>
            <button className="btn" style={{ background: 'white', color: 'var(--green-primary)', fontWeight: 700 }} onClick={() => navigate('/add-crop')}>
              + {t('crop.addCrop')}
            </button>
          </div>
        )}
      </div>

      <VoiceButton onResult={handleVoiceResult} />
      <BottomNav />
    </div>
  );
}
