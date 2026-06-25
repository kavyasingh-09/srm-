import React from 'react';
import { Search, Sun, Moon, PlusCircle, Heart, ShieldAlert, User, ShoppingCart, Bell } from 'lucide-react';

export default function Navbar({
  isLoggedIn,
  currentView,
  setCurrentView,
  searchTerm,
  setSearchTerm,
  darkMode,
  setDarkMode,
  favoritesCount,
  onOpenSellModal,
  cartCount,
  notificationsCount = 0,
  notifications = [],
  showNotifications = false,
  setShowNotifications,
  onClearNotifications
}) {
  return (
    <nav className="navbar glass-panel">
      {/* Brand Logo */}
      <div className="nav-brand" onClick={() => isLoggedIn && setCurrentView('browse')}>
        <div className="brand-logo-container">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
          </svg>
        </div>
        <div>
          <span className="brand-text">SRM Campus</span>
          <span className="brand-tag">Marketplace</span>
        </div>
      </div>

      {/* Global Search Bar */}
      {isLoggedIn && currentView === 'browse' && (
        <div className="nav-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search textbooks, cycles, calculators, room essentials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Action Controls & Navigation */}
      <div className="nav-actions">
        {isLoggedIn && (
          <>
            {/* Navigation Tabs */}
            <button
              onClick={() => setCurrentView('browse')}
              className={`nav-btn nav-btn-secondary ${currentView === 'browse' ? 'active' : ''}`}
              style={currentView === 'browse' ? { color: 'var(--primary-color)', borderColor: 'var(--primary-color)' } : {}}
            >
              Marketplace
            </button>

            <button
              onClick={() => setCurrentView('lostfound')}
              className={`nav-btn nav-btn-secondary ${currentView === 'lostfound' ? 'active' : ''}`}
              style={currentView === 'lostfound' ? { color: 'var(--primary-color)', borderColor: 'var(--primary-color)' } : {}}
            >
              <ShieldAlert size={16} />
              Lost & Found
            </button>

            {/* Favorites count indicator */}
            <button 
              onClick={() => setCurrentView('profile')}
              className={`nav-btn nav-btn-secondary ${currentView === 'profile' ? 'active' : ''}`}
              style={{ position: 'relative' }}
            >
              <User size={16} />
              Profile
              {favoritesCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: '#ef4444',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Notifications Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`nav-btn nav-btn-secondary`}
              style={{ position: 'relative' }}
              title="Notifications"
            >
              <Bell size={16} />
              {notificationsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: '#ef4444',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: '9px',
                  padding: '0 3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {notificationsCount}
                </span>
              )}
              
              {/* Notifications Dropdown */}
              {showNotifications && isLoggedIn && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  background: 'var(--card-bg)',
                  border: '1.5px solid var(--glass-border)',
                  borderRadius: '14px',
                  boxShadow: 'var(--shadow-lg)',
                  minWidth: '320px',
                  maxWidth: '360px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>Interested Buyers</h4>
                    {notificationsCount > 0 && (
                      <button
                        onClick={() => onClearNotifications()}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--glass-border)',
                          color: 'var(--text-secondary)',
                          padding: '0.3rem 0.6rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  
                  {notificationsCount === 0 ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
                      <p style={{ margin: 0, fontSize: '0.85rem' }}>No interests yet</p>
                      <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem' }}>You'll get notified when someone shows interest in your listings</p>
                    </div>
                  ) : (
                    <div style={{ padding: '0.5rem' }}>
                      {notifications.map((notif) => (
                        <div key={notif.id} style={{
                          padding: '0.75rem',
                          borderRadius: '10px',
                          background: 'rgba(59, 130, 246, 0.05)',
                          borderLeft: '3px solid var(--primary-color)',
                          marginBottom: '0.5rem',
                          fontSize: '0.85rem'
                        }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            ❤️ {notif.buyerName} is interested
                          </div>
                          <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.8rem' }}>
                            {notif.itemTitle}
                          </div>
                          <div style={{ color: 'var(--text-light)', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                            {notif.timestamp}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </button>

            {/* Cart Icon Button */}
            <button
              onClick={() => setCurrentView('cart')}
              className={`nav-btn nav-btn-secondary ${currentView === 'cart' ? 'active' : ''}`}
              style={{ position: 'relative', ...(currentView === 'cart' ? { color: 'var(--primary-color)', borderColor: 'var(--primary-color)' } : {}) }}
              title={`My Cart (${cartCount} items)`}
            >
              <ShoppingCart size={16} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: '#f59e0b',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: '9px',
                  padding: '0 3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          </>
        )}

        {/* Theme Toggle Button */}
        <button
          className="theme-toggle-btn"
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle Light/Dark Theme"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Sell CTA button */}
        {isLoggedIn && (
          <button
            className="nav-btn nav-btn-primary"
            onClick={onOpenSellModal}
          >
            <PlusCircle size={18} />
            Sell Item
          </button>
        )}
      </div>
    </nav>
  );
}
