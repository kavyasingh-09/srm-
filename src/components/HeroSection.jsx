import React from 'react';
import { ArrowRight, ShieldCheck, Tag, Sparkles, BadgeCheck } from 'lucide-react';

export default function HeroSection({ setCurrentView, onOpenSellModal }) {
  return (
    <div className="hero-banner">
      <div className="hero-text">
        <div className="hero-badge">SRM IST STUDENT MARKETPLACE</div>
        <h2>
          Buy, sell, or find things <br />
          <span>without leaving campus.</span>
        </h2>
        <p>
          Trade textbooks, notes, electronics, hostel essentials, and lost items in one place.
          Clean, fast, and built for SRM students.
        </p>

        <div className="hero-feature-strip">
          <div className="hero-feature-chip">
            <Sparkles size={14} />
            Fresh student listings
          </div>
          <div className="hero-feature-chip">
            <BadgeCheck size={14} />
            SRM email trust badge
          </div>
          <div className="hero-feature-chip">
            <ShieldCheck size={14} />
            Safe campus handover
          </div>
        </div>

        <div className="hero-cta">
          <button
            className="nav-btn nav-btn-primary"
            onClick={() => setCurrentView('browse')}
            style={{ padding: '0.8rem 1.6rem', fontSize: '1rem' }}
          >
            Browse Listings
            <ArrowRight size={18} />
          </button>

          <button
            className="nav-btn nav-btn-secondary"
            onClick={onOpenSellModal}
            style={{ padding: '0.8rem 1.6rem', fontSize: '1rem' }}
          >
            List an Item
          </button>
        </div>
      </div>

      <div className="hero-graphics">
        <div className="circle-glow"></div>
        <div className="glass-card-mockup">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="listing-badge badge-sell">FOR SALE</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 850, color: 'var(--accent-color)' }}>₹850</span>
          </div>

          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.25rem', marginTop: '1.25rem', color: 'var(--text-primary)' }}>
              Casio fx-991EX
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Electronics • KTR Campus</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=mockup-seller"
                alt="SRM Senior"
                style={{ width: '22px', height: '22px', borderRadius: '50%' }}
              />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SRM Senior</span>
            </div>
            <span className="seller-verified-tag" style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(22, 163, 74, 0.1)', color: '#10b981', fontWeight: 700 }}>
              ✓ Verified
            </span>
          </div>
        </div>

        <div className="hero-mini-panel">
          <div className="hero-mini-title">Today on campus</div>
          <div className="hero-mini-line">Clean listings, verified students, and safe handovers.</div>
        </div>
      </div>
    </div>
  );
}
