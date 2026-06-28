import React, { useState } from 'react';
import {
  ShoppingCart, Trash2, MapPin, CheckCircle, ArrowRight,
  ShoppingBag, X, Package, ShieldCheck, MessageCircle, Calendar
} from 'lucide-react';

export default function CartPage({ cartItems = [], onRemoveFromCart, onClearCart, onViewProduct, onOpenChat }) {
  const [step, setStep] = useState('cart'); // cart | success
  const [orders, setOrders] = useState([]);

  const total = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const freeItems = cartItems.filter((i) => i.price === 0);

  const handleConfirmMeetup = () => {
    const meetupOrders = cartItems.map((item) => ({
      ...item,
      orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      orderedAt: new Date().toLocaleString('en-IN')
    }));

    setOrders(meetupOrders);
    setStep('success');
    onClearCart();
  };

  const renderStepper = (currentStep) => {
    const steps = [
      { id: 'cart', label: 'My Cart' },
      { id: 'success', label: 'Confirmation' }
    ];

    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 2.5rem', maxWidth: '420px', width: '100%', position: 'relative' }}>
        <div style={{ position: 'absolute', height: '2px', background: 'var(--glass-border)', left: '18%', right: '18%', zIndex: 1 }} />
        {steps.map((s, i) => {
          const isActive = currentStep === s.id;
          const isDone = currentStep === 'success' && s.id === 'cart';
          return (
            <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 2, position: 'relative' }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: isActive ? 'var(--primary-color)' : isDone ? '#10b981' : 'var(--card-bg)',
                border: `2.5px solid ${isActive ? 'var(--accent-color)' : isDone ? '#10b981' : 'var(--glass-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive || isDone ? 'white' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: isActive ? 'var(--glow-shadow)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {isDone ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: isActive || isDone ? 700 : 500,
                color: isActive ? 'var(--text-primary)' : isDone ? '#10b981' : 'var(--text-light)',
                marginTop: '0.4rem'
              }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (step === 'success') {
    return (
      <div style={{ maxWidth: 760, margin: '2rem auto', padding: '0 1rem' }}>
        {renderStepper('success')}

        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '1rem', animation: 'float 5s ease-in-out infinite' }}>🎉</div>

          <h2 style={{ fontSize: '2rem', fontWeight: 850, letterSpacing: '-0.75px', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Meetup Confirmed
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '540px', margin: '0 auto 2.5rem', lineHeight: '1.5' }}>
            Your order is ready. Meet the seller in person, inspect the item, and complete payment only when both sides are present and happy.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', marginBottom: '2.5rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-light)', letterSpacing: '0.75px' }}>
              Ordered Items ({orders.length})
            </h4>

            {orders.map((order, i) => (
              <div key={i} className="glass-panel" style={{
                borderRadius: 14,
                padding: '1.25rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                border: '1.5px solid var(--glass-border)',
                background: 'rgba(16, 185, 129, 0.04)'
              }}>
                <img
                  src={order.image}
                  alt={order.title}
                  style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--glass-border)' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 2 }}>{order.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span>Order ID: <strong style={{ color: 'var(--primary-color)' }}>{order.orderId}</strong></span>
                    <span>•</span>
                    <span>{order.price === 0 ? 'FREE' : `₹${order.price}`}</span>
                  </div>
                  {order.meetupHotspot && (
                    <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      📍 Meetup: <strong>{order.meetupHotspot.split(' (')[0]}</strong>
                    </div>
                  )}
                </div>

                <button
                  className="nav-btn nav-btn-primary"
                  onClick={() => onOpenChat && onOpenChat(order)}
                  style={{
                    padding: '0.5rem 0.9rem',
                    fontSize: '0.78rem',
                    borderRadius: '8px',
                    gap: '0.35rem',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    boxShadow: '0 4px 10px -2px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <MessageCircle size={14} />
                  Chat Seller
                </button>
              </div>
            ))}
          </div>

          <div style={{
            background: 'rgba(59, 130, 246, 0.05)',
            border: '1.5px solid rgba(59, 130, 246, 0.12)',
            borderRadius: 14,
            padding: '1.25rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginBottom: '2rem',
            textAlign: 'left',
            lineHeight: '1.5'
          }}>
            💡 <strong>Meetup only:</strong> No online payment is collected here. Use in-app chat to fix a safe handover time and pay in person when you meet the seller.
          </div>

          <button
            className="nav-btn nav-btn-primary"
            onClick={() => setStep('cart')}
            style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', borderRadius: '12px' }}
          >
            <ShoppingBag size={16} />
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: 500, margin: '5rem auto', textAlign: 'center', padding: '0 1rem' }}>
        <div className="glass-panel" style={{ padding: '4rem 3rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.08)',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            border: '2px dashed var(--glass-border)'
          }}>
            <ShoppingCart size={36} style={{ color: 'var(--primary-color)' }} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 850, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Your Cart is Empty</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            Start browsing campus listings and add items you want to buy or collect in person.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1rem' }}>
      {renderStepper('cart')}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 850, letterSpacing: '-0.75px', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            🛒 My Cart
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{cartItems.length} item(s) ready for meetup confirmation</p>
        </div>
        <button
          onClick={onClearCart}
          style={{
            background: 'rgba(244,63,94,0.08)',
            border: '1px solid rgba(244,63,94,0.2)',
            color: '#f43f5e',
            padding: '0.6rem 1.1rem',
            borderRadius: 10,
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s'
          }}
          className="nav-btn"
        >
          <Trash2 size={14} /> Clear All
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {cartItems.map((item) => (
            <div key={item.id} className="glass-panel" style={{
              borderRadius: 18,
              overflow: 'hidden',
              display: 'flex',
              gap: 0,
              border: '1.5px solid var(--glass-border)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <div style={{ width: 140, flexShrink: 0, position: 'relative', background: 'rgba(255,255,255,0.02)' }}>
                <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <span className={`listing-badge badge-${item.tradeType.toLowerCase()}`} style={{ position: 'absolute', top: 8, left: 8, fontSize: '0.62rem', padding: '2px 6px', borderRadius: 4 }}>
                  {item.tradeType === 'Sell' ? 'For Sale' : item.tradeType}
                </span>
              </div>

              <div style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-light)', letterSpacing: '0.5px' }}>{item.category}</span>
                    <h4
                      style={{
                        fontSize: '1rem',
                        fontWeight: 800,
                        margin: '0.2rem 0 0',
                        lineHeight: 1.3,
                        color: 'var(--text-primary)',
                        cursor: 'pointer'
                      }}
                      onClick={() => onViewProduct(item)}
                    >
                      {item.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => onRemoveFromCart(item.id)}
                    style={{
                      background: 'rgba(244,63,94,0.08)',
                      border: '1px solid rgba(244,63,94,0.15)',
                      color: '#f43f5e',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s'
                    }}
                    title="Remove from cart"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <img src={item.seller.avatar} alt={item.seller.name} style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid var(--accent-color)' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{item.seller.name.split(' ')[0]}</span>
                  {item.seller.verified && (
                    <span style={{ fontSize: '0.65rem', color: '#10b981', background: 'rgba(16,185,129,0.08)', padding: '1px 4px', borderRadius: 3, fontWeight: 700 }}>Verified</span>
                  )}
                </div>

                {item.meetupHotspot && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--primary-color)', fontWeight: 700, marginBottom: '0.75rem' }}>
                    <MapPin size={12} />
                    <span>📍 {item.meetupHotspot.split(' (')[0]}</span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, color: item.price === 0 ? '#10b981' : 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                    {item.price === 0 ? 'FREE' : `₹${item.price}`}
                  </span>
                  <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)', fontWeight: 700, border: '1px solid var(--glass-border)' }}>
                    {item.condition}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-panel" style={{ borderRadius: 20, padding: '1.75rem', border: '1px solid var(--glass-border)', position: 'sticky', top: '6rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 850, letterSpacing: '-0.25px', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Meetup Summary</h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              <span>Items</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            {freeItems.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#10b981', fontWeight: 600 }}>
                <span>🎁 Free items ({freeItems.length})</span>
                <span>FREE</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              <span>Platform Service</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>₹0 (Free)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              <span>Payment Mode</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>Pay at meetup</span>
            </div>
          </div>

          <div style={{ borderTop: '1.5px solid var(--glass-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.3rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary-color)' }}>₹{total.toLocaleString('en-IN')}</span>
          </div>

          <button
            onClick={handleConfirmMeetup}
            className="nav-btn nav-btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontWeight: 800, fontSize: '0.95rem', borderRadius: '12px' }}
          >
            <CheckCircle size={18} />
            Confirm Meetup Order · ₹{total.toLocaleString('en-IN')}
          </button>

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <Package size={14} style={{ color: 'var(--primary-color)' }} />
              <span>Collect directly from peer sellers</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <Calendar size={14} style={{ color: '#10b981' }} />
              <span>Complete payment only when you meet</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={14} style={{ color: 'var(--accent-color)' }} />
              <span>100% verified student platform</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
