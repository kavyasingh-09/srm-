import React, { useState } from 'react';
import { ShieldCheck, LogIn, Mail, Lock } from 'lucide-react';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please fill out all login fields!");
      return;
    }

    const isEmailValidSRM = email.toLowerCase().endsWith('@srmist.edu.in');

    const profileData = {
      email,
      name: email.split('@')[0],
      campus: 'Kattankulathur',
      hostel: 'Main Campus',
      verified: isEmailValidSRM,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`
    };

    onLogin(profileData);
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '80vh', 
      padding: '2.5rem 0',
      position: 'relative'
    }}>
      {/* Decorative ambient background glows */}
      <div className="circle-glow" style={{ top: '10%', left: '20%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, transparent 70%)' }}></div>
      <div className="circle-glow" style={{ bottom: '10%', right: '20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255, 199, 44, 0.12) 0%, transparent 70%)' }}></div>

      <div className="glass-panel login-card" style={{ 
        width: '100%', 
        maxWidth: '520px', 
        padding: '3rem', 
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--glass-border)',
        position: 'relative',
        zIndex: 5
      }}>
        
        {/* Banner Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="brand-logo-container" style={{ 
            margin: '0 auto 1.25rem', 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0, 58, 112, 0.25)',
            border: '2.5px solid var(--accent-color)'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '32px', height: '32px' }}>
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
            </svg>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 850, letterSpacing: '-0.75px', color: 'var(--text-primary)' }}>SRM Student Portal</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: '1.4' }}>
            Verify your campus status to access the peer-to-peer student exchange.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* College Email */}
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
              style={{
                borderRadius: '12px',
                padding: '0.8rem 1rem',
                border: '1.5px solid var(--glass-border)',
                background: 'rgba(255, 255, 255, 0.05)',
                transition: 'all 0.2s ease',
                color: 'var(--text-primary)'
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} color="#10b981" /> Ends with <strong>@srmist.edu.in</strong> to receive trust badge
            </span>
          </div>

          {/* Password */}
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
              style={{
                borderRadius: '12px',
                padding: '0.8rem 1rem',
                border: '1.5px solid var(--glass-border)',
                background: 'rgba(255, 255, 255, 0.05)',
                transition: 'all 0.2s ease',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            className="nav-btn nav-btn-primary"
            style={{ 
              width: '100%', 
              padding: '0.9rem', 
              marginTop: '1rem', 
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              borderRadius: '12px',
              fontWeight: 700
            }}
          >
            <LogIn size={18} />
            Log In & Explore
          </button>
        </form>

      </div>
    </div>
  );
}
