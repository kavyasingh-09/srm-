import React, { useState, useEffect } from 'react';
import { srmCampuses, srmHostels, categories } from './data/mockData';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ListingsGrid from './components/ListingsGrid';
import CreateListingModal from './components/CreateListingModal';
import ProductDetailModal from './components/ProductDetailModal';
import LostFoundHub from './components/LostFoundHub';
import AuthScreen from './components/AuthScreen';
import CartPage from './components/CartPage';

import ChatModal from './components/ChatModal';
import ProfileEditModal from './components/ProfileEditModal';
import { api, getToken, setToken } from './api/client';
import { Grid, List, Shield, CheckCircle, Trash2, Heart, Award, ShoppingCart, Pencil, Save, X, Phone, MapPin } from 'lucide-react';

function loadStoredArray(key) {
  try {
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);

  const [lostFoundItems, setLostFoundItems] = useState([]);
  const [lostFoundLoading, setLostFoundLoading] = useState(false);

  const [favorites, setFavorites] = useState(() => loadStoredArray('srm_favorites'));

  const [cart, setCart] = useState(() => loadStoredArray('srm_cart'));

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('srm_dark_mode');
    return saved === 'true';
  });

  // UI Navigation States
  const [currentView, setCurrentView] = useState('login'); // start on login page
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedCampus, setSelectedCampus] = useState('All Campuses');
  const [selectedHostel, setSelectedHostel] = useState('All Hostels');
  const [selectedTradeType, setSelectedTradeType] = useState('All Types');
  const [selectedSort, setSelectedSort] = useState('latest');
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [activeChatListing, setActiveChatListing] = useState(null);
  const [avatarEditOpen, setAvatarEditOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);

  // User Profile State (dynamic, loaded from local storage)
  const [userProfile, setUserProfile] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const [notifications, setNotifications] = useState(() => loadStoredArray('srm_notifications'));

  const [showNotifications, setShowNotifications] = useState(false);

  // Reset hostel filter when campus changes
  useEffect(() => {
    setSelectedHostel('All Hostels');
  }, [selectedCampus]);

  // Load shared listings from API (visible to everyone)
  useEffect(() => {
    async function loadListings() {
      setListingsLoading(true);
      try {
        const data = await api.getListings();
        setListings(Array.isArray(data?.listings) ? data.listings : []);
      } catch (err) {
        console.error('Failed to load listings:', err);
      } finally {
        setListingsLoading(false);
      }
    }

    loadListings();
  }, []);

  // Load lost & found from PostgreSQL (visible to everyone)
  useEffect(() => {
    async function loadLostFound() {
      setLostFoundLoading(true);
      try {
        const data = await api.getLostFound();
        setLostFoundItems(Array.isArray(data?.items) ? data.items : []);
      } catch (err) {
        console.error('Failed to load lost & found:', err);
      } finally {
        setLostFoundLoading(false);
      }
    }

    loadLostFound();
  }, []);

  // Restore session from JWT on load
  useEffect(() => {
    async function restoreSession() {
      const token = getToken();
      if (!token) {
        setAuthChecking(false);
        return;
      }

      try {
        const { user } = await api.me();
        setUserProfile(user);
        setIsLoggedIn(true);
        localStorage.setItem('srm_user_profile', JSON.stringify(user));
        localStorage.setItem('srm_is_logged_in', 'true');
      } catch {
        setToken(null);
        setUserProfile(null);
        setIsLoggedIn(false);
        localStorage.removeItem('srm_user_profile');
        localStorage.setItem('srm_is_logged_in', 'false');
      } finally {
        setAuthChecking(false);
      }
    }

    restoreSession();
  }, []);

  useEffect(() => {
    localStorage.setItem('srm_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('srm_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('srm_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('srm_dark_mode', darkMode);
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [darkMode]);

  // Event Handlers
  const requireLogin = () => {
    if (!isLoggedIn) {
      setCurrentView('login');
      return false;
    }
    return true;
  };

  const handleOpenSellModal = () => {
    if (!requireLogin()) return;
    setEditingListing(null);
    setSellModalOpen(true);
  };

  const handleOpenEditListing = (listing) => {
    if (!requireLogin()) return;
    setEditingListing(listing);
    setSellModalOpen(true);
  };

  const handleCloseSellModal = () => {
    setSellModalOpen(false);
    setEditingListing(null);
  };

  const handleToggleFavorite = (itemId) => {
    if (!requireLogin()) return;
    setFavorites(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleToggleCart = (itemId) => {
    if (!requireLogin()) return;
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

  const handleCreateListing = async (newListing) => {
    try {
      const { listing } = await api.createListing(newListing);
      setListings((prev) => [listing, ...prev]);
      alert('Listing published successfully!');
    } catch (err) {
      alert(err.message || 'Failed to publish listing.');
    }
  };

  const handleUpdateListing = async (listing) => {
    try {
      const { listing: updated } = await api.updateListing(listing.id, listing);
      setListings((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setSelectedProduct((prev) => (prev?.id === updated.id ? updated : prev));
      alert('Listing updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update listing.');
    }
  };

  const handleCreateLFReport = async (newReport) => {
    try {
      const { item } = await api.createLostFound(newReport);
      setLostFoundItems((prev) => [item, ...prev]);
      alert('Report added successfully!');
    } catch (err) {
      alert(err.message || 'Failed to submit report.');
    }
  };

  const handleUpdateLFReport = async (report) => {
    try {
      const { item } = await api.updateLostFound(report.id, report);
      setLostFoundItems((prev) => prev.map((entry) => (entry.id === item.id ? item : entry)));
      alert('Report updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update report.');
    }
  };

  const handleDeleteLFReport = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      await api.deleteLostFound(itemId);
      setLostFoundItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      alert(err.message || 'Failed to delete report.');
    }
  };

  const handleLogin = (profileData) => {
    setUserProfile(profileData);
    setIsLoggedIn(true);
    localStorage.setItem('srm_user_profile', JSON.stringify(profileData));
    localStorage.setItem('srm_is_logged_in', 'true');
    setCurrentView('browse');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of SRM Campus Marketplace?')) {
      setToken(null);
      setUserProfile(null);
      setIsLoggedIn(false);
      localStorage.removeItem('srm_user_profile');
      localStorage.setItem('srm_is_logged_in', 'false');
      setCurrentView('login');
    }
  };

  const handleUpdateAvatar = async (avatarUrl) => {
    try {
      const { user } = await api.updateAvatar(avatarUrl);
      setUserProfile(user);
      localStorage.setItem('srm_user_profile', JSON.stringify(user));
      setAvatarEditOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to update avatar.');
    }
  };

  const handleUpdateProfile = async (data) => {
    try {
      const { user } = await api.updateProfile(data);
      setUserProfile(user);
      localStorage.setItem('srm_user_profile', JSON.stringify(user));
      setProfileEditOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to update profile.');
    }
  };

  const handleDeleteListing = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      await api.deleteListing(itemId);
      setListings((prev) => prev.filter((item) => item.id !== itemId));
      setFavorites((prev) => prev.filter((id) => id !== itemId));
    } catch (err) {
      alert(err.message || 'Failed to delete listing.');
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
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      (item.title?.toLowerCase() || '').includes(search) ||
      (item.description?.toLowerCase() || '').includes(search) ||
      (item.hostel?.toLowerCase() || '').includes(search) ||
      (item.courseCode?.toLowerCase() || '').includes(search);
      
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
  const userListings = userProfile
    ? listings.filter((item) => item.userId === userProfile.id || item.seller?.email === userProfile.email)
    : [];
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
        notificationsCount={notifications.length}
        notifications={notifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        onClearNotifications={() => setNotifications([])}
        onOpenSellModal={handleOpenSellModal}
        onLoginRequired={requireLogin}
      />

      {/* Main Page Area */}
      <main className="main-content">
        {authChecking ? (
          <div className="empty-state glass-panel" style={{ padding: '3rem', textAlign: 'center', margin: '2rem auto', maxWidth: '420px' }}>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Checking session…</p>
          </div>
        ) : currentView === 'login' ? (
          <AuthScreen 
            onLogin={handleLogin} 
            onBrowse={() => setCurrentView('browse')}
            isLoggedIn={isLoggedIn}
            userProfile={userProfile}
            onLogout={handleLogout}
          />
        ) : (
          <>
            {currentView === 'browse' && (
          <>
            {/* Hero Section Banner */}
            <HeroSection 
              setCurrentView={setCurrentView}
              onOpenSellModal={handleOpenSellModal}
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
              {listingsLoading ? (
                <div className="empty-state glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Loading listings…</p>
                </div>
              ) : (
              <ListingsGrid 
                listings={sortedListings}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onViewProduct={setSelectedProduct}
                cart={cart}
                onToggleCart={handleToggleCart}
                onOpenSellModal={handleOpenSellModal}
              />
              )}
            </div>
          </>
        )}

        {currentView === 'lostfound' && (
          <LostFoundHub 
            items={lostFoundItems}
            loading={lostFoundLoading}
            userProfile={userProfile}
            isLoggedIn={isLoggedIn}
            onLoginRequired={requireLogin}
            onCreateReport={handleCreateLFReport}
            onUpdateReport={handleUpdateLFReport}
            onDeleteReport={handleDeleteLFReport}
          />
        )}

        {currentView === 'cart' && (
          isLoggedIn ? (
          <CartPage
            cartItems={listings.filter(item => cart.includes(item.id))}
            onRemoveFromCart={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onViewProduct={setSelectedProduct}
          />
          ) : (
            <AuthScreen onLogin={handleLogin} />
          )
        )}



        {currentView === 'profile' && (
          isLoggedIn ? (
          <div className="profile-view">
            {/* Sidebar info */}
            <div className="profile-sidebar glass-panel">

              {/* Avatar with edit button */}
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.5rem' }}>
                <div className="profile-avatar-large">
                  <img
                    src={userProfile?.avatar || (userProfile?.gender === 'female'
                      ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=srm-f1&clothing[]=blazerAndSweater&top[]=curly&skinColor[]=ffdbb4&hairColor[]=2c1b18'
                      : 'https://api.dicebear.com/7.x/avataaars/svg?seed=srm-m1&clothing[]=blazerAndShirt&facialHairProbability=0&skinColor[]=ffdbb4&hairColor[]=2c1b18'
                    )}
                    alt={userProfile?.name}
                  />
                </div>
                <button
                  onClick={() => setAvatarEditOpen(!avatarEditOpen)}
                  title="Edit Avatar"
                  style={{
                    position: 'absolute', bottom: 4, right: 4,
                    width: '30px', height: '30px', borderRadius: '50%',
                    background: 'var(--primary-color)', border: '2px solid white',
                    color: 'white', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Pencil size={13} />
                </button>
              </div>

              {/* Avatar picker */}
              {avatarEditOpen && (() => {
                const userGender = userProfile?.gender || 'male';

                const MALE_AVATARS = [
                  {
                    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=srm-m1&clothing[]=blazerAndShirt&facialHairProbability=0&skinColor[]=ffdbb4&hairColor[]=2c1b18',
                    label: 'Style 1',
                  },
                  {
                    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=srm-m2&clothing[]=blazerAndShirt&facialHairProbability=0&skinColor[]=f8b4a0&hairColor[]=4a312c',
                    label: 'Style 2',
                  },
                  {
                    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=srm-m3&clothing[]=blazerAndShirt&facialHairProbability=0&skinColor[]=d08b5b&hairColor[]=2c1b18',
                    label: 'Style 3',
                  },
                  {
                    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=srm-m4&clothing[]=blazerAndShirt&facialHairProbability=0&skinColor[]=ae5d29&hairColor[]=b58143',
                    label: 'Style 4',
                  },
                ];

                const FEMALE_AVATARS = [
                  {
                    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=srm-f1&clothing[]=blazerAndSweater&top[]=curly&skinColor[]=ffdbb4&hairColor[]=2c1b18',
                    label: 'Style 1',
                  },
                  {
                    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=srm-f2&clothing[]=blazerAndSweater&top[]=longButNotTooLong&skinColor[]=f8b4a0&hairColor[]=b58143',
                    label: 'Style 2',
                  },
                  {
                    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=srm-f3&clothing[]=blazerAndSweater&top[]=straight01&skinColor[]=d08b5b&hairColor[]=4a312c',
                    label: 'Style 3',
                  },
                  {
                    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=srm-f4&clothing[]=blazerAndSweater&top[]=bob&skinColor[]=ae5d29&hairColor[]=2c1b18',
                    label: 'Style 4',
                  },
                ];


                const avatars = userGender === 'female' ? FEMALE_AVATARS : MALE_AVATARS;
                const genderLabel = userGender === 'female' ? '👩 Formal Female Avatars' : '👨 Formal Male Avatars';

                return (
                  <div style={{
                    background: 'var(--card-bg)', border: '1.5px solid var(--glass-border)',
                    borderRadius: '16px', padding: '1.25rem', marginBottom: '1rem',
                    boxShadow: 'var(--shadow-lg)',
                  }}>
                    <p style={{ margin: '0 0 0.25rem', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      Choose your avatar
                    </p>
                    <p style={{ margin: '0 0 0.85rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {genderLabel}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                      {avatars.map(({ url, label }) => {
                        const isSelected = userProfile?.avatar === url;
                        return (
                          <button
                            key={url}
                            onClick={() => handleUpdateAvatar(url)}
                            title={label}
                            style={{
                              padding: '0.85rem 0.5rem', borderRadius: '14px', cursor: 'pointer',
                              border: isSelected ? '2.5px solid var(--primary-color)' : '1.5px solid var(--glass-border)',
                              background: isSelected ? 'rgba(0,58,112,0.12)' : 'rgba(255,255,255,0.04)',
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem',
                              transition: 'all 0.2s',
                              position: 'relative',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = 'var(--primary-color)';
                              e.currentTarget.style.background = 'rgba(0,58,112,0.08)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = isSelected ? 'var(--primary-color)' : 'var(--glass-border)';
                              e.currentTarget.style.background = isSelected ? 'rgba(0,58,112,0.12)' : 'rgba(255,255,255,0.04)';
                            }}
                          >
                            {isSelected && (
                              <span style={{
                                position: 'absolute', top: '6px', right: '6px',
                                background: 'var(--primary-color)', color: 'white',
                                borderRadius: '50%', width: '18px', height: '18px',
                                fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700,
                              }}>✓</span>
                            )}
                            <img
                              src={url}
                              alt={label}
                              style={{ width: '68px', height: '68px', borderRadius: '50%', display: 'block', border: isSelected ? '2px solid var(--primary-color)' : '2px solid transparent' }}
                            />
                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: isSelected ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
                              {label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setAvatarEditOpen(false)}
                      style={{
                        width: '100%', marginTop: '0.85rem', padding: '0.5rem',
                        borderRadius: '8px', border: '1px solid var(--glass-border)',
                        background: 'transparent', color: 'var(--text-secondary)',
                        cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                );
              })()}



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

              <button
                className="nav-btn nav-btn-primary"
                onClick={() => setProfileEditOpen(true)}
                style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem', gap: '0.5rem' }}
              >
                <Pencil size={15} />
                Edit Profile
              </button>

              <button
                className="nav-btn nav-btn-secondary"
                onClick={handleLogout}
                style={{ width: '100%', justifyContent: 'center', borderColor: '#ef4444', color: '#ef4444' }}
              >
                Log Out
              </button>
            </div>

            {/* Profile Edit Modal */}
            {profileEditOpen && (
              <ProfileEditModal
                userProfile={userProfile}
                onSave={handleUpdateProfile}
                onClose={() => setProfileEditOpen(false)}
              />
            )}



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
                            style={{ color: 'var(--primary-color)', right: '2.5rem' }}
                            onClick={() => handleOpenEditListing(item)}
                            title="Edit Listing"
                          >
                            <Pencil size={16} />
                          </button>
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
          ) : (
            <AuthScreen onLogin={handleLogin} />
          )
        )}
          </>
        )}

      </main>

      {/* Footer Section */}
      <footer className="app-footer glass-panel">
        <div className="footer-links">
          <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('browse'); }}>Marketplace</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('lostfound'); }}>Lost & Found Hub</a>

          <a href="#" onClick={(e) => { e.preventDefault(); isLoggedIn ? setCurrentView('profile') : setCurrentView('login'); }}>My Dashboard</a>
          <a href="https://www.srmist.edu.in" target="_blank" rel="noopener noreferrer">SRM IST Website</a>
        </div>
        <p className="footer-text">
          © 2026 SRM Institute of Science and Technology. Designed for students by SRM developers.
        </p>
      </footer>

      {/* Modal overlays */}
      <CreateListingModal 
        isOpen={sellModalOpen && isLoggedIn}
        onClose={handleCloseSellModal}
        onSubmitListing={handleCreateListing}
        onUpdateListing={handleUpdateListing}
        editingListing={editingListing}
        userProfile={userProfile}
      />

      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onVerifyUserSimulation={handleSimulateVerification}
          onOpenChat={setActiveChatListing}
          userProfile={userProfile}
          onShowInterest={(itemId, itemTitle, buyerName) => {
            const newNotification = {
              id: Date.now(),
              itemId,
              itemTitle,
              buyerName,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setNotifications([newNotification, ...notifications]);
          }}
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
