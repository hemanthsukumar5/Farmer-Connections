import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { LanguageCards } from '../components/Common';
import i18n from '../i18n';
import toast from 'react-hot-toast';

const STEPS = ['userType', 'basic', 'location', 'language'];

const STATES = [
  'Andhra Pradesh', 'Telangana', 'Karnataka', 'Maharashtra', 'Tamil Nadu',
  'Madhya Pradesh', 'Uttar Pradesh', 'Punjab', 'Haryana', 'Rajasthan',
  'Bihar', 'West Bengal', 'Gujarat', 'Odisha', 'Chhattisgarh', 'Other'
];

const DISTRICTS = {
  'Andhra Pradesh': ['Guntur', 'Krishna', 'Prakasam', 'East Godavari', 'West Godavari', 'Kurnool', 'Nellore', 'Chittoor', 'Kadapa', 'Anantapur', 'Srikakulam', 'Vizianagaram', 'Visakhapatnam', 'Other'],
  'Telangana': ['Hyderabad', 'Warangal', 'Khammam', 'Nalgonda', 'Karimnagar', 'Nizamabad', 'Medak', 'Ranga Reddy', 'Mahbubnagar', 'Adilabad', 'Other'],
};

function StepUserType({ form, set, errors, t }) {
  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: 8 }}>{t('auth.chooseUserType')}</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 28, fontSize: '0.9rem' }}>
        {t('auth.languageHint')}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          { role: 'farmer', emoji: '🧑‍🌾', label: t('auth.farmer'), desc: 'Sell my crops' },
          { role: 'buyer', emoji: '🛒', label: t('auth.buyer'), desc: 'Buy crops' },
        ].map(({ role, emoji, label, desc }) => (
          <div key={role}
            onClick={() => set('role', role)}
            style={{
              padding: 24, borderRadius: 'var(--radius)', border: `3px solid ${form.role === role ? 'var(--green-secondary)' : 'var(--border)'}`,
              background: form.role === role ? 'var(--green-light)' : 'white',
              textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
            }}>
            <div style={{ fontSize: '3rem', marginBottom: 8 }}>{emoji}</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{label}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>{desc}</div>
          </div>
        ))}
      </div>
      {errors.role && <div className="form-error" style={{ marginTop: 12 }}>⚠ {errors.role}</div>}
    </div>
  );
}

function StepBasic({ form, set, errors, t, clearErr }) {
  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>{t('auth.register')}</h2>
      <div className="form-group">
        <label className="form-label">{t('auth.fullName')} *</label>
        <input id="full-name" className={`form-input ${errors.full_name ? 'error' : ''}`} placeholder={t('auth.enterName')}
          value={form.full_name} onChange={e => { set('full_name', e.target.value); clearErr('full_name'); }}
          autoComplete="name" autoCapitalize="words" spellCheck={false} />
        {errors.full_name && <div className="form-error">⚠ {errors.full_name}</div>}
      </div>
      <div className="form-group">
        <label className="form-label">{t('auth.mobile')} *</label>
        <input id="mobile" type="tel" className={`form-input ${errors.mobile ? 'error' : ''}`} placeholder={t('auth.enterMobile')}
          value={form.mobile} maxLength={10} inputMode="numeric" autoComplete="tel"
          onChange={e => { set('mobile', e.target.value.replace(/\D/g,'')); clearErr('mobile'); }}
          autoCapitalize="none" spellCheck={false} />
        {errors.mobile && <div className="form-error">⚠ {errors.mobile}</div>}
      </div>
      <div className="form-group">
        <label className="form-label">{t('auth.password')} *</label>
        <input id="password" type="password" className={`form-input ${errors.password ? 'error' : ''}`} placeholder={t('auth.enterPassword')}
          value={form.password} onChange={e => { set('password', e.target.value); clearErr('password'); }}
          autoComplete="new-password" spellCheck={false} />
        {errors.password && <div className="form-error">⚠ {errors.password}</div>}
      </div>
      <div className="form-group">
        <label className="form-label">{t('auth.confirmPassword')} *</label>
        <input id="confirm-password" type="password" className={`form-input ${errors.confirmPassword ? 'error' : ''}`} placeholder={t('auth.enterConfirmPassword')}
          value={form.confirmPassword} onChange={e => { set('confirmPassword', e.target.value); clearErr('confirmPassword'); }}
          autoComplete="new-password" spellCheck={false} />
        {errors.confirmPassword && <div className="form-error">⚠ {errors.confirmPassword}</div>}
      </div>
    </div>
  );
}

function StepLocation({ form, set, errors, t, clearErr }) {
  const districts = DISTRICTS[form.state] || [];
  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>📍 {t('auth.state')}, {t('auth.district')}</h2>
      <div className="form-group">
        <label className="form-label">{t('auth.state')} *</label>
        <select className={`form-input form-select ${errors.state ? 'error' : ''}`} value={form.state}
          onChange={e => { set('state', e.target.value); set('district', ''); clearErr('state'); }}>
          <option value="">{t('auth.selectState')}</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {errors.state && <div className="form-error">⚠ {errors.state}</div>}
      </div>
      <div className="form-group">
        <label className="form-label">{t('auth.district')} *</label>
        {districts.length > 0 ? (
          <select className={`form-input form-select ${errors.district ? 'error' : ''}`} value={form.district}
            onChange={e => { set('district', e.target.value); clearErr('district'); }}>
            <option value="">{t('auth.selectDistrict')}</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        ) : (
          <input className={`form-input ${errors.district ? 'error' : ''}`} placeholder={t('auth.selectDistrict')}
            value={form.district} onChange={e => { set('district', e.target.value); clearErr('district'); }}
            autoComplete="address-level2" spellCheck={false} />
        )}
        {errors.district && <div className="form-error">⚠ {errors.district}</div>}
      </div>
      <div className="form-group">
        <label className="form-label">{t('auth.village')}</label>
        <input className="form-input" placeholder={t('auth.enterVillage')} value={form.village} onChange={e => set('village', e.target.value)}
          autoComplete="address-level3" spellCheck={false} />
      </div>
    </div>
  );
}

function StepLanguage({ form, set, t, i18n }) {
  return (
    <div>
      <h2 style={{ marginBottom: 8, textAlign: 'center' }}>{t('auth.selectLanguage')}</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.875rem' }}>
        {t('auth.languageHint')}
      </p>
      <LanguageCards selected={form.preferred_language} onChange={(lang) => {
        set('preferred_language', lang);
        i18n.changeLanguage(lang);
        localStorage.setItem('rythuconnect_lang', lang);
      }} />
    </div>
  );
}

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    role: '', full_name: '', mobile: '', password: '', confirmPassword: '',
    state: '', district: '', village: '', preferred_language: 'en'
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const clearErr = (key) => setErrors(e => { const n = {...e}; delete n[key]; return n; });

  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepUserType form={form} set={set} errors={errors} t={t} />;
      case 1:
        return <StepBasic form={form} set={set} errors={errors} t={t} clearErr={clearErr} />;
      case 2:
        return <StepLocation form={form} set={set} errors={errors} t={t} clearErr={clearErr} />;
      case 3:
        return <StepLanguage form={form} set={set} t={t} i18n={i18n} />;
      default:
        return null;
    }
  };

  const validateStep = () => {
    const e = {};
    if (step === 0 && !form.role) e.role = t('common.required');
    if (step === 1) {
      if (!form.full_name.trim()) e.full_name = t('common.required');
      if (!/^\d{10}$/.test(form.mobile)) e.mobile = t('common.invalidMobile');
      if (form.password.length < 8) e.password = t('common.minPassword');
      if (form.password !== form.confirmPassword) e.confirmPassword = t('auth.passwordMismatch');
    }
    if (step === 2) {
      if (!form.state) e.state = t('common.required');
      if (!form.district) e.district = t('common.required');
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) setStep(s => s + 1);
  };

  const handleFinish = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      const { confirmPassword, mobile, ...payload } = form;
      await authAPI.register({ ...payload, mobile_number: mobile });
      // Auto-login
      const { data: tokens } = await authAPI.login({ mobile: form.mobile, password: form.password });
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('rythuconnect_lang', form.preferred_language);
      i18n.changeLanguage(form.preferred_language);
      toast.success(t('auth.registerSuccess'));
      navigate('/home');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || t('common.error');
      toast.error(msg);
      if (msg.toLowerCase().includes('otp')) setErrors({ otp: msg });
    } finally {
      setLoading(false);
    }
  };

  // Step indicator dots
  const stepProgress = Math.round((step / (STEPS.length - 1)) * 100);

  return (
    <div className="full-page" style={{ paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ background: 'var(--green-primary)', padding: '24px 20px 32px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/login')}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: '1rem' }}>
            ←
          </button>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{t('auth.createAccount')}</div>
            <div style={{ opacity: 0.8, fontSize: '0.8rem' }}>Step {step + 1} of {STEPS.length}</div>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: 4, height: 6 }}>
          <div style={{ background: 'white', borderRadius: 4, height: 6, width: `${stepProgress}%`, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      <div style={{ padding: '24px 20px', marginTop: -12 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          {renderStep()}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {step > 0 && (
            <button className="btn btn-outline" style={{ flex: '0 0 auto', width: 'auto', paddingLeft: 20, paddingRight: 20 }}
              onClick={() => setStep(s => s - 1)}>
              ← {t('auth.back')}
            </button>
          )}
          <button
            id={step === STEPS.length - 1 ? 'finish-btn' : 'next-btn'}
            className="btn btn-primary" style={{ flex: 1 }}
            onClick={step === STEPS.length - 1 ? handleFinish : handleNext}
            disabled={loading}>
            {loading ? '⏳ ' + t('common.loading') :
             step === STEPS.length - 1 ? '✅ ' + t('auth.finish') :
             t('auth.next') + ' →'}
          </button>
        </div>
      </div>
    </div>
  );
}
