import React, { useState, useEffect } from 'react';
import {
  X, MapPin, Mail, MessageCircle, ShieldCheck, Calendar,
  Lock, Unlock, Building2, Send, Instagram, Phone, Heart
} from 'lucide-react';

export default function ProductDetailModal({ product, onClose, onVerifyUserSimulation, onOpenChat, userProfile, onShowInterest }) {
  if (!product) return null;

  const [contactRevealed, setContactRevealed] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [interestShown, setInterestShown] = useState(false);

  // Reset lock state when switching between products
  useEffect(() => {
    setContactRevealed(false);
    setIsRequesting(false);
    setInterestShown(false);
  }, [product.id]);

  const handleRequestContact = () => {
    setIsRequesting(true);
    setTimeout(() => {
      setIsRequesting(false);
      setContactRevealed(true);
    }, 1200);
  };

  const handleShowInterest = () => {
    if (userProfile && onShowInterest) {
      onShowInterest(product.id, product.title, userProfile.name);
      setInterestShown(true);
      setTimeout(() => setInterestShown(false), 2000);
    }
  };

  // Contact message builders
  const meetupText = product.meetupHotspot ? ` at the preferred meetup spot: ${product.meetupHotspot}` : '';
  const whatsappText = encodeURIComponent(
    `Hi ${product.seller.name}, I saw your listing for "${product.title}" (₹${product.price}) on the SRM Campus Marketplace and I am interested. Is it still available? Can we meet${meetupText}?`
  );
  const whatsappUrl = `https://wa.me/${product.seller.phone.replace(/[^0-9]/g, '')}?text=${whatsappText}`;

  const telegramText = encodeURIComponent(
    `Hi ${product.seller.name}, I'm interested in "${product.title}" listed on SRM Campus Marketplace for ₹${product.price}. Is it still available?`
  );
  const telegramUrl = `https://t.me/share/url?url=https://srm-campus-marketplace.vercel.app&text=${telegramText}`;

  const instagramDmText = `@${product.seller.name.replace(/\s+/, '').toLowerCase()} Hey! I'm interested in your "${product.title}" listing on SRM Campus Marketplace.`;
  const emailSubject = encodeURIComponent(`SRM Marketplace: Interest in ${product.title}`);
  const emailBody = encodeURIComponent(
    `Hello ${product.seller.name},\n\nI am interested in your item "${product.title}" listed for ₹${product.price} on the SRM Campus Marketplace.\n\nCould you please let me know if we can meet${meetupText} to inspect it?\n\nBest regards.`
  );
  const mailtoUrl = `mailto:${product.seller.email}?subject=${emailSubject}&body=${emailBody}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '880px', borderRadius: '24px' }}>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          .spinner-icon { animation: spin 1s linear infinite; }

          .social-btn {
            display: flex; 
            align-items: center; 
            gap: 0.5rem;
            padding: 0.7rem 1.2rem; 
            border-radius: 12px; 
            border: none;
            font-size: 0.85rem; 
            font-weight: 700; 
            cursor: pointer;
            text-decoration: none; 
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            flex: 1; 
            justify-content: center;
            box-shadow: var(--shadow-sm);
          }
          .social-btn:hover { 
            transform: translateY(-2px); 
            filter: brightness(1.08); 
            box-shadow: var(--shadow-md);
          }
          .social-btn:active {
            transform: scale(0.96) translateY(0);
          }
        `}</style>

        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 850, letterSpacing: '-0.5px', margin: 0 }}>Item Details</h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              onClick={handleShowInterest}
              style={{
                borderRadius: '50%',
                padding: '0.4rem',
                border: '1px solid var(--glass-border)',
                background: interestShown ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                cursor: userProfile ? 'pointer' : 'not-allowed',
                color: interestShown ? '#ef4444' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                opacity: userProfile ? 1 : 0.5
              }}
              title={userProfile ? 'Show Interest' : 'Login to show interest'}
              disabled={!userProfile}
            >
              <Heart size={20} fill={interestShown ? 'currentColor' : 'none'} />
            </button>
            <button className="modal-close-btn" onClick={onClose} style={{ borderRadius: '50%', padding: '0.4rem' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '1.5rem 0 0' }}>
          <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>

            {/* LEFT — Image + Payments */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="detail-img-box" style={{ 
                height: '280px', 
                borderRadius: '18px', 
                overflow: 'hidden', 
                border: '1.5px solid var(--glass-border)',
                boxShadow: 'var(--shadow-md)',
                position: 'relative'
              }}>
                <img src={product.image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                
                {/* Floating tags */}
                <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.4rem', zIndex: 10 }}>
                  <span className={`listing-badge badge-${product.tradeType.toLowerCase()}`} style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}>
                    {product.tradeType === 'Sell' ? 'For Sale' : product.tradeType === 'Rent' ? 'Rent' : 'Free'}
                  </span>
                </div>
                
                <span style={{ 
                  position: 'absolute', 
                  bottom: '0.75rem', 
                  right: '0.75rem', 
                  background: 'rgba(15, 23, 42, 0.75)', 
                  color: 'white', 
                  padding: '0.3rem 0.6rem', 
                  borderRadius: '6px', 
                  fontSize: '0.75rem', 
                  fontWeight: 700,
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  Condition: {product.condition}
                </span>
              </div>
              {product.category === 'CT Test Papers' && product.fileUrl && (
                <div className="glass-panel" style={{ borderRadius: '16px', padding: '1rem', border: '1px solid var(--glass-border)', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>CT Test Paper</h4>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700 }}>{product.fileName || 'Download Paper'}</p>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-light)' }}>Uploaded by the seller for direct download.</p>
                    </div>
                    <a
                      href={product.fileUrl}
                      download={product.fileName || 'ct-test-paper'}
                      className="nav-btn nav-btn-primary"
                      style={{ borderRadius: '12px', padding: '0.8rem 1rem' }}
                    >
                      Download
                    </a>
                  </div>
                </div>
              )}

              <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.25rem', border: '1px solid var(--glass-border)' }}>
                <h4 style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: 'var(--text-secondary)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <Calendar size={14} /> Meetup Payment
                </h4>

                <div style={{
                  padding: '0.95rem 1rem',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.18)',
                  color: 'var(--text-primary)',
                  lineHeight: '1.5'
                }}>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.25rem' }}>
                    Pay only when you meet
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Meet the seller in person, inspect the item, and complete payment on the spot after both sides agree.
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — Info Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span className="listing-category" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)', letterSpacing: '0.5px' }}>
                  {product.category}
                </span>
                {product.courseCode && (
                  <span style={{
                    background: 'rgba(99,102,241,0.12)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    borderRadius: '8px', 
                    padding: '3px 8px',
                    fontSize: '0.75rem', 
                    color: '#8b5cf6', 
                    fontWeight: 800
                  }}>
                    📚 {product.courseCode}
                  </span>
                )}
              </div>

              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 850, letterSpacing: '-0.75px', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: '1.25' }}>
                  {product.title}
                </h2>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: product.price === 0 ? '#10b981' : 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                    {product.price === 0 ? 'FREE' : `₹${product.price}`}
                  </span>
                  {product.tradeType === 'Rent' && (
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>/ month</span>
                  )}
                </div>
              </div>

              {/* Location Card */}
              <div className="glass-panel" style={{ 
                padding: '0.9rem 1.1rem', 
                borderRadius: '14px', 
                border: '1.5px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  <MapPin size={16} style={{ color: 'var(--primary-color)' }} />
                  <span>SRM {product.campus} campus</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <Building2 size={14} />
                  <span>Block: <strong>{product.hostel || 'Main Campus'}</strong></span>
                </div>
                {product.meetupHotspot && (
                  <div style={{
                    fontSize: '0.8rem', 
                    color: 'var(--primary-color)',
                    background: 'rgba(59, 130, 246, 0.08)', 
                    padding: '6px 12px',
                    borderRadius: '8px', 
                    fontWeight: 700, 
                    marginTop: '0.25rem',
                    alignSelf: 'flex-start',
                    border: '1px solid rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    📍 Preferred Spot: {product.meetupHotspot.split(' (')[0]}
                  </div>
                )}
              </div>

              {/* Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <h5 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-light)', letterSpacing: '0.5px' }}>
                  Description
                </h5>
                <p style={{ 
                  fontSize: '0.92rem', 
                  color: 'var(--text-secondary)', 
                  lineHeight: '1.6', 
                  margin: 0,
                  whiteSpace: 'pre-line' 
                }}>
                  {product.description}
                </p>
              </div>

              {/* Seller details panel */}
              <div className="glass-panel" style={{ 
                borderRadius: '16px', 
                padding: '1.25rem', 
                border: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <h5 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-light)', letterSpacing: '0.5px', margin: 0 }}>
                  Seller Information
                </h5>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img 
                    src={product.seller.avatar} 
                    alt={product.seller.name} 
                    style={{ width: '46px', height: '46px', borderRadius: '50%', border: '2px solid var(--accent-color)' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{product.seller.name}</span>
                    {product.seller.verified ? (
                      <span style={{ 
                        fontSize: '0.72rem', 
                        color: '#10b981', 
                        fontWeight: 700, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '3px',
                        background: 'rgba(16, 185, 129, 0.08)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        width: 'fit-content'
                      }}>
                        <ShieldCheck size={12} fill="currentColor" color="white" />
                        Verified SRM Student
                      </span>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Student Account</span>
                        <button
                          onClick={() => onVerifyUserSimulation(product.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.72rem', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                        >
                          Verify
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {contactRevealed && (
                  <div style={{ 
                    borderTop: '1px solid var(--glass-border)', 
                    paddingTop: '0.75rem', 
                    fontSize: '0.85rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.5rem' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                      <Mail size={14} style={{ color: 'var(--primary-color)' }} />
                      <span>{product.seller.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                      <Phone size={14} style={{ color: 'var(--primary-color)' }} />
                      <span>{product.seller.phone}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── CONTACT / SOCIAL SECTION ── */}
              <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                {contactRevealed ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.08)', 
                      border: '1px solid rgba(16, 185, 129, 0.15)',
                      padding: '0.6rem', 
                      borderRadius: '8px', 
                      color: '#10b981',
                      fontSize: '0.8rem', 
                      fontWeight: 700, 
                      textAlign: 'center',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '0.35rem'
                    }}>
                      <Unlock size={14} />
                      <span>Access Granted! Seller contact revealed.</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {/* WhatsApp */}
                      <a
                        href={whatsappUrl}
                        target="_blank" rel="noopener noreferrer"
                        className="social-btn"
                        style={{ background: '#25D366', color: '#fff' }}
                        title="Chat on WhatsApp"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp
                      </a>

                      {/* Telegram */}
                      <a
                        href={telegramUrl}
                        target="_blank" rel="noopener noreferrer"
                        className="social-btn"
                        style={{ background: '#229ED9', color: '#fff' }}
                        title="Message on Telegram"
                      >
                        <Send size={16} />
                        Telegram
                      </a>

                      {/* Instagram */}
                      <button
                        className="social-btn"
                        style={{
                          background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
                          color: '#fff'
                        }}
                        onClick={() => {
                          navigator.clipboard.writeText(instagramDmText);
                          alert('📋 Template message copied! Send it in their DMs.');
                        }}
                        title="Copy Instagram DM template"
                      >
                        <Instagram size={16} />
                        Instagram
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <a
                        href={mailtoUrl}
                        className="social-btn"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)', border: '1.5px solid var(--glass-border)' }}
                      >
                        <Mail size={16} />
                        SRM Email
                      </a>
                      <button
                        onClick={() => { onClose(); onOpenChat && onOpenChat(product); }}
                        className="social-btn"
                        style={{
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          color: '#fff',
                          cursor: 'pointer'
                        }}
                        title="Start Secure E2EE Chat"
                      >
                        <MessageCircle size={16} />
                        In-App Chat
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel" style={{
                    border: '1.5px dashed var(--glass-border)',
                    padding: '1.25rem 1.5rem', 
                    borderRadius: '16px',
                    textAlign: 'center', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    background: 'rgba(0, 58, 112, 0.02)'
                  }}>
                    <Lock size={20} style={{ color: 'var(--primary-color)', filter: 'drop-shadow(0 2px 8px rgba(59, 130, 246, 0.2))' }} />
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Contact Details Protected</h5>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.45', margin: 0 }}>
                      Unlock to access instant chat icons for WhatsApp, Telegram, Instagram, and official college mail.
                    </p>
                    
                    <button
                      className="nav-btn nav-btn-primary"
                      onClick={handleRequestContact}
                      disabled={isRequesting}
                      style={{ 
                        width: '100%', 
                        justifyContent: 'center', 
                        marginTop: '0.5rem',
                        padding: '0.7rem',
                        borderRadius: '10px',
                        fontWeight: 700
                      }}
                    >
                      {isRequesting ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <svg className="spinner-icon" style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style={{ opacity: 0.75 }} />
                          </svg>
                          Unlocking...
                        </div>
                      ) : (
                        '🔓 Unlock Seller Contact Info'
                      )}
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
