import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ mobile: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!/^\d{10}$/.test(form.mobile)) e.mobile = t('common.invalidMobile');
    if (!form.password) e.password = t('common.required');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form);
      toast.success(t('auth.loginSuccess'));
      navigate('/home');
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || t('common.error');
      toast.error(msg);
      if (err.response?.status === 401) {
        setErrors({ password: 'Invalid mobile number or password' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="full-page" style={{ background: 'linear-gradient(160deg, #166534 0%, #22C55E 100%)', justifyContent: 'center', padding: '24px 20px' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', color: 'white', marginBottom: 32 }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🌾</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>RythuConnect</h1>
        <p style={{ opacity: 0.85, marginTop: 6 }}>{t('home.tagline')}</p>
      </div>

      {/* Card */}
      <div className="card" style={{ borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ marginBottom: 24, textAlign: 'center' }}>{t('auth.login')}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('auth.mobile')}</label>
            <input
              id="mobile"
              type="tel"
              className={`form-input ${errors.mobile ? 'error' : ''}`}
              placeholder={t('auth.enterMobile')}
              value={form.mobile}
              maxLength={10}
              onChange={e => setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g, '') }))}
              inputMode="numeric"
              autoComplete="tel"
              autoCapitalize="none"
              spellCheck={false}
            />
            {errors.mobile && <div className="form-error">⚠ {errors.mobile}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">{t('auth.password')}</label>
            <input
              id="password"
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder={t('auth.enterPassword')}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              autoComplete="current-password"
              spellCheck={false}
            />
            {errors.password && <div className="form-error">⚠ {errors.password}</div>}
          </div>

          <div style={{ textAlign: 'right', marginBottom: 20, marginTop: -8 }}>
            <Link to="/forgot-password" style={{ color: 'var(--green-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>
              {t('auth.forgotPassword')}
            </Link>
          </div>

          <button id="login-btn" type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ ' + t('common.loading') : '🔑 ' + t('auth.loginBtn')}
          </button>
        </form>

        <div className="divider-text" style={{ marginTop: 24 }}>
          <span>{t('auth.noAccount')}</span>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/register')}>
          ✨ {t('auth.registerBtn')}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={() => navigate('/marketplace')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer' }}>
            {t('auth.continueAsGuest')}
          </button>
        </div>
      </div>
    </div>
  );
}
