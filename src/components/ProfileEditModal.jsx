import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, MapPin, Home, Users } from 'lucide-react';
import { srmCampuses, srmHostels } from '../data/mockData';

export default function ProfileEditModal({ userProfile, onSave, onClose }) {
  const [name, setName] = useState(userProfile?.name || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [campus, setCampus] = useState(userProfile?.campus || srmCampuses[0]);
  const [hostel, setHostel] = useState(userProfile?.hostel || '');
  const [gender, setGender] = useState(userProfile?.gender || 'male');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Update hostel list when campus changes
  useEffect(() => {
    if (srmHostels[campus]) {
      const opts = hostelOptions(campus);
      if (!opts.includes(hostel)) setHostel(opts[0] || '');
    }
  }, [campus]);

  function hostelOptions(c) {
    const map = srmHostels[c || campus];
    if (!map) return ['Day Scholar'];
    const boys = map.boys || [];
    const girls = map.girls || [];
    const all = map.all || [...boys, ...girls];
    return [...(all.length ? all : [...boys, ...girls]), 'Day Scholar'];
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Name is required.'); return; }
    if (!campus) { setError('Campus is required.'); return; }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), phone, campus, hostel, gender });
    } catch (err) {
      setError(err.message || 'Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.7rem 1rem',
    borderRadius: '10px',
    border: '1.5px solid var(--glass-border)',
    background: 'var(--card-bg)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  return (
    /* Overlay */
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Modal card */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--card-bg)',
          border: '1.5px solid var(--glass-border)',
          borderRadius: '24px',
          padding: '2rem',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Edit Profile
            </h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Update your details below and save.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)',
              borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer',
              color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Avatar preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem', padding: '1rem', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)' }}>
          <img
            src={userProfile?.avatar || (gender === 'female'
              ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=srm-f1&clothing[]=blazerAndSweater&top[]=curly&skinColor[]=ffdbb4&hairColor[]=2c1b18'
              : 'https://api.dicebear.com/7.x/avataaars/svg?seed=srm-m1&clothing[]=blazerAndShirt&facialHairProbability=0&skinColor[]=ffdbb4&hairColor[]=2c1b18'
            )}
            alt="avatar"
            style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid var(--primary-color)' }}
          />
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{name || userProfile?.name}</p>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{userProfile?.email}</p>
          </div>
        </div>

        {error && (
          <div style={{
            marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '10px',
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)',
            color: '#f43f5e', fontSize: '0.85rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Full Name */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
              <User size={13} /> Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Kavya Singh"
              required
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary-color)'}
              onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
            />
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
              <Phone size={13} /> Phone (optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary-color)'}
              onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
            />
          </div>

          {/* Gender */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
              <Users size={13} /> Gender
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {['male', 'female'].map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  style={{
                    flex: 1, padding: '0.65rem', borderRadius: '10px', cursor: 'pointer',
                    border: gender === g ? '2px solid var(--primary-color)' : '1.5px solid var(--glass-border)',
                    background: gender === g ? 'rgba(0,58,112,0.12)' : 'rgba(255,255,255,0.04)',
                    color: gender === g ? 'var(--primary-color)' : 'var(--text-secondary)',
                    fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  }}
                >
                  {g === 'male' ? '👨' : '👩'} {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
            {gender !== (userProfile?.gender || 'male') && (
              <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                ℹ️ Changing gender will also update your default avatar style.
              </p>
            )}
          </div>

          {/* Campus + Hostel */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                <MapPin size={13} /> Campus *
              </label>
              <select
                value={campus}
                onChange={e => setCampus(e.target.value)}
                required
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={e => e.target.style.borderColor = 'var(--primary-color)'}
                onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
              >
                {srmCampuses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                <Home size={13} /> Hostel
              </label>
              <select
                value={hostel}
                onChange={e => setHostel(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={e => e.target.style.borderColor = 'var(--primary-color)'}
                onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
              >
                {hostelOptions(campus).map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label style={{ fontWeight: 600, fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '0.45rem', display: 'block' }}>
              SRM Email (cannot change)
            </label>
            <input
              type="email"
              value={userProfile?.email || ''}
              readOnly
              style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '0.85rem', borderRadius: '12px', fontWeight: 700,
                border: '1.5px solid var(--glass-border)', background: 'transparent',
                color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 2, padding: '0.85rem', borderRadius: '12px', fontWeight: 700,
                border: 'none', background: 'var(--primary-color)', color: 'white',
                cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                opacity: saving ? 0.7 : 1, transition: 'all 0.2s',
                boxShadow: '0 4px 18px rgba(0,58,112,0.3)',
              }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Save size={16} />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
