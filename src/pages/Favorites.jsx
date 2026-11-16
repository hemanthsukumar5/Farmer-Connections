import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { favoritesAPI, cropAPI } from '../services/api';
import { TopNav, BottomNav } from '../components/Layout';
import { CropCard, EmptyState, LoadingSpinner } from '../components/Common';
import toast from 'react-hot-toast';

export default function Favorites() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFavorites(); }, []);

  const loadFavorites = async () => {
    try {
      const { data } = await favoritesAPI.list();
      // Load full crop details
      const crops = await Promise.all(
        data.map(fav => cropAPI.detail(fav.listing).then(r => ({ ...r.data, fav_id: fav.id })).catch(() => null))
      );
      setFavorites(crops.filter(Boolean));
    } finally { setLoading(false); }
  };

  const handleRemove = async (listingId) => {
    try {
      await favoritesAPI.remove(listingId);
      setFavorites(prev => prev.filter(c => c.id !== listingId));
      toast(t('common.removed'));
    } catch { toast.error(t('common.error')); }
  };

  return (
    <div className="full-page">
      <TopNav title={`❤️ ${t('common.favorites')}`} />
      <div className="page-content">
        {loading ? <LoadingSpinner /> : favorites.length === 0 ? (
          <EmptyState icon="❤️" title="No favorites yet" message="Save crops you like to see them here."
            action={<button className="btn btn-primary" style={{ maxWidth: 220, margin: '0 auto' }} onClick={() => navigate('/marketplace')}>
              🔍 {t('home.buyCrops')}
            </button>} />
        ) : (
          <>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.875rem' }}>{favorites.length} saved crops</p>
            <div className="crops-grid">
              {favorites.map(crop => (
                <div key={crop.id} style={{ position: 'relative' }}>
                  <CropCard crop={crop} onClick={() => navigate(`/crops/${crop.id}`)} />
                  <button onClick={() => handleRemove(crop.id)}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'white', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: '0.9rem' }}>
                    ❌
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
