import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { cropAPI, chatAPI, favoritesAPI } from '../services/api';
import { TopNav, BottomNav } from '../components/Layout';
import { LoadingSpinner } from '../components/Common';
import toast from 'react-hot-toast';

export default function CropDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    cropAPI.detail(id).then(({ data }) => {
      setCrop(data);
      setLoading(false);
    }).catch(() => { setLoading(false); navigate('/marketplace'); });

    if (user) {
      favoritesAPI.list().then(({ data }) => {
        setIsFav(data.some(f => f.listing === parseInt(id)));
      }).catch(() => {});
    }
  }, [id]);

  const handleChat = async () => {
    if (!user) { navigate('/login'); return; }
    if (user.id === crop.farmer) { toast('You cannot chat with yourself!'); return; }
    setChatLoading(true);
    try {
      const { data } = await chatAPI.startConversation(id);
      navigate(`/chat/${data.id}`);
    } catch (err) {
      toast.error(t('common.error'));
    } finally {
      setChatLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      if (isFav) {
        await favoritesAPI.remove(id);
        setIsFav(false);
        toast(t('common.removed'));
      } else {
        await favoritesAPI.add(id);
        setIsFav(true);
        toast.success(t('crop.saveToFavorites') + '!');
      }
    } catch { toast.error(t('common.error')); }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: crop.crop_name, text: `Check this crop on RythuConnect: ${crop.crop_name} - ₹${crop.price_per_unit}`, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }
  };

  if (loading) return <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center' }}><LoadingSpinner /></div>;
  if (!crop) return null;

  const images = crop.images || [];
  const unitLabel = { kg: t('common.perKg'), quintal: t('common.perQuintal'), tonne: t('common.perTonne') }[crop.quantity_unit] || crop.quantity_unit;
  const isOwner = user?.id === crop.farmer;

  return (
    <div className="full-page">
      <TopNav showBack title={t('crop.cropDetails')} />

      <div style={{ overflowY: 'auto', paddingBottom: 100 }}>
        {/* Image Gallery */}
        <div style={{ position: 'relative', background: 'var(--green-light)', height: 260 }}>
          {images.length > 0 ? (
            <img src={images[imgIdx]?.image} alt={crop.crop_name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>
              {crop.category === 'paddy' ? '🌾' : crop.category === 'cotton' ? '🌿' : '🌱'}
            </div>
          )}
          {images.length > 1 && (
            <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
              {images.map((_, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: i === imgIdx ? 'white' : 'rgba(255,255,255,0.5)' }} />
              ))}
            </div>
          )}
          <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
            <button onClick={handleFavorite} className="nav-icon-btn" style={{ background: 'white', fontSize: '1.2rem' }}>
              {isFav ? '❤️' : '🤍'}
            </button>
            <button onClick={handleShare} className="nav-icon-btn" style={{ background: 'white' }}>🔗</button>
          </div>
          {crop.status === 'sold' && (
            <div style={{ position: 'absolute', top: 12, left: 12, background: 'var(--red)', color: 'white', padding: '4px 12px', borderRadius: 20, fontWeight: 700, fontSize: '0.85rem' }}>
              SOLD
            </div>
          )}
        </div>

        <div style={{ padding: '20px 16px' }}>
          {/* Title & Price */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{crop.crop_name}</h1>
              {crop.variety && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 2 }}>{crop.variety}</p>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-primary)' }}>
                ₹{Number(crop.price_per_unit).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{unitLabel}</div>
            </div>
          </div>

          {/* Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '16px 0' }}>
            {[
              { label: t('crop.quantity'), value: `${Number(crop.quantity_available).toLocaleString()} ${crop.quantity_unit}` },
              { label: t('crop.status'), value: <span className={`badge-status ${crop.status === 'active' ? 'badge-active' : 'badge-sold'}`}>{crop.status}</span> },
              { label: t('crop.harvestDate'), value: crop.harvest_date ? new Date(crop.harvest_date).toLocaleDateString('en-IN') : '-' },
              { label: t('crop.listingDate'), value: new Date(crop.created_at).toLocaleDateString('en-IN') },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                <div style={{ fontWeight: 700, marginTop: 4, fontSize: '0.9rem' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          {crop.description && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 8 }}>Description</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{crop.description}</p>
            </div>
          )}

          <div className="divider" />

          {/* Farmer Info */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 12 }}>{t('crop.farmerName')}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg)', borderRadius: 12, padding: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 700, color: 'var(--green-primary)', flexShrink: 0 }}>
                {crop.farmer_name?.[0]?.toUpperCase() || '🧑'}
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{crop.farmer_name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  📍 {[crop.village, crop.district, crop.state].filter(Boolean).join(', ')}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!isOwner && crop.status === 'active' && user?.role === 'buyer' && crop.phone_visible && crop.farmer_mobile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href={`tel:${crop.farmer_mobile}`} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                📞 Contact: {crop.farmer_mobile}
              </a>
            </div>
          )}

          {!isOwner && crop.status === 'active' && !user && (
            <div className="btn btn-outline" style={{ pointerEvents: 'none', opacity: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              📞 Login as buyer to view contact
            </div>
          )}

          {isOwner && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate(`/crops/${id}/edit`)}>
                ✏️ {t('crop.editCrop')}
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/my-listings')}>
                📋 {t('home.myListings')}
              </button>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
