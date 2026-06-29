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
  onClearNotifications,
  onLoginRequired,
  onOpenNotification
}) {
  const goToView = (view) => {
    if (view === 'profile' || view === 'cart') {
      if (onLoginRequired && !onLoginRequired()) return;
    }
    setCurrentView(view);
  };

  return (
    <nav className="navbar glass-panel">
      {/* Brand Logo */}
      <div className="nav-brand" onClick={() => setCurrentView('browse')}>
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
      {currentView === 'browse' && (
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
        {currentView !== 'login' && (
          <>
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
          </>
        )}

        {isLoggedIn && currentView !== 'login' && (
          <>
            {/* Profile */}
            <button
              onClick={() => goToView('profile')}
              className={`nav-btn nav-btn-secondary ${currentView === 'profile' ? 'active' : ''}`}
              style={{ position: 'relative', overflow: 'visible' }}
            >
              <User size={16} />
              Profile
              {favoritesCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  transform: 'translate(35%, -35%)',
                  background: '#ef4444',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--card-bg)',
                  boxShadow: '0 0 0 1px rgba(239, 68, 68, 0.25)',
                  zIndex: 5
                }}>
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Notifications Bell */}
            <div style={{ position: 'relative', overflow: 'visible' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`nav-btn nav-btn-secondary`}
                title="Notifications"
                style={{ overflow: 'visible' }}
              >
                <Bell size={16} />
                {notificationsCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    transform: 'translate(35%, -35%)',
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
                    justifyContent: 'center',
                    border: '2px solid var(--card-bg)',
                    boxShadow: '0 0 0 1px rgba(239, 68, 68, 0.25)',
                    zIndex: 5
                  }}>
                    {notificationsCount}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && isLoggedIn && (
                <>
                <div style={{
                  position: 'fixed',
                  top: '84px',
                  right: '24px',
                  background: 'linear-gradient(180deg, rgba(11, 18, 34, 0.99) 0%, rgba(8, 14, 28, 0.98) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  borderRadius: '16px',
                  boxShadow: '0 24px 70px rgba(0, 0, 0, 0.55)',
                  minWidth: '340px',
                  maxWidth: '380px',
                  maxHeight: '420px',
                  overflowY: 'auto',
                  zIndex: 999,
                  backdropFilter: 'blur(18px)',
                  color: 'var(--text-primary)'
                }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>Notifications</h4>
                    {notificationsCount > 0 && (
                      <button
                        onClick={() => {
                          onClearNotifications();
                          setShowNotifications(false);
                        }}
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
                      <p style={{ margin: 0, fontSize: '0.85rem' }}>No notifications yet</p>
                    </div>
                  ) : (
                    <div style={{ padding: '0.5rem' }}>
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            if (notif.listingId && notif.conversationUserId && onOpenNotification) {
                              onOpenNotification(notif);
                              setShowNotifications(false);
                            }
                          }}
                          style={{
                          padding: '0.75rem',
                          borderRadius: '10px',
                          background: 'rgba(59, 130, 246, 0.05)',
                          borderLeft: '3px solid var(--primary-color)',
                          marginBottom: '0.5rem',
                          fontSize: '0.85rem',
                          cursor: notif.listingId && notif.conversationUserId ? 'pointer' : 'default'
                        }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {notif.buyerName ? `❤️ ${notif.buyerName} is interested` : notif.title}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.8rem' }}>
                            {notif.buyerName ? notif.itemTitle : notif.message}
                          </div>
                          <div style={{ color: 'var(--text-light)', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                            {notif.timestamp || (notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
                </>
              )}
            </div>

            {/* Cart Icon Button */}
            <button
              onClick={() => goToView('cart')}
              className={`nav-btn nav-btn-secondary ${currentView === 'cart' ? 'active' : ''}`}
              style={{ position: 'relative', overflow: 'visible', ...(currentView === 'cart' ? { color: 'var(--primary-color)', borderColor: 'var(--primary-color)' } : {}) }}
              title={`My Cart (${cartCount} items)`}
            >
              <ShoppingCart size={16} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  transform: 'translate(35%, -35%)',
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
                  justifyContent: 'center',
                  border: '2px solid var(--card-bg)',
                  boxShadow: '0 0 0 1px rgba(245, 158, 11, 0.25)',
                  zIndex: 5
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          </>
        )}

        {!isLoggedIn && currentView !== 'login' && (
          <button
            className="nav-btn nav-btn-secondary"
            onClick={() => setCurrentView('login')}
            style={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
          >
            <User size={16} />
            Log In
          </button>
        )}

        {/* Theme Toggle Button */}
        {currentView !== 'login' && (
          <button
            className="theme-toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle Light/Dark Theme"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}

        {/* Sell CTA button */}
        {isLoggedIn && currentView !== 'login' && (
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
