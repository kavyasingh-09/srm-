import React, { useState, useEffect } from 'react';
import { srmCampuses, srmHostels, categories, initialListings, initialLostFound } from './data/mockData';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ListingsGrid from './components/ListingsGrid';
import CreateListingModal from './components/CreateListingModal';
import ProductDetailModal from './components/ProductDetailModal';
import LostFoundHub from './components/LostFoundHub';
import LoginScreen from './components/LoginScreen';
import CartPage from './components/CartPage';

import ChatModal from './components/ChatModal';
import { Grid, List, Shield, CheckCircle, Trash2, Heart, Award, ShoppingCart } from 'lucide-react';

const demoListingTitles = new Set(initialListings.map(item => item.title));
const demoLostFoundTitles = new Set(initialLostFound.map(item => item.title));

const parseSavedArray = (key) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const stripDemoItems = (items, demoTitles) =>
  Array.isArray(items) ? items.filter(item => !demoTitles.has(item?.title)) : [];

export default function App() {
  // Load State from LocalStorage or Defaults
  const [listings, setListings] = useState(() => {
    return stripDemoItems(parseSavedArray('srm_listings_v7'), demoListingTitles);
  });

  const [lostFoundItems, setLostFoundItems] = useState(() => {
    return stripDemoItems(parseSavedArray('srm_lostfound_v6'), demoLostFoundTitles);
  });

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('srm_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('srm_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('srm_dark_mode');
    return saved === 'true';
  });

  // UI Navigation States
  const [currentView, setCurrentView] = useState('browse'); // browse, lostfound, profile, cart
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedCampus, setSelectedCampus] = useState('All Campuses');
  const [selectedHostel, setSelectedHostel] = useState('All Hostels');
  const [selectedTradeType, setSelectedTradeType] = useState('All Types');
  const [selectedSort, setSelectedSort] = useState('latest');
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [activeChatListing, setActiveChatListing] = useState(null);

  // User Profile State (dynamic, loaded from local storage)
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('srm_user_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('srm_is_logged_in') === 'true';
  });

  // Reset hostel filter when campus changes
  useEffect(() => {
    setSelectedHostel('All Hostels');
  }, [selectedCampus]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('srm_listings_v7', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('srm_lostfound_v6', JSON.stringify(lostFoundItems));
  }, [lostFoundItems]);

  useEffect(() => {
    const storedListings = parseSavedArray('srm_listings_v7');
    const cleanedListings = stripDemoItems(storedListings, demoListingTitles);
    if (cleanedListings.length !== storedListings.length) {
      localStorage.setItem('srm_listings_v7', JSON.stringify(cleanedListings));
    }

    const storedLostFound = parseSavedArray('srm_lostfound_v6');
    const cleanedLostFound = stripDemoItems(storedLostFound, demoLostFoundTitles);
    if (cleanedLostFound.length !== storedLostFound.length) {
      localStorage.setItem('srm_lostfound_v6', JSON.stringify(cleanedLostFound));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('srm_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('srm_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('srm_dark_mode', darkMode);
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [darkMode]);

  // Event Handlers
  const handleToggleFavorite = (itemId) => {
    setFavorites(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleToggleCart = (itemId) => {
    setCart(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleRemoveFromCart = (itemId) => {
    setCart(prev => prev.filter(id => id !== itemId));
  };

  const handleCreateListing = (newListing) => {
    const listingWithId = {
      ...newListing,
      id: `lst-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setListings([listingWithId, ...listings]);
    alert("Listing published successfully!");
  };

  const handleCreateLFReport = (newReport) => {
    const reportWithId = {
      ...newReport,
      id: `lf-${Date.now()}`
    };
    setLostFoundItems([reportWithId, ...lostFoundItems]);
    alert("Report added successfully!");
  };

  const handleLogin = (profileData) => {
    setUserProfile(profileData);
    setIsLoggedIn(true);
    localStorage.setItem('srm_user_profile', JSON.stringify(profileData));
    localStorage.setItem('srm_is_logged_in', 'true');
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out of SRM Campus Marketplace?")) {
      setUserProfile(null);
      setIsLoggedIn(false);
      localStorage.removeItem('srm_user_profile');
      localStorage.setItem('srm_is_logged_in', 'false');
      setCurrentView('browse'); // Reset view
    }
  };

  const handleDeleteListing = (itemId) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      setListings(prev => prev.filter(item => item.id !== itemId));
      setFavorites(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleSimulateVerification = (productId) => {
    setListings(prev => prev.map(item => {
      if (item.id === productId) {
        return {
          ...item,
          seller: { ...item.seller, verified: true }
        };
      }
      return item;
    }));
    // Also update selected product details in modal
    setSelectedProduct(prev => prev ? { ...prev, seller: { ...prev.seller, verified: true } } : null);
    alert("SRM student verification simulated successfully!");
  };

  // Filter listings
  const filteredListings = listings.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hostel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.courseCode && item.courseCode.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = 
      selectedCategory === 'All Categories' || 
      item.category === selectedCategory;

    const matchesCampus = 
      selectedCampus === 'All Campuses' || 
      item.campus === selectedCampus;

    const matchesHostel =
      selectedHostel === 'All Hostels' ||
      item.hostel === selectedHostel;

    const matchesTradeType = 
      selectedTradeType === 'All Types' || 
      item.tradeType === selectedTradeType;

    return matchesSearch && matchesCategory && matchesCampus && matchesHostel && matchesTradeType;
  });

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (selectedSort === 'price-low') {
      return a.price - b.price;
    }
    if (selectedSort === 'price-high') {
      return b.price - a.price;
    }
    // Default 'latest'
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // User's own listings (with null safety check)
  const userListings = userProfile ? listings.filter(item => item.seller.email === userProfile.email) : [];
  // User's favorite listings
  const favoriteListings = listings.filter(item => favorites.includes(item.id));

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar 
        isLoggedIn={isLoggedIn}
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        favoritesCount={favorites.length}
        cartCount={cart.length}
        onOpenSellModal={() => setSellModalOpen(true)}
      />

      {/* Main Page Area */}
      <main className="main-content">
        {!isLoggedIn ? (
          <LoginScreen onLogin={handleLogin} />
        ) : (
          <>
            {currentView === 'browse' && (
          <>
            {/* Hero Section Banner */}
            <HeroSection 
              setCurrentView={setCurrentView}
              onOpenSellModal={() => setSellModalOpen(true)}
            />

            {/* Filter Navigation Bar */}
            <div className="category-tabs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`cat-tab ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sub-Filters / Sorters */}
            <div className="filter-bar" style={{ marginTop: '1.5rem' }}>
              <div className="filters-left">
                {/* Campus Filter */}
                <select 
                  className="filter-select"
                  value={selectedCampus}
                  onChange={(e) => setSelectedCampus(e.target.value)}
                >
                  <option value="All Campuses">All SRM Campuses</option>
                  {srmCampuses.map((c) => (
                    <option key={c} value={c}>SRM {c}</option>
                  ))}
                </select>

                {/* Hostel Filter — dynamically populated based on selected campus */}
                <select
                  className="filter-select"
                  value={selectedHostel}
                  onChange={(e) => setSelectedHostel(e.target.value)}
                >
                  <option value="All Hostels">All Hostels</option>
                  {selectedCampus !== 'All Campuses' && srmHostels[selectedCampus] ? (
                    <>
                      <optgroup label="Boys Hostels">
                        {srmHostels[selectedCampus].boys.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Girls Hostels">
                        {srmHostels[selectedCampus].girls.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </optgroup>
                    </>
                  ) : (
                    /* When All Campuses selected — show KTR hostels as common reference */
                    <>
                      <optgroup label="KTR Boys Hostels">
                        {srmHostels['Kattankulathur'].boys.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </optgroup>
                      <optgroup label="KTR Girls Hostels">
                        {srmHostels['Kattankulathur'].girls.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </optgroup>
                    </>
                  )}
                </select>

                {/* Trade Type Filter */}
                <select 
                  className="filter-select"
                  value={selectedTradeType}
                  onChange={(e) => setSelectedTradeType(e.target.value)}
                >
                  <option value="All Types">All Trade Types</option>
                  <option value="Sell">For Sale</option>
                  <option value="Rent">Rent</option>
                  <option value="Free">Free / Give Away</option>
                </select>

                {/* Sort Filter */}
                <select 
                  className="filter-select"
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                >
                  <option value="latest">Latest Uploads</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              <div className="filters-right">
                <div style={{ display: 'flex', gap: '0.25rem', borderLeft: '1px solid var(--glass-border)', paddingLeft: '0.75rem' }}>
                  <button 
                    className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <Grid size={18} />
                  </button>
                  <button 
                    className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Listings Grid */}
            <div className={viewMode === 'list' ? 'listings-list-mode' : ''}>
              <ListingsGrid 
                listings={sortedListings}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onViewProduct={setSelectedProduct}
                cart={cart}
                onToggleCart={handleToggleCart}
                onOpenSellModal={() => setSellModalOpen(true)}
              />
            </div>
          </>
        )}

        {currentView === 'lostfound' && (
          <LostFoundHub 
            items={lostFoundItems}
            onCreateReport={handleCreateLFReport}
          />
        )}

        {currentView === 'cart' && (
          <CartPage
            cartItems={listings.filter(item => cart.includes(item.id))}
            onRemoveFromCart={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onViewProduct={setSelectedProduct}
          />
        )}



        {currentView === 'profile' && (
          <div className="profile-view">
            {/* Sidebar info */}
            <div className="profile-sidebar glass-panel">
              <div className="profile-avatar-large">
                <img src={userProfile?.avatar} alt={userProfile?.name} />
              </div>
              <h3 className="profile-name">{userProfile?.name}</h3>
              <p className="profile-email" style={{ marginBottom: '1rem' }}>{userProfile?.email}</p>
              
              {userProfile?.verified ? (
                <div className="profile-verif-badge" style={{ marginBottom: '1rem' }}>
                  <Award size={14} />
                  <span>SRM Verified Student</span>
                </div>
              ) : (
                <div className="profile-unverif-badge" style={{ marginBottom: '1rem' }}>
                  <span>Unverified Account</span>
                </div>
              )}

              <div className="profile-quick-facts">
                <div>
                  <span className="profile-fact-label">Campus</span>
                  <span className="profile-fact-value">SRM {userProfile?.campus}</span>
                </div>
                <div>
                  <span className="profile-fact-label">Hostel</span>
                  <span className="profile-fact-value">{userProfile?.hostel}</span>
                </div>
              </div>

              <div className="profile-stats" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="stat-item">
                  <span className="stat-num">{userListings.length}</span>
                  <span className="stat-label">Active Listings</span>
                </div>
                <div className="stat-item">
                  <span className="stat-num">{favoriteListings.length}</span>
                  <span className="stat-label">Saved Items</span>
                </div>
              </div>

              <div className="profile-actions">
                <button className="nav-btn nav-btn-primary" onClick={() => setSellModalOpen(true)} style={{ width: '100%', justifyContent: 'center' }}>
                  Post Item
                </button>
                <button className="nav-btn nav-btn-secondary" onClick={() => setCurrentView('lostfound')} style={{ width: '100%', justifyContent: 'center' }}>
                  Open Lost & Found
                </button>
                <button className="nav-btn nav-btn-secondary" onClick={() => setCurrentView('browse')} style={{ width: '100%', justifyContent: 'center' }}>
                  Browse Marketplace
                </button>
              </div>

              <button
                className="nav-btn nav-btn-secondary"
                onClick={handleLogout}
                style={{ width: '100%', justifyContent: 'center', borderColor: '#ef4444', color: '#ef4444' }}
              >
                Log Out
              </button>
            </div>

            {/* Profile Tabs & Lists */}
            <div>
              <div className="profile-header-card glass-panel">
                <div>
                  <p className="profile-kicker">My Dashboard</p>
                  <h2 style={{ fontSize: '2rem', margin: 0, fontWeight: 800 }}>Your student activity in one place</h2>
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', maxWidth: '520px' }}>
                  Keep track of your items, saved listings, and quick actions without hunting across pages.
                </p>
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.4rem', display: 'inline-block' }}>
                  My Active Listings
                </h3>
                
                {userListings.length === 0 ? (
                  <div className="empty-state glass-panel" style={{ padding: '2rem' }}>
                    <p style={{ margin: 0 }}>You haven't listed any items for sale yet.</p>
                    <button 
                      className="nav-btn nav-btn-primary" 
                      onClick={() => setSellModalOpen(true)}
                      style={{ marginTop: '1rem', display: 'inline-flex' }}
                    >
                      Sell Your First Item
                    </button>
                  </div>
                ) : (
                  <div className="listings-grid">
                    {userListings.map(item => (
                      <div key={item.id} className="listing-card">
                        <div className="listing-image-container" style={{ height: '140px' }}>
                          <img src={item.image} alt={item.title} className="listing-image" />
                          <button 
                            className="fav-btn" 
                            style={{ color: '#ef4444' }}
                            onClick={() => handleDeleteListing(item.id)}
                            title="Delete Listing"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="listing-info" style={{ padding: '0.85rem' }}>
                          <span className="listing-category" style={{ fontSize: '0.65rem' }}>{item.category}</span>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0.2rem 0' }}>{item.title}</h4>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                            {item.price === 0 ? 'FREE' : `₹${item.price}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.4rem', display: 'inline-block' }}>
                  My Saved Items
                </h3>
                
                {favoriteListings.length === 0 ? (
                  <div className="empty-state glass-panel" style={{ padding: '2rem' }}>
                    <p style={{ margin: 0 }}>You haven't bookmarked any items yet.</p>
                  </div>
                ) : (
                  <div className="listings-grid">
                    {favoriteListings.map(item => (
                      <div key={item.id} className="listing-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedProduct(item)}>
                        <div className="listing-image-container" style={{ height: '140px' }}>
                          <img src={item.image} alt={item.title} className="listing-image" />
                          <button 
                            className="fav-btn active" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(item.id);
                            }}
                          >
                            <Heart size={16} fill="currentColor" />
                          </button>
                        </div>
                        <div className="listing-info" style={{ padding: '0.85rem' }}>
                          <span className="listing-category" style={{ fontSize: '0.65rem' }}>{item.category}</span>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0.2rem 0' }}>{item.title}</h4>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                            {item.price === 0 ? 'FREE' : `₹${item.price}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
          </>
        )}

      </main>

      {/* Footer Section */}
      <footer className="app-footer glass-panel">
        <div className="footer-links">
          <a href="#" onClick={(e) => { e.preventDefault(); isLoggedIn && setCurrentView('browse'); }}>Marketplace</a>
          <a href="#" onClick={(e) => { e.preventDefault(); isLoggedIn && setCurrentView('lostfound'); }}>Lost & Found Hub</a>

          <a href="#" onClick={(e) => { e.preventDefault(); isLoggedIn && setCurrentView('profile'); }}>My Dashboard</a>
          <a href="https://www.srmist.edu.in" target="_blank" rel="noopener noreferrer">SRM IST Website</a>
        </div>
        <p className="footer-text">
          © 2026 SRM Institute of Science and Technology. Designed for students by SRM developers.
        </p>
      </footer>

      {/* Modal overlays */}
      <CreateListingModal 
        isOpen={sellModalOpen}
        onClose={() => setSellModalOpen(false)}
        onSubmitListing={handleCreateListing}
        userProfile={userProfile}
      />

      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onVerifyUserSimulation={handleSimulateVerification}
          onOpenChat={setActiveChatListing}
        />
      )}

      {activeChatListing && (
        <ChatModal
          listing={activeChatListing}
          userProfile={userProfile}
          onClose={() => setActiveChatListing(null)}
        />
      )}
    </div>
  );
}
