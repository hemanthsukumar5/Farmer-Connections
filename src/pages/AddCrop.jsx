import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { cropAPI } from '../services/api';
import { TopNav } from '../components/Layout';
import { CATEGORIES, StepIndicator } from '../components/Common';
import toast from 'react-hot-toast';

const UNITS = ['kg', 'quintal', 'tonne'];
const STATES = ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Madhya Pradesh', 'Uttar Pradesh', 'Punjab', 'Haryana', 'Rajasthan', 'Bihar', 'Gujarat', 'Other'];
const DISTRICTS = { 'Andhra Pradesh': ['Guntur','Krishna','Prakasam','East Godavari','West Godavari','Kurnool','Nellore','Chittoor','Kadapa','Anantapur','Srikakulam','Vizianagaram','Visakhapatnam','Other'], 'Telangana': ['Hyderabad','Warangal','Khammam','Nalgonda','Karimnagar','Nizamabad','Medak','Ranga Reddy','Mahbubnagar','Adilabad','Other'] };

function Step0({ form, set, errors, t, clearErr }) {
  return (
    <div>
      <h2 style={{ marginBottom: 8 }}>🌿 {t('crop.selectCropType')}</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.875rem' }}>Select your crop or type a new name</p>
      <div className="categories-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {CATEGORIES.map(cat => (
          <div key={cat.key} className={`category-card ${form.category === cat.key ? 'active' : ''}`}
            style={{ padding: 16 }}
            onClick={() => { set('category', cat.key); if (cat.key !== 'other') set('crop_name', t(`crop.${cat.key}`)); }}>
            <span style={{ fontSize: '2.5rem' }}>{cat.emoji}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t(`crop.${cat.key}`)}</span>
          </div>
        ))}
      </div>
      {(form.category === 'other' || form.category) && (
        <div className="form-group">
          <label className="form-label">{t('crop.cropName')} *</label>
          <input className={`form-input ${errors.crop_name ? 'error' : ''}`}
            placeholder={t('crop.enterCropName')} value={form.crop_name}
            onChange={e => { set('crop_name', e.target.value); clearErr('crop_name'); }} />
          {errors.crop_name && <div className="form-error">⚠ {errors.crop_name}</div>}
        </div>
      )}
    </div>
  );
}

function Step1({ form, set, fileRef, t }) {
  const handleFiles = (files) => {
    const newImgs = [...form.images];
    Array.from(files).forEach(f => { if (newImgs.length < 5) newImgs.push({ file: f, url: URL.createObjectURL(f) }); });
    set('images', newImgs);
  };

  return (
    <div>
      <h2 style={{ marginBottom: 8 }}>📷 {t('crop.addPhotos')}</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.875rem' }}>Add up to 5 crop photos (optional but recommended)</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div className="photo-upload-area" style={{ padding: 20 }} onClick={() => { if(fileRef.current){ fileRef.current.capture='environment'; fileRef.current.click(); }}}>
          <span style={{ fontSize: '2rem' }}>📸</span>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t('crop.takePhoto')}</span>
        </div>
        <div className="photo-upload-area" style={{ padding: 20 }} onClick={() => { if(fileRef.current){ fileRef.current.capture=''; fileRef.current.click(); }}}>
          <span style={{ fontSize: '2rem' }}>🖼️</span>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t('crop.chooseGallery')}</span>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple hidden
        onChange={e => handleFiles(e.target.files)} />
      {form.images.length > 0 && (
        <div className="photo-grid">
          {form.images.map((img, i) => (
            <div key={i} className="photo-thumb">
              <img src={img.url} alt="crop" />
              {i === form.primaryImg && <span className="primary-badge">MAIN</span>}
              <div className="photo-thumb-actions">
                <button style={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                  onClick={() => set('primaryImg', i)}>⭐</button>
                <button style={{ background: 'rgba(239,68,68,0.9)', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer', color: 'white' }}
                  onClick={() => { const imgs = form.images.filter((_, j) => j !== i); set('images', imgs); if (form.primaryImg >= imgs.length) set('primaryImg', 0); }}>✕</button>
              </div>
            </div>
          ))}
          {form.images.length < 5 && (
            <div className="photo-thumb" style={{ border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--bg)', aspectRatio: '1' }}
              onClick={() => fileRef.current?.click()}>
              <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>+</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Step2({ form, set, t }) {
  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>📦 {t('crop.quantity')}</h2>
      <div style={{ marginBottom: 24 }}>
        <label className="form-label">{t('crop.unit')}</label>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          {UNITS.map(u => (
            <button key={u} onClick={() => set('quantity_unit', u)}
              style={{ flex: 1, padding: '12px 8px', borderRadius: 12, border: `2px solid ${form.quantity_unit === u ? 'var(--green-secondary)' : 'var(--border)'}`,
                background: form.quantity_unit === u ? 'var(--green-light)' : 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
              {t(`crop.quantity_${u[0]}`)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: 16 }}>{t('crop.quantity')} ({form.quantity_unit})</label>
        <div className="qty-stepper">
          <button className="qty-stepper-btn" onClick={() => set('quantity_available', Math.max(1, form.quantity_available - (form.quantity_unit === 'kg' ? 10 : 1)))}>−</button>
          <input className="qty-stepper-input form-input" type="number" min="1"
            value={form.quantity_available}
            onChange={e => set('quantity_available', Math.max(1, parseInt(e.target.value) || 1))} />
          <button className="qty-stepper-btn" onClick={() => set('quantity_available', form.quantity_available + (form.quantity_unit === 'kg' ? 10 : 1))}>+</button>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 12, fontSize: '0.875rem' }}>
          Total: <strong>{Number(form.quantity_available).toLocaleString()} {form.quantity_unit}</strong>
        </p>
      </div>
    </div>
  );
}

function Step3({ form, set, errors, t, clearErr }) {
  const districts = DISTRICTS[form.state] || [];
  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>💰 {t('crop.price')} & {t('crop.location')}</h2>
      <div className="form-group">
        <label className="form-label">{t('crop.price')} (₹ per {form.quantity_unit}) *</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--green-primary)', fontSize: '1.1rem' }}>₹</span>
          <input className={`form-input ${errors.price_per_unit ? 'error' : ''}`} type="number" min="1" inputMode="numeric"
            placeholder="e.g. 2400" value={form.price_per_unit} style={{ paddingLeft: 32 }}
            onChange={e => { set('price_per_unit', e.target.value); clearErr('price_per_unit'); }} />
        </div>
        {errors.price_per_unit && <div className="form-error">⚠ {errors.price_per_unit}</div>}
        {form.price_per_unit && <div className="form-hint">₹{Number(form.price_per_unit).toLocaleString('en-IN')} per {form.quantity_unit} (illustrative only)</div>}
      </div>
      <div className="form-group">
        <label className="form-label">{t('crop.variety')}</label>
        <input className="form-input" placeholder={t('crop.enterVariety')} value={form.variety} onChange={e => set('variety', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">{t('auth.state')} *</label>
        <select className={`form-input form-select ${errors.state ? 'error' : ''}`} value={form.state}
          onChange={e => { set('state', e.target.value); set('district', ''); clearErr('state'); }}>
          <option value="">{t('auth.selectState')}</option>
          {STATES.map(s => <option key={s}>{s}</option>)}
        </select>
        {errors.state && <div className="form-error">⚠ {errors.state}</div>}
      </div>
      <div className="form-group">
        <label className="form-label">{t('auth.district')} *</label>
        {districts.length > 0 ? (
          <select className={`form-input form-select ${errors.district ? 'error' : ''}`} value={form.district}
            onChange={e => { set('district', e.target.value); clearErr('district'); }}>
            <option value="">{t('auth.selectDistrict')}</option>
            {districts.map(d => <option key={d}>{d}</option>)}
          </select>
        ) : (
          <input className="form-input" placeholder={t('auth.selectDistrict')} value={form.district} onChange={e => set('district', e.target.value)} />
        )}
        {errors.district && <div className="form-error">⚠ {errors.district}</div>}
      </div>
      <div className="form-group">
        <label className="form-label">{t('auth.village')}</label>
        <input className="form-input" placeholder={t('auth.enterVillage')} value={form.village} onChange={e => set('village', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">{t('crop.harvestDate')}</label>
        <input className="form-input" type="date" value={form.harvest_date} onChange={e => set('harvest_date', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">{t('crop.description')}</label>
        <textarea className="form-input" rows={3} placeholder={t('crop.enterDescription')} value={form.description} onChange={e => set('description', e.target.value)} />
      </div>
    </div>
  );
}

function Step4({ form, t }) {
  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>✅ {t('crop.reviewTitle')}</h2>
      <div className="card" style={{ marginBottom: 16 }}>
        {form.images.length > 0 && (
          <img src={form.images[form.primaryImg]?.url} alt="crop" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 10, marginBottom: 16 }} />
        )}
        <div style={{ display: 'grid', gap: 10 }}>
          {[
            ['Crop', form.crop_name],
            ['Variety', form.variety || '-'],
            ['Quantity', `${form.quantity_available} ${form.quantity_unit}`],
            ['Price', `₹${Number(form.price_per_unit).toLocaleString('en-IN')} per ${form.quantity_unit}`],
            ['Location', [form.village, form.district, form.state].filter(Boolean).join(', ')],
            ['Harvest Date', form.harvest_date || '-'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{k}</span>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', textAlign: 'right', maxWidth: '55%' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      {form.description && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 8 }}>Description</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{form.description}</p>
        </div>
      )}
    </div>
  );
}

export default function AddCrop() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishedId, setPublishedId] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    category: '', crop_name: '', variety: '', description: '',
    images: [], primaryImg: 0,
    quantity_available: 10, quantity_unit: 'quintal',
    price_per_unit: '', state: '', district: '', village: '', harvest_date: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const clearErr = (key) => setErrors(e => { const n = { ...e }; delete n[key]; return n; });

  const STEP_LABELS = [t('crop.step1'), t('crop.step2'), t('crop.step3'), t('crop.step4'), t('crop.step5')];

  const renderStep = () => {
    switch (step) {
      case 0:
        return <Step0 form={form} set={set} errors={errors} t={t} clearErr={clearErr} />;
      case 1:
        return <Step1 form={form} set={set} t={t} fileRef={fileRef} />;
      case 2:
        return <Step2 form={form} set={set} t={t} />;
      case 3:
        return <Step3 form={form} set={set} errors={errors} t={t} clearErr={clearErr} />;
      case 4:
        return <Step4 form={form} t={t} />;
      default:
        return null;
    }
  };

  const validateStep = () => {
    const e = {};
    if (step === 0) { if (!form.category) e.category = t('common.required'); if (!form.crop_name) e.crop_name = t('common.required'); }
    if (step === 3) {
      if (!form.price_per_unit || isNaN(form.price_per_unit)) e.price_per_unit = t('common.required');
      if (!form.state) e.state = t('common.required');
      if (!form.district) e.district = t('common.required');
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== 'images' && k !== 'primaryImg' && v !== '') fd.append(k, v);
      });

      const { data: crop } = await cropAPI.create(fd);

      // Upload images
      for (let i = 0; i < form.images.length; i++) {
        const ifd = new FormData();
        ifd.append('image', form.images[i].file);
        ifd.append('is_primary', i === form.primaryImg);
        await cropAPI.uploadImage(crop.id, ifd);
      }

      setPublishedId(crop.id);
      setPublished(true);
      toast.success(t('crop.publishSuccess'));
    } catch (err) {
      toast.error(err.response?.data?.detail || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (published) {
    return (
      <div className="full-page" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 32 }}>
        <div className="success-icon">✅</div>
        <h2 className="success-title">{t('crop.publishSuccess')}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '0.95rem' }}>{t('crop.publishSuccessMsg')}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 280, margin: '0 auto' }}>
          <button className="btn btn-primary" onClick={() => navigate(`/crops/${publishedId}`)}>{t('crop.viewMyListings')}</button>
          <button className="btn btn-outline" onClick={() => { setPublished(false); setStep(0); setForm({ category: '', crop_name: '', variety: '', description: '', images: [], primaryImg: 0, quantity_available: 10, quantity_unit: 'quintal', price_per_unit: '', state: '', district: '', village: '', harvest_date: '' }); }}>
            + {t('crop.addAnother')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="full-page">
      <TopNav showBack title={t('crop.addCrop')} />
      <div style={{ overflowY: 'auto', paddingBottom: 100 }}>
        <div style={{ padding: '16px 16px 0' }}>
          <StepIndicator steps={STEP_LABELS} currentStep={step} />
        </div>
        <div style={{ padding: '20px 16px' }}>
          <div className="card" style={{ marginBottom: 20 }}>
            {renderStep()}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {step > 0 && (
              <button className="btn btn-outline" style={{ flex: '0 0 auto', width: 'auto', padding: '14px 20px' }}
                onClick={() => setStep(s => s - 1)} disabled={loading}>
                ← {t('auth.back')}
              </button>
            )}
            <button id={step === 4 ? 'publish-btn' : 'next-btn'} className="btn btn-primary" style={{ flex: 1 }}
              onClick={step === 4 ? handlePublish : () => { if (validateStep()) setStep(s => s + 1); }}
              disabled={loading}>
              {loading ? '⏳ ' + t('common.loading') :
               step === 4 ? '🚀 ' + t('crop.publishCrop') :
               t('auth.next') + ' →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
