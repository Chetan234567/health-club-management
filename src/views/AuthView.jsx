/*
 * File Path: src/views/AuthView.jsx
 * Description: Authentication interface component supporting Role Selection (Admin, Member, Trainer), Login, Signup, and Password Reset.
 * Parameters / Props: role, mode, onLogin, onSignup, onEmailCheck, onPasswordReset, onSwitchMode, onSwitchRole.
 * Backend Integration: Submits user auth requests via Axios to /api/auth/login, /api/auth/register, and /api/auth/reset-password.
 */
import { Activity, KeyRound, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { roleMeta } from '../models/clubData.js';

const roleIcons = { admin: ShieldCheck, member: Users, trainer: Activity };

export default function AuthView({ role, mode, onLogin, onSignup, onEmailCheck, onPasswordReset, onSwitchMode, onSwitchRole }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    specialty: '',
    experience: '',
    certifications: '',
    goal: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    otp: '',
    newPassword: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotStep, setForgotStep] = useState('login');
  const [otpCode, setOtpCode] = useState('');
  const meta = roleMeta[role];
  const isSignup = mode === 'signup';
  const isForgot = !isSignup && forgotStep !== 'login';

  useEffect(() => {
    setForgotStep('login');
    setMessage('');
  }, [role, mode]);

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      if (isSignup) {
        if (form.password !== form.confirmPassword) {
          setMessage('Password and confirm password must match.');
          setLoading(false);
          return;
        }
        const result = await onSignup({ ...form, role });
        setMessage(result.message);
        if (result.ok) onSwitchMode('login');
        setLoading(false);
        return;
      }

      const res = await onLogin({ role, email: form.email, password: form.password });
      if (!res || !res.ok) {
        setMessage(res?.message || 'Invalid login details for selected role.');
      }
    } catch (err) {
      setMessage('Authentication failed. Check your network or credentials.');
    } finally {
      setLoading(false);
    }
  };

  const startForgotPassword = () => {
    setMessage('');
    if (!form.email) {
      setMessage('Enter your registered email first.');
      return;
    }
    if (!onEmailCheck({ role, email: form.email })) {
      setMessage('Email is not registered for selected role.');
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setOtpCode(code);
    setForgotStep('otp');
    setMessage(`Demo OTP sent to email: ${code}`);
  };

  const changePassword = async () => {
    setMessage('');
    if (form.otp !== otpCode) {
      setMessage('Invalid OTP. Please check the code and try again.');
      return;
    }
    if (!form.newPassword || form.newPassword.length < 4) {
      setMessage('Enter a new password with at least 4 characters.');
      return;
    }
    setLoading(true);
    const changed = await onPasswordReset({ role, email: form.email, password: form.newPassword });
    setLoading(false);
    setMessage(changed ? 'Password updated successfully. Login with new password.' : 'Unable to update password.');
    if (changed) {
      setForm({ ...form, password: '', otp: '', newPassword: '' });
      setForgotStep('login');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4 sm:p-6">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-700">Health Club Management System</p>
          <h1 className="mt-1 text-2xl font-black text-ink-900 sm:text-3xl">Portal Sign In</h1>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-200/70 p-1.5">
          {Object.keys(roleMeta).map((itemRole) => {
            const Icon = roleIcons[itemRole];
            const active = role === itemRole;
            return (
              <button
                key={itemRole}
                type="button"
                onClick={() => onSwitchRole(itemRole)}
                className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition ${
                  active ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-ink-900'
                }`}
              >
                <Icon size={16} />
                <span>{roleMeta[itemRole].label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Auth Form Card */}
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel sm:p-8">
          <p className="text-xs font-bold uppercase text-teal-700">{meta.label} Portal</p>
          <h2 className="mt-1 text-2xl font-black text-ink-900">{isSignup ? 'Create Account' : isForgot ? 'Forgot Password' : 'Login'}</h2>

          <div className="mt-5 space-y-3">
            {isSignup && (
              <>
                <input className="field" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <input className="field" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                {role === 'trainer' && (
                  <>
                    <input className="field" placeholder="Specialty (e.g. HIIT & Fat Loss)" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
                    <input className="field" placeholder="Experience (e.g. 5+ Years)" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
                    <input className="field" placeholder="Certifications (e.g. ACE CPT)" value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} />
                  </>
                )}
                {role === 'member' && (
                  <>
                    <input className="field" placeholder="Fitness Goal (e.g. Weight Loss & Fitness)" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} />
                    <div className="grid grid-cols-2 gap-2">
                      <select className="field text-slate-700" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <input className="field text-slate-700" type="date" placeholder="Date of Birth" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                    </div>
                    <input className="field" placeholder="Residential Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                    <input className="field" placeholder="Emergency Contact Number" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
                  </>
                )}
              </>
            )}
            <input className="field" type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            {!isForgot && <input className="field" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />}
            {isSignup && <input className="field" type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />}
            {forgotStep === 'otp' && (
              <>
                <input className="field" placeholder="Enter OTP" value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} />
                <input className="field" type="password" placeholder="New password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
              </>
            )}
          </div>

          {message && <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 border border-amber-200">{message}</p>}

          {forgotStep === 'login' && (
            <button type="submit" className="btn-primary mt-5 w-full" disabled={loading}>
              <UserPlus size={16} /> {loading ? 'Processing...' : isSignup ? `Signup as ${meta.label}` : `Login as ${meta.label}`}
            </button>
          )}
          {forgotStep === 'otp' && (
            <button type="button" className="btn-primary mt-5 w-full" onClick={changePassword} disabled={loading}>
              <KeyRound size={16} /> {loading ? 'Updating...' : 'Change Password'}
            </button>
          )}
          {!isSignup && forgotStep === 'login' && (
            <button type="button" className="mt-3 w-full text-xs font-bold text-coral-600 hover:underline" onClick={startForgotPassword}>
              Forgot password? Send OTP on email
            </button>
          )}
          {!isSignup && forgotStep === 'otp' && (
            <button type="button" className="mt-3 w-full text-xs font-bold text-teal-700 hover:underline" onClick={() => { setForgotStep('login'); setMessage(''); }}>
              Back to login
            </button>
          )}
          <button type="button" className="mt-3 w-full text-xs font-bold text-teal-700 hover:underline" onClick={() => onSwitchMode(isSignup ? 'login' : 'signup')}>
            {isSignup ? 'Already have an account? Login' : 'New user? Create a signup account'}
          </button>

          <div className="mt-5 rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-500 text-center border border-slate-100">
            Demo Login: <b>{role}@healthclub.com</b> / <b>password</b>
          </div>
        </form>
      </div>
    </main>
  );
}
