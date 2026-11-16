import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const CROP_EMOJIS = {
  cotton: '🌿', paddy: '🌾', mirchi: '🌶️', maize: '🌽',
  turmeric: '🟡', groundnut: '🥜', other: '🌱',
};

export function CropCard({ crop, onClick }) {
  const { t } = useTranslation();
  const primaryImg = crop.images?.find(i => i.is_primary) || crop.images?.[0];
  const emoji = CROP_EMOJIS[crop.category] || '🌿';

  const unitLabel = {
    kg: t('common.perKg'),
    quintal: t('common.perQuintal'),
    tonne: t('common.perTonne'),
  }[crop.quantity_unit] || crop.quantity_unit;

  return (
    <div className="crop-card card-hover" onClick={onClick}>
      {primaryImg ? (
        <img src={primaryImg.image} alt={crop.crop_name} className="crop-card-img" loading="lazy" />
      ) : (
        <div className="crop-card-img-placeholder">{emoji}</div>
      )}
      <div className="crop-card-body">
        <div className="crop-card-name">{crop.crop_name}</div>
        {crop.variety && <div className="crop-card-variety">{crop.variety}</div>}
        <div className="crop-card-price">₹{Number(crop.price_per_unit).toLocaleString('en-IN')} {unitLabel}</div>
        <div className="crop-card-meta">
          <span>📦 {Number(crop.quantity_available).toLocaleString()} {crop.quantity_unit}</span>
          <span>📍 {crop.district}</span>
        </div>
      </div>
      <div className="crop-card-footer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>👤 {crop.farmer_name}</span>
          <span className={`badge-status ${crop.status === 'active' ? 'badge-active' : 'badge-sold'}`}>
            {crop.status === 'active' ? t('crop.active') : t('crop.sold')}
          </span>
        </div>
      </div>
    </div>
  );
}

export function CropCategoryCard({ category, label, emoji, active, onClick }) {
  return (
    <div className={`category-card ${active ? 'active' : ''}`} onClick={onClick}>
      <span style={{ fontSize: '2.2rem' }}>{emoji}</span>
      <span>{label}</span>
    </div>
  );
}

export const CATEGORIES = [
  { key: 'cotton',    emoji: '🌿', aliases: ['cotton', 'పత్తి', 'कपास'] },
  { key: 'paddy',     emoji: '🌾', aliases: ['paddy', 'rice', 'వరి', 'ధాన్యం', 'धान'] },
  { key: 'mirchi',    emoji: '🌶️', aliases: ['mirchi', 'chilli', 'chili', 'మిర్చి', 'मिर्च'] },
  { key: 'maize',     emoji: '🌽', aliases: ['maize', 'corn', 'మొక్కజొన్న', 'मक्का'] },
  { key: 'turmeric',  emoji: '🟡', aliases: ['turmeric', 'haldi', 'పసుపు', 'हल्दी'] },
  { key: 'groundnut', emoji: '🥜', aliases: ['groundnut', 'peanut', 'వేరుశెనగ', 'मूंगफली'] },
  { key: 'other',     emoji: '🌱', aliases: ['other', 'ఇతర', 'अन्य'] },
];

export function LoadingSpinner({ message }) {
  const { t } = useTranslation();
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
      <div className="spinner" />
      <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>{message || t('common.loading')}</p>
    </div>
  );
}

export function EmptyState({ icon, title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon || '📭'}</div>
      {title && <h3 style={{ marginBottom: 8 }}>{title}</h3>}
      {message && <p className="empty-state-text">{message}</p>}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  );
}

export function StepIndicator({ steps, currentStep }) {
  return (
    <div style={{ padding: '0 16px' }}>
      <div className="step-indicator">
        {steps.map((step, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', flex: idx < steps.length - 1 ? 1 : 'none' }}>
            <div className={`step-dot ${idx < currentStep ? 'done' : idx === currentStep ? 'active' : 'pending'}`}>
              {idx < currentStep ? '✓' : idx + 1}
            </div>
            {idx < steps.length - 1 && (
              <div className={`step-line ${idx < currentStep ? 'done' : 'pending'}`} />
            )}
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 8, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
        {steps[currentStep]}
      </div>
    </div>
  );
}

export function LanguageCards({ selected, onChange }) {
  const langs = [
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  ];
  return (
    <div className="lang-cards">
      {langs.map(lang => (
        <div key={lang.code} className={`lang-card ${selected === lang.code ? 'selected' : ''}`} onClick={() => onChange(lang.code)}>
          <span className="lang-flag">{lang.flag}</span>
          <div className="lang-info">
            <div className="lang-name">{lang.native}</div>
            <div className="lang-native">{lang.name}</div>
          </div>
          <div className={`lang-check ${selected === lang.code ? 'checked' : ''}`}>
            {selected === lang.code && '✓'}
          </div>
        </div>
      ))}
    </div>
  );
}

export function VoiceButton({ onResult }) {
  const { t, i18n } = useTranslation();
  const [listening, setListening] = useState(false);


  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition not supported on this browser.');
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    const langMap = { en: 'en-IN', te: 'te-IN', hi: 'hi-IN' };
    rec.lang = langMap[i18n.language] || 'en-IN';
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (e) => {
      const txt = e.results[0][0].transcript;
      onResult && onResult(txt);
    };
    rec.start();
  };

  return (
    <button className={`voice-btn ${listening ? 'listening' : ''}`} onClick={handleVoice} title={t('common.voiceLabel')}>
      {listening ? '🔴' : '🎤'}
    </button>
  );
}
