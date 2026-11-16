import { useTranslation } from 'react-i18next';
import { TopNav, BottomNav } from '../components/Layout';

export default function Help() {
  const { t } = useTranslation();
  const steps = [t('help.step1sell'), t('help.step2sell'), t('help.step3sell'), t('help.step4sell'), t('help.step5sell')];
  const faqs = [
    { q: 'Is RythuConnect free to use?', a: 'Yes! RythuConnect is completely free. No commission, no subscription fees.' },
    { q: 'Who can use RythuConnect?', a: 'Any farmer or buyer across India can register and use the platform for free.' },
    { q: 'How do I list my crops?', a: 'Go to Sell → Select your crop → Add photos → Set price → Publish. Takes less than 5 minutes!' },
    { q: 'Is my mobile number safe?', a: 'Yes. Your mobile number is only shared with buyers if you choose to enable it in Settings.' },
    { q: 'What languages are supported?', a: 'English, Telugu (తెలుగు), and Hindi (हिन्दी). Choose your language during registration or in Settings.' },
    { q: 'Can I update my crop price?', a: 'Yes! Go to My Listings → Edit your listing anytime.' },
  ];

  return (
    <div className="full-page">
      <TopNav showBack title={t('help.title')} />
      <div className="page-content">
        {/* How to Sell */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16, color: 'var(--green-primary)' }}>🧑‍🌾 {t('help.howToSell')}</h3>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < steps.length - 1 ? 16 : 0, alignItems: 'flex-start' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--green-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                {i + 1}
              </div>
              <p style={{ fontSize: '0.9rem', paddingTop: 4, lineHeight: 1.5 }}>{s}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>📞 {t('help.contact')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href="tel:+918001234567" className="btn btn-outline" style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              📞 {t('help.callSupport')}: 1800-123-4567
            </a>
            <a href="https://wa.me/918001234567" className="btn btn-secondary" style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              💬 {t('help.whatsapp')}
            </a>
          </div>
        </div>

        {/* FAQ */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>❓ {t('help.faq')}</h3>
          {faqs.map((faq, i) => (
            <details key={i} style={{ marginBottom: 12, borderBottom: i < faqs.length - 1 ? '1px solid var(--border)' : 'none', paddingBottom: 12 }}>
              <summary style={{ fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-main)' }}>{faq.q}</summary>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 8, lineHeight: 1.6 }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
