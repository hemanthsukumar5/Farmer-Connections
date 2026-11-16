import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cropAPI } from '../services/api';
import { TopNav } from '../components/Layout';
import { LoadingSpinner, CATEGORIES } from '../components/Common';
import toast from 'react-hot-toast';

const STATES = ['Andhra Pradesh','Telangana','Karnataka','Maharashtra','Tamil Nadu','Madhya Pradesh','Uttar Pradesh','Punjab','Haryana','Rajasthan','Bihar','Gujarat','Other'];
const DISTRICTS = { 'Andhra Pradesh': ['Guntur','Krishna','Prakasam','East Godavari','West Godavari','Kurnool','Nellore','Chittoor','Kadapa','Anantapur','Other'], 'Telangana': ['Hyderabad','Warangal','Khammam','Nalgonda','Karimnagar','Nizamabad','Medak','Ranga Reddy','Mahbubnagar','Adilabad','Other'] };
const UNITS = ['kg','quintal','tonne'];

export default function EditCrop() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    crop_name: '', category: '', variety: '', description: '',
    quantity_available: '', quantity_unit: 'quintal',
    price_per_unit: '', state: '', district: '', village: '', harvest_date: '', status: 'active',
  });

  useEffect(() => {
    cropAPI.detail(id).then(({ data }) => {
      setForm({
        crop_name: data.crop_name, category: data.category, variety: data.variety || '',
        description: data.description || '', quantity_available: data.quantity_available,
        quantity_unit: data.quantity_unit, price_per_unit: data.price_per_unit,
        state: data.state, district: data.district, village: data.village || '',
        harvest_date: data.harvest_date || '', status: data.status,
      });
      setLoading(false);
    }).catch(() => { toast.error('Listing not found'); navigate('/my-listings'); });
  }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.crop_name || !form.price_per_unit || !form.state || !form.district) {
      toast.error('Please fill all required fields'); return;
    }
    setSaving(true);
    try {
      await cropAPI.update(id, form);
      toast.success('Listing updated!');
      navigate(`/crops/${id}`);
    } catch (err) { toast.error(err.response?.data?.detail || t('common.error')); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center' }}><LoadingSpinner /></div>;

  const districts = DISTRICTS[form.state] || [];

  return (
    <div className="full-page">
      <TopNav showBack title={t('crop.editCrop')} />
      <div style={{ overflowY: 'auto', padding: '16px', paddingBottom: 100 }}>
        {/* Category */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 14 }}>🌿 {t('crop.cropName')}</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => set('category', c.key)}
                style={{ padding: '8px 14px', borderRadius: 20, border: `2px solid ${form.category === c.key ? 'var(--green-secondary)' : 'var(--border)'}`, background: form.category === c.key ? 'var(--green-light)' : 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                {c.emoji} {t(`crop.${c.key}`)}
              </button>
            ))}
          </div>
          <div className="form-group">
            <label className="form-label">{t('crop.cropName')} *</label>
            <input className="form-input" value={form.crop_name} onChange={e => set('crop_name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('crop.variety')}</label>
            <input className="form-input" placeholder={t('crop.enterVariety')} value={form.variety} onChange={e => set('variety', e.target.value)} />
          </div>
        </div>

        {/* Quantity & Price */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 14 }}>📦 {t('crop.quantity')} & 💰 {t('crop.price')}</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {UNITS.map(u => (
              <button key={u} onClick={() => set('quantity_unit', u)}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${form.quantity_unit === u ? 'var(--green-secondary)' : 'var(--border)'}`, background: form.quantity_unit === u ? 'var(--green-light)' : 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                {t(`crop.quantity_${u[0]}`)}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">{t('crop.quantity')} *</label>
              <input className="form-input" type="number" min="0" value={form.quantity_available} onChange={e => set('quantity_available', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('crop.price')} (₹) *</label>
              <input className="form-input" type="number" min="1" value={form.price_per_unit} onChange={e => set('price_per_unit', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('crop.status')}</label>
            <select className="form-input form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="active">{t('crop.active')}</option>
              <option value="sold">{t('crop.sold')}</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 14 }}>📍 {t('crop.location')}</h3>
          <div className="form-group">
            <label className="form-label">{t('auth.state')} *</label>
            <select className="form-input form-select" value={form.state} onChange={e => { set('state', e.target.value); set('district', ''); }}>
              <option value="">{t('auth.selectState')}</option>
              {STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.district')} *</label>
            {districts.length > 0 ? (
              <select className="form-input form-select" value={form.district} onChange={e => set('district', e.target.value)}>
                <option value="">{t('auth.selectDistrict')}</option>
                {districts.map(d => <option key={d}>{d}</option>)}
              </select>
            ) : <input className="form-input" value={form.district} onChange={e => set('district', e.target.value)} />}
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.village')}</label>
            <input className="form-input" value={form.village} onChange={e => set('village', e.target.value)} />
          </div>
        </div>

        {/* Description */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 14 }}>📝 {t('crop.description')}</h3>
          <textarea className="form-input" rows={3} placeholder={t('crop.enterDescription')} value={form.description} onChange={e => set('description', e.target.value)} />
          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="form-label">{t('crop.harvestDate')}</label>
            <input className="form-input" type="date" value={form.harvest_date} onChange={e => set('harvest_date', e.target.value)} />
          </div>
        </div>

        <button id="save-crop-btn" className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? '⏳ ' + t('common.loading') : '✅ ' + t('crop.updateListing')}
        </button>
      </div>
    </div>
  );
}
