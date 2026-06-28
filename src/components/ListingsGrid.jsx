import React from 'react';
import { Heart, MapPin, CheckCircle, PackageOpen, ShoppingCart } from 'lucide-react';

export default function ListingsGrid({
  listings = [],
  favorites = [],
  onToggleFavorite,
  onViewProduct,
  cart = [],
  onToggleCart,
  currentUser = null,
  onOpenSellModal
}) {
  if (listings.length === 0) {
    return (
      <div className="empty-state glass-panel">
        <PackageOpen size={48} className="empty-state-icon" />
        <h3>No Items Yet</h3>
        <p>Be the first to post something useful for your campus.</p>
        {onOpenSellModal && (
          <button
            className="nav-btn nav-btn-primary"
            onClick={onOpenSellModal}
            style={{ marginTop: '1rem' }}
          >
            Post Your First Item
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="listings-grid">
      {listings.map((item) => {
        const isFavorite = favorites.includes(item.id);
        const inCart = cart && cart.includes(item.id);
        const isOwnListing = !!currentUser && (
          (item.userId != null && String(item.userId) === String(currentUser.id)) ||
          (item.seller?.email && currentUser.email && item.seller.email.toLowerCase() === currentUser.email.toLowerCase())
        );

        return (
          <div
            key={item.id}
            className="listing-card"
            style={{ cursor: 'pointer' }}
            onClick={() => onViewProduct && onViewProduct(item)}
          >
            {/* Image & Badges */}
            <div className="listing-image-container">
              <img
                src={item.image}
                alt={item.title}
                className="listing-image"
                loading="lazy"
              />

              <div className="listing-badge-container">
                <span className={`listing-badge badge-${item.tradeType.toLowerCase()}`}>
                  {item.tradeType === 'Sell' ? 'For Sale' : item.tradeType === 'Rent' ? 'Rent' : 'Free'}
                </span>
              </div>

              <span className="listing-campus-badge">
                {item.campus === 'Kattankulathur' ? 'KTR' : item.campus}
              </span>

              {/* Favourite button */}
              <button
                className={`fav-btn ${isFavorite ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(item.id);
                }}
                title={isFavorite ? 'Remove from Saved' : 'Save Item'}
              >
                <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>

              {/* Add to Cart button — icon only */}
              <button
                className={`cart-btn ${inCart ? 'in-cart' : ''}`}
                disabled={isOwnListing}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isOwnListing) {
                    onToggleCart && onToggleCart(item.id);
                  }
                }}
                title={isOwnListing ? 'Your listing' : inCart ? 'Remove from Cart' : 'Add to Cart'}
              >
                <ShoppingCart size={16} fill={inCart ? 'currentColor' : 'none'} opacity={isOwnListing ? 0.45 : 1} />
              </button>
            </div>

            {/* Info details */}
            <div className="listing-info">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span className="listing-category">{item.category}</span>
                {item.courseCode && (
                  <span style={{
                    background: 'rgba(99,102,241,0.15)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '0.65rem',
                    color: '#8b5cf6',
                    fontWeight: 700
                  }}>
                    {item.courseCode}
                  </span>
                )}
              </div>

              <h3
                className="listing-title"
                onClick={() => onViewProduct(item)}
              >
                {item.title}
              </h3>

              <div className="listing-location">
                <MapPin size={14} />
                <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span>{item.hostel || 'Main Campus'}</span>
                  {item.meetupHotspot && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                      📍 Meet: {item.meetupHotspot.split(' (')[0]}
                    </span>
                  )}
                </span>
              </div>

              <div className="listing-footer">
                <span className={`listing-price ${item.price === 0 ? 'free' : ''}`}>
                  {item.price === 0 ? 'FREE' : `₹${item.price}`}
                  {item.tradeType === 'Rent' && <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>/mo</span>}
                </span>

                <div className="seller-brief">
                  <img
                    src={item.seller.avatar}
                    alt={item.seller.name}
                    className="seller-avatar"
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="seller-name">{item.seller.name.split(' ')[0]}</span>
                    {item.seller.verified ? (
                      <span style={{ fontSize: '0.65rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '1px', fontWeight: 600 }}>
                        <CheckCircle size={8} fill="currentColor" color="white" />
                        Verified
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>
                        Student
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
