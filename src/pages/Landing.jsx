import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const features = [
    { icon: '💰', title: t('landing.feature1Title'), desc: t('landing.feature1Desc') },
    { icon: '📞', title: t('landing.feature2Title'), desc: t('landing.feature2Desc') },
    { icon: '📱', title: t('landing.feature3Title'), desc: t('landing.feature3Desc') },
    { icon: '🔒', title: t('landing.feature4Title'), desc: t('landing.feature4Desc') },
  ];

  const stats = [
    { number: t('landing.stat1'), label: '' },
    { number: t('landing.stat2'), label: '' },
    { number: t('landing.stat3'), label: '' },
    { number: t('landing.stat4'), label: '' },
  ];

  return (
    <div className="full-page" style={{ overflowY: 'auto' }}>
      {/* Hero */}
      <div className="landing-hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-emoji">🌾</div>
          <h1 className="hero-title">RythuConnect</h1>
          <p className="hero-subtitle">{t('landing.heroSubtitle')}</p>
          <p className="hero-desc">{t('landing.heroDesc')}</p>
          <div className="hero-buttons">
            <button className="btn btn-hero-primary" onClick={() => navigate('/register')}>
              🚀 {t('landing.getStarted')}
            </button>
            <button className="btn btn-hero-secondary" onClick={() => navigate('/marketplace')}>
              🛒 {t('landing.browseMarket')}
            </button>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div style={{ background: 'var(--green-primary)', marginTop: -1 }}>
        <svg viewBox="0 0 480 40" fill="var(--bg)" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,20 C120,50 360,-10 480,20 L480,40 L0,40 Z" />
        </svg>
      </div>

      {/* Features */}
      <div className="features-section">
        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>{t('landing.whyTitle')}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <span className="feature-icon">{f.icon}</span>
              <div>
                <h3 style={{ marginBottom: 4 }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-section">
        <h2 style={{ textAlign: 'center' }}>{t('landing.statsTitle')}</h2>
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-number">{s.number}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '32px 20px', textAlign: 'center', background: 'var(--bg)' }}>
        <h2 style={{ marginBottom: 8 }}>Ready to sell your crops?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>
          Join thousands of farmers already using RythuConnect
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/register')} style={{ maxWidth: 280, margin: '0 auto' }}>
          🌾 {t('landing.getStarted')}
        </button>
        <div style={{ marginTop: 16 }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Already registered?{' '}
          </span>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'var(--green-secondary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
            {t('auth.loginBtn')}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '20px', background: 'var(--green-primary)', color: 'white', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>© 2024 RythuConnect. Free for all farmers.</p>
        <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: 4 }}>Your Crops. Your Price. Your Market.</p>
      </div>
    </div>
  );
}
