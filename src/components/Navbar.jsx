import React from 'react';
import { Search, Sun, Moon, PlusCircle, Heart, ShieldAlert, User, ShoppingCart } from 'lucide-react';

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
  cartCount
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
