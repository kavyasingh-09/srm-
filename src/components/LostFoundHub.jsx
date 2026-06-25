import React, { useState, useRef } from 'react';
import { Search, MapPin, Calendar, PlusCircle, FileText, User, Mail, Info, CheckCircle2, ShieldCheck, Pencil, Trash2 } from 'lucide-react';
import { srmCampuses } from '../data/mockData';

export default function LostFoundHub({ items = [], onCreateReport, onUpdateReport, onDeleteReport, loading = false, userProfile, isLoggedIn = false, onLoginRequired }) {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedCampus, setSelectedCampus] = useState('All');
  const [showReportForm, setShowReportForm] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [title, setTitle] = useState('');
  const [type, setType] = useState('Lost');
  const [category, setCategory] = useState('Documents & Cards');
  const [campus, setCampus] = useState(srmCampuses[0]);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImage, setUploadedImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const uploadInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  React.useEffect(() => {
    if (!showReportForm) {
      setEditingReport(null);
      return;
    }

    if (editingReport) {
      setTitle(editingReport.title || '');
      setType(editingReport.type || 'Lost');
      setCategory(editingReport.category || 'Documents & Cards');
      setCampus(editingReport.campus || srmCampuses[0]);
      setLocation(editingReport.location || '');
      setDescription(editingReport.description || '');
      setContactName(editingReport.contactName || '');
      setContactDetails(editingReport.contactDetails || '');
      setImageUrl(editingReport.image?.startsWith('http') ? editingReport.image : '');
      setUploadedImage(editingReport.image?.startsWith('data:') ? editingReport.image : '');
      return;
    }

    if (userProfile) {
      setContactName(userProfile.name || '');
      const details = [userProfile.email, userProfile.phone].filter(Boolean).join(' / ');
      setContactDetails(details);
    }
  }, [userProfile, showReportForm, editingReport]);

  const resetReportForm = () => {
    setTitle('');
    setLocation('');
    setDescription('');
    setContactName('');
    setContactDetails('');
    setImageUrl('');
    setUploadedImage('');
    setEditingReport(null);
    setShowReportForm(false);
  };

  const handleOpenCreateForm = () => {
    if (!isLoggedIn) {
      onLoginRequired?.();
      return;
    }
    setTitle('');
    setType('Lost');
    setCategory('Documents & Cards');
    setCampus(srmCampuses[0]);
    setLocation('');
    setDescription('');
    setImageUrl('');
    setUploadedImage('');
    setEditingReport(null);
    setShowReportForm(true);
  };

  const handleOpenEditForm = (item) => {
    if (!isLoggedIn) {
      onLoginRequired?.();
      return;
    }
    setEditingReport(item);
    setShowReportForm(true);
  };

  const handleDeleteReport = async (item) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    await onDeleteReport?.(item.id);
  };

  const isOwnReport = (item) => userProfile?.id && item.userId === userProfile.id;

  const safeItems = Array.isArray(items) ? items : [];
  const filteredItems = safeItems.filter((item) => {
    const search = searchTerm.toLowerCase();
    const matchesTab = activeTab === 'All' || item.type === activeTab;
    const matchesCampus = selectedCampus === 'All' || item.campus === selectedCampus;
    const matchesSearch =
      (item.title?.toLowerCase() || '').includes(search) ||
      (item.location?.toLowerCase() || '').includes(search) ||
      (item.description?.toLowerCase() || '').includes(search);
    return matchesTab && matchesCampus && matchesSearch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !location || !description || !contactName || !contactDetails) {
      alert('Please fill in all required fields!');
      return;
    }

    const defaultImage = uploadedImage || (imageUrl.trim() !== ''
      ? imageUrl.trim()
      : type === 'Lost'
        ? 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=600&auto=format&fit=crop&q=60'
        : 'https://images.unsplash.com/photo-1578358371354-3e1e754b77f4?w=600&auto=format&fit=crop&q=60');

    setSubmitting(true);
    try {
      const payload = {
        title,
        type,
        category,
        campus,
        location,
        description,
        image: defaultImage,
        contactName,
        contactDetails,
      };

      if (editingReport) {
        await onUpdateReport?.({ id: editingReport.id, ...payload });
      } else {
        await onCreateReport(payload);
      }

      resetReportForm();
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(String(reader.result || ''));
      setImageUrl('');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="lost-found-header" style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <span className="hero-badge" style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#f43f5e', borderColor: 'rgba(239, 68, 68, 0.15)' }}>
          SRM IST SECURITY SERVICE
        </span>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 850, letterSpacing: '-0.75px', color: 'var(--text-primary)', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
          Lost & Found Hub
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: '600px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
          Misplaced an item on campus or found someone else's belongings? Post a listing here to coordinate returned items safely.
        </p>
        <div className="hero-feature-strip" style={{ justifyContent: 'center' }}>
          <div className="hero-feature-chip" style={{ color: 'var(--text-primary)' }}>
            <ShieldCheck size={14} />
            Safe public meetups only
          </div>
          <div className="hero-feature-chip" style={{ color: 'var(--text-primary)' }}>
            <CheckCircle2 size={14} />
            Lost and found reports only
          </div>
        </div>
        <button
          className="nav-btn nav-btn-primary"
          onClick={() => (showReportForm ? resetReportForm() : handleOpenCreateForm())}
          style={{
            margin: '1rem auto 0',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: showReportForm ? 'none' : '0 4px 14px -4px rgba(0, 58, 112, 0.4)'
          }}
        >
          <PlusCircle size={18} />
          {showReportForm ? 'Close Report Panel' : 'File Lost / Found Report'}
        </button>
      </div>

      {showReportForm && (
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '3rem', border: '1.5px solid var(--accent-color)', borderRadius: '20px', boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
            {editingReport ? 'Edit Lost/Found Report' : 'Submit a Lost/Found Report'}
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Report Type *</label>
                <select className="form-control" value={type} onChange={(e) => setType(e.target.value)} style={{ borderRadius: '10px', padding: '0.75rem', background: 'var(--card-bg)', color: 'var(--text-primary)' }}>
                  <option value="Lost">I Lost Something (Lost)</option>
                  <option value="Found">I Found Something (Found)</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Item Name *</label>
                <input type="text" className="form-control" placeholder="e.g., Black Noise Watch, Marvel Keys" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ borderRadius: '10px', padding: '0.75rem' }} />
              </div>
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Category</label>
                <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)} style={{ borderRadius: '10px', padding: '0.75rem', background: 'var(--card-bg)', color: 'var(--text-primary)' }}>
                  <option value="Documents & Cards">Documents & Cards</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Keys">Keys & Keychains</option>
                  <option value="Bags & Books">Bags & Books</option>
                  <option value="Other Accessories">Other Accessories</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>SRM Campus</label>
                <select className="form-control" value={campus} onChange={(e) => setCampus(e.target.value)} style={{ borderRadius: '10px', padding: '0.75rem', background: 'var(--card-bg)', color: 'var(--text-primary)' }}>
                  {srmCampuses.map((camp) => <option key={camp} value={camp}>{camp}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Specific Location Where Lost/Found *</label>
              <input type="text" className="form-control" placeholder="e.g., Tech Park 4th Floor Lab 403, UB Library 1st floor" value={location} onChange={(e) => setLocation(e.target.value)} required style={{ borderRadius: '10px', padding: '0.75rem' }} />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Detailed Description *</label>
              <textarea className="form-control" placeholder="Describe markings, color, brand, condition, or stickers..." value={description} onChange={(e) => setDescription(e.target.value)} required style={{ borderRadius: '10px', padding: '0.75rem', minHeight: '80px', resize: 'vertical' }} />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Image (Optional)</label>
              <input type="text" className="form-control" placeholder="Paste picture URL here..." value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setUploadedImage(''); }} style={{ borderRadius: '10px', padding: '0.75rem' }} />

              <div style={{ display: 'flex', gap: 10, marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => uploadInputRef.current && uploadInputRef.current.click()}
                  className="nav-btn nav-btn-secondary"
                  style={{ borderRadius: 10, padding: '0.6rem 0.9rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <PlusCircle size={14} />
                  Upload from device
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current && cameraInputRef.current.click()}
                  className="nav-btn nav-btn-secondary"
                  style={{ borderRadius: 10, padding: '0.6rem 0.9rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <PlusCircle size={14} />
                  Take photo
                </button>
              </div>

              <input
                ref={(el) => (uploadInputRef.current = el)}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files?.[0])}
                style={{ display: 'none' }}
              />
              <input
                ref={(el) => (cameraInputRef.current = el)}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleImageUpload(e.target.files?.[0])}
                style={{ display: 'none' }}
              />

              {uploadedImage && (
                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src={uploadedImage} alt="Uploaded preview" style={{ width: '88px', height: '88px', objectFit: 'cover', borderRadius: '14px', border: '1px solid var(--glass-border)' }} />
                  <button type="button" onClick={() => setUploadedImage('')} className="nav-btn nav-btn-secondary" style={{ borderRadius: 10, padding: '0.6rem 0.9rem' }}>Remove photo</button>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
                Contact Information
              </h4>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Your Name *</label>
                  <input type="text" className="form-control" placeholder="e.g., Amit Kumar" value={contactName} onChange={(e) => setContactName(e.target.value)} required style={{ borderRadius: '10px', padding: '0.75rem' }} />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Contact Email / Phone *</label>
                  <input type="text" className="form-control" placeholder="e.g., amit_k@srmist.edu.in" value={contactDetails} onChange={(e) => setContactDetails(e.target.value)} required style={{ borderRadius: '10px', padding: '0.75rem' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="nav-btn nav-btn-secondary" onClick={() => setShowReportForm(false)} style={{ borderRadius: '10px' }}>
                Cancel
              </button>
              <button type="submit" className="nav-btn nav-btn-primary" style={{ borderRadius: '10px' }} disabled={submitting}>
                {submitting ? 'Saving…' : (editingReport ? 'Save Changes' : 'Submit Report')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="filter-bar" style={{ borderRadius: '16px', padding: '1.1rem 1.5rem', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button className={`cat-tab ${activeTab === 'All' ? 'active' : ''}`} onClick={() => setActiveTab('All')}>All Reports</button>
          <button className={`cat-tab ${activeTab === 'Lost' ? 'active' : ''}`} onClick={() => setActiveTab('Lost')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'block' }} />
            Lost Items
          </button>
          <button className={`cat-tab ${activeTab === 'Found' ? 'active' : ''}`} onClick={() => setActiveTab('Found')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'block' }} />
            Found Items
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              className="form-control"
              type="search"
              placeholder="Search item or location"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.2rem', minWidth: '220px' }}
            />
          </div>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Campus:</label>
          <select className="filter-select" value={selectedCampus} onChange={(e) => setSelectedCampus(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: '1.5px solid var(--glass-border)', background: 'var(--card-bg)', color: 'var(--text-primary)' }}>
            <option value="All">All Campuses</option>
            {srmCampuses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="listings-grid" style={{ marginTop: '2rem' }}>
        {loading && (
          <div className="empty-state glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1', textAlign: 'center' }}>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Loading reports from database…</p>
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="empty-state glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1', textAlign: 'center' }}>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>No lost or found reports yet. Be the first to file one!</p>
          </div>
        )}

        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="listing-card"
            style={{
              borderColor: item.type === 'Lost' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              boxShadow: item.type === 'Lost' ? '0 8px 24px -10px rgba(239, 68, 68, 0.1)' : '0 8px 24px -10px rgba(16, 185, 129, 0.1)'
            }}
          >
            <div className="listing-image-container" style={{ height: '170px' }}>
              <img src={item.image} alt={item.title} className="listing-image" />
              <div className="listing-badge-container">
                <span
                  className="listing-badge"
                  style={{
                    color: item.type === 'Lost' ? '#ef4444' : '#10b981',
                    background: item.type === 'Lost' ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
                    borderColor: item.type === 'Lost' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderRadius: '6px',
                    fontWeight: 800
                  }}
                >
                  {item.type}
                </span>
              </div>

              <span className="listing-campus-badge">{item.campus === 'Kattankulathur' ? 'KTR' : item.campus}</span>

              {isOwnReport(item) && (
                <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: '0.35rem' }}>
                  <button
                    className="fav-btn"
                    style={{ position: 'static', color: 'var(--primary-color)' }}
                    onClick={() => handleOpenEditForm(item)}
                    title="Edit report"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="fav-btn"
                    style={{ position: 'static', color: '#ef4444' }}
                    onClick={() => handleDeleteReport(item)}
                    title="Delete report"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="listing-info" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span className="listing-category" style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-light)', letterSpacing: '0.5px' }}>
                {item.category}
              </span>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {item.title}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <MapPin size={13} style={{ color: 'var(--primary-color)' }} />
                <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.location.split(',')[0]}</span>
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: item.type === 'Lost' ? '#ef4444' : '#10b981' }}>
                <Info size={12} />
                {item.type === 'Lost' ? 'Please contact the owner if found' : 'Please verify ownership before claiming'}
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0.25rem 0 0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.description}
              </p>

              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 500 }}>
                  <Calendar size={12} />
                  Reported: {item.createdAt}
                </span>

                <div className="glass-panel" style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)', fontWeight: 700 }}>
                    <User size={10} />
                    <span>{item.contactName}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
                    <Mail size={10} />
                    <span>{item.contactDetails}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
