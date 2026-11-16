import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0=mobile, 1=otp, 2=newpw
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  const sendOtp = async () => {
    if (!/^\d{10}$/.test(mobile)) { toast.error(t('common.invalidMobile')); return; }
    setLoading(true);
    try {
      await authAPI.forgotPassword(mobile);
      toast.success('OTP sent!');
      setStep(1);
    } catch (err) { toast.error(err.response?.data?.error || t('common.error')); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) { toast.error('Enter valid 6-digit OTP'); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.verifyOtp(mobile, otp, 'reset');
      setToken(data.reset_token || '');
      setStep(2);
    } catch (err) { toast.error('Invalid OTP'); }
    finally { setLoading(false); }
  };

  const resetPassword = async () => {
    if (newPw.length < 8) { toast.error(t('common.minPassword')); return; }
    if (newPw !== confirmPw) { toast.error(t('auth.passwordMismatch')); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword({ mobile, otp, new_password: newPw, reset_token: token });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) { toast.error(err.response?.data?.error || t('common.error')); }
    finally { setLoading(false); }
  };

  return (
    <div className="full-page" style={{ justifyContent: 'center', padding: '32px 20px', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔐</div>
        <h2>{t('auth.forgotPassword')}</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: '0.875rem' }}>
          {step === 0 ? 'Enter your mobile number to reset password' :
           step === 1 ? `OTP sent to +91 ${mobile}` :
           'Enter your new password'}
        </p>
      </div>

      <div className="card">
        {step === 0 && (
          <>
            <div className="form-group">
              <label className="form-label">{t('auth.mobile')}</label>
              <input className="form-input" type="tel" placeholder={t('auth.enterMobile')} maxLength={10} inputMode="numeric"
                value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/,''))} />
            </div>
            <button className="btn btn-primary" onClick={sendOtp} disabled={loading}>
              {loading ? '⏳' : '📱'} {t('auth.sendOtp')}
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <div className="form-group">
              <label className="form-label">{t('auth.otp')}</label>
              <input className="form-input" type="tel" placeholder={t('auth.enterOtp')} maxLength={6} inputMode="numeric"
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/,''))}
                style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '0.5em' }} />
            </div>
            <button className="btn btn-primary" onClick={verifyOtp} disabled={loading}>
              {loading ? '⏳' : '✓'} {t('auth.verifyOtp')}
            </button>
            <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={sendOtp}>{t('auth.resendOtp')}</button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="form-group">
              <label className="form-label">{t('settings.newPassword')}</label>
              <input className="form-input" type="password" placeholder={t('auth.enterPassword')}
                value={newPw} onChange={e => setNewPw(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('settings.confirmNewPassword')}</label>
              <input className="form-input" type="password" placeholder={t('auth.enterConfirmPassword')}
                value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={resetPassword} disabled={loading}>
              {loading ? '⏳' : '🔐'} Reset Password
            </button>
          </>
        )}
      </div>

      <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'var(--green-secondary)', cursor: 'pointer', marginTop: 20, fontWeight: 600 }}>
        ← Back to Login
      </button>
    </div>
  );
}
