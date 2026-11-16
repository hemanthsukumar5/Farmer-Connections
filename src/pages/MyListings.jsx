import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { cropAPI } from '../services/api';
import { TopNav, BottomNav } from '../components/Layout';
import { LoadingSpinner, EmptyState } from '../components/Common';
import toast from 'react-hot-toast';

export default function MyListings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editQty, setEditQty] = useState(null); // { id, qty }

  useEffect(() => { loadListings(); }, [filter]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      const { data } = await cropAPI.myListings(params);
      setListings(data.results || data);
    } finally { setLoading(false); }
  };

  const handleMarkSold = async (id) => {
    if (!confirm('Mark this crop as sold?')) return;
    try {
      await cropAPI.update(id, { status: 'sold' });
      toast.success('Marked as sold!');
      loadListings();
    } catch { toast.error(t('common.error')); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this listing permanently?')) return;
    try {
      await cropAPI.delete(id);
      toast.success('Listing deleted');
      loadListings();
    } catch { toast.error(t('common.error')); }
  };

  const handleUpdateQty = async (id, qty) => {
    try {
      await cropAPI.update(id, { quantity_available: qty });
      toast.success('Quantity updated!');
      setEditQty(null);
      loadListings();
    } catch { toast.error(t('common.error')); }
  };

  const CropEmoji = { cotton: '🌿', paddy: '🌾', mirchi: '🌶️', maize: '🌽', turmeric: '🟡', groundnut: '🥜', other: '🌱' };

  return (
    <div className="full-page">
      <TopNav showBack title={t('home.myListings')} />
      <div className="page-content">
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' }}>
          {['all', 'active', 'sold'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '8px 18px', borderRadius: 20, border: `2px solid ${filter === f ? 'var(--green-primary)' : 'var(--border)'}`,
                background: filter === f ? 'var(--green-primary)' : 'white', color: filter === f ? 'white' : 'var(--text-main)',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
              {f === 'all' ? 'All' : t(`crop.${f}`)}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : listings.length === 0 ? (
          <EmptyState icon="🌱" title={t('crop.noListings')} message={t('crop.noListingsMsg')}
            action={<button className="btn btn-primary" style={{ maxWidth: 220, margin: '0 auto' }} onClick={() => navigate('/add-crop')}>
              + {t('crop.addCrop')}
            </button>} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {listings.map(crop => {
              const img = crop.images?.find(i => i.is_primary) || crop.images?.[0];
              return (
                <div key={crop.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', gap: 0 }}>
                    <div style={{ width: 100, flexShrink: 0, background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                      {img ? <img src={img.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : CropEmoji[crop.category] || '🌿'}
                    </div>
                    <div style={{ flex: 1, padding: '14px 14px 8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{crop.crop_name}</div>
                          {crop.variety && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{crop.variety}</div>}
                        </div>
                        <span className={`badge-status ${crop.status === 'active' ? 'badge-active' : 'badge-sold'}`}>
                          {t(`crop.${crop.status}`)}
                        </span>
                      </div>
                      <div style={{ marginTop: 6, fontSize: '0.875rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--green-primary)' }}>₹{Number(crop.price_per_unit).toLocaleString('en-IN')}</span>
                        <span style={{ color: 'var(--text-secondary)' }}> / {crop.quantity_unit}</span>
                      </div>

                      {/* Editable quantity */}
                      {editQty?.id === crop.id ? (
                        <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
                          <input type="number" value={editQty.qty} min="0"
                            onChange={e => setEditQty(q => ({ ...q, qty: e.target.value }))}
                            style={{ width: 80, padding: '6px 10px', border: '2px solid var(--green-secondary)', borderRadius: 8, fontSize: '0.9rem' }} />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{crop.quantity_unit}</span>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateQty(crop.id, editQty.qty)}>✓</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditQty(null)}>✕</button>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                          📦 {Number(crop.quantity_available).toLocaleString()} {crop.quantity_unit}
                          {crop.status === 'active' && (
                            <button onClick={() => setEditQty({ id: crop.id, qty: crop.quantity_available })}
                              style={{ marginLeft: 8, background: 'none', border: 'none', color: 'var(--green-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                              ✏️ Edit
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
                    <button onClick={() => navigate(`/crops/${crop.id}`)}
                      style={{ flex: 1, padding: '10px 8px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: 'var(--green-primary)' }}>
                      👁 View
                    </button>
                    <button onClick={() => navigate(`/crops/${crop.id}/edit`)}
                      style={{ flex: 1, padding: '10px 8px', border: 'none', borderLeft: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      ✏️ Edit
                    </button>
                    {crop.status === 'active' && (
                      <button onClick={() => handleMarkSold(crop.id)}
                        style={{ flex: 1, padding: '10px 8px', border: 'none', borderLeft: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: 'var(--amber)' }}>
                        ✅ Sold
                      </button>
                    )}
                    <button onClick={() => handleDelete(crop.id)}
                      style={{ flex: 1, padding: '10px 8px', border: 'none', borderLeft: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: 'var(--red)' }}>
                      🗑 Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <button className="btn btn-primary" onClick={() => navigate('/add-crop')}>
            + {t('crop.addCrop')}
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
