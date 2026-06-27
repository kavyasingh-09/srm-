import React, { useState, useEffect } from 'react';
import { ShieldCheck, LogIn, UserPlus, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import { srmCampuses, srmHostels } from '../data/mockData';
import { api, setToken } from '../api/client';

export default function AuthScreen({ onLogin, onBrowse }) {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [campus, setCampus] = useState(srmCampuses[0]);
  const [hostel, setHostel] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('male');

  useEffect(() => {
    if (campus === 'Kattankulathur' && srmHostels.Kattankulathur) {
      setHostel(srmHostels.Kattankulathur.boys[0]);
    } else if (srmHostels[campus]) {
      const group = srmHostels[campus].boys || srmHostels[campus];
      setHostel(group[0] || '');
    } else {
      setHostel('');
    }
  }, [campus]);

  const hostelOptions = () => {
    if (!srmHostels[campus]) return [];
    const { boys = [], girls = [] } = srmHostels[campus];
    return [...boys, ...girls];
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill out all login fields.');
      return;
    }

    setLoading(true);
    try {
      const { user, token } = await api.login({ email, password });
      setToken(token);
      onLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !name || !campus) {
      setError('Please fill out all required signup fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { user, token } = await api.signup({
        email,
        password,
        name,
        campus,
        hostel,
        phone: phone || undefined,
        gender,
      });
      setToken(token);
      onLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    borderRadius: '12px',
    padding: '0.8rem 1rem',
    border: '1.5px solid var(--glass-border)',
    background: 'rgba(255, 255, 255, 0.05)',
    transition: 'all 0.2s ease',
    color: 'var(--text-primary)',
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
      padding: '2.5rem 0',
      position: 'relative',
    }}>
      <div className="circle-glow" style={{ top: '10%', left: '20%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, transparent 70%)' }} />
      <div className="circle-glow" style={{ bottom: '10%', right: '20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255, 199, 44, 0.12) 0%, transparent 70%)' }} />

      <div className="glass-panel login-card" style={{
        width: '100%',
        maxWidth: mode === 'signup' ? '560px' : '520px',
        padding: '3rem',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--glass-border)',
        position: 'relative',
        zIndex: 5,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="brand-logo-container" style={{
            margin: '0 auto 1.25rem',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0, 58, 112, 0.25)',
            border: '2.5px solid var(--accent-color)',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '32px', height: '32px' }}>
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
            </svg>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 850, letterSpacing: '-0.75px', color: 'var(--text-primary)' }}>
            SRM Student Portal
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: '1.4' }}>
            {mode === 'login'
              ? 'Sign in to post items, save favorites, and manage your account. Browsing is open to everyone.'
              : 'Create your account with your official SRM email.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.04)', padding: '0.35rem', borderRadius: '12px' }}>
          <button
            type="button"
            className={`cat-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Log In
          </button>
          <button
            type="button"
            className={`cat-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            color: '#f43f5e',
            fontSize: '0.85rem',
          }}>
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                <Mail size={14} /> SRM Official Email *
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g., vs1234@srmist.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} color="#10b981" /> Use your <strong>@srmist.edu.in</strong> email
              </span>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                <Lock size={14} /> Password *
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              className="nav-btn nav-btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '0.9rem', marginTop: '0.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '12px', fontWeight: 700 }}
            >
              <LogIn size={18} />
              {loading ? 'Signing in…' : 'Log In & Explore'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                <User size={14} /> Full Name *
              </label>
              <input type="text" className="form-control" placeholder="e.g., Amit Kumar" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.6rem', display: 'block', color: 'var(--text-secondary)' }}>Gender *</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {['male', 'female'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      borderRadius: '10px',
                      border: gender === g ? '2px solid var(--primary-color)' : '1.5px solid var(--glass-border)',
                      background: gender === g ? 'rgba(0,58,112,0.12)' : 'rgba(255,255,255,0.05)',
                      color: gender === g ? 'var(--primary-color)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    {g === 'male' ? '👨' : '👩'} {g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                <Mail size={14} /> SRM Official Email *
              </label>
              <input type="email" className="form-control" placeholder="e.g., vs1234@srmist.edu.in" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block', color: 'var(--text-secondary)' }}>
                  <Lock size={14} style={{ display: 'inline', marginRight: 4 }} /> Password *
                </label>
                <input type="password" className="form-control" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={inputStyle} />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block', color: 'var(--text-secondary)' }}>
                  Confirm Password *
                </label>
                <input type="password" className="form-control" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={14} /> Campus *
                </label>
                <select className="form-control" value={campus} onChange={(e) => setCampus(e.target.value)} required style={inputStyle}>
                  {srmCampuses.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block', color: 'var(--text-secondary)' }}>Hostel</label>
                <select className="form-control" value={hostel} onChange={(e) => setHostel(e.target.value)} style={inputStyle}>
                  {hostelOptions().map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                <Phone size={14} /> Phone (optional)
              </label>
              <input type="tel" className="form-control" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
            </div>

            <button
              type="submit"
              className="nav-btn nav-btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '0.9rem', marginTop: '0.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '12px', fontWeight: 700 }}
            >
              <UserPlus size={18} />
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
