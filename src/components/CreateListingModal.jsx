import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Upload } from 'lucide-react';
import { srmCampuses, srmHostels, categories, srmMeetupHotspots } from '../data/mockData';
import { allSrmSubjectsList } from '../data/srmSubjects';
import { detectScam } from '../utils/aiSimulator';

export default function CreateListingModal({ isOpen, onClose, onSubmitListing, onUpdateListing, editingListing = null, userProfile, enableMeetupHotspot = false }) {
  if (!isOpen) return null;

  const isEditing = Boolean(editingListing);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [tradeType, setTradeType] = useState('Sell');
  const [condition, setCondition] = useState('Like New');
  const [description, setDescription] = useState('');
  const [campus, setCampus] = useState(srmCampuses[0]);
  const [hostel, setHostel] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [uploadedImage, setUploadedImage] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const uploadInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  
  const defaultPaperThumbnail = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=60';
  
  // Feature 1 & 2 states
  const [courseCode, setCourseCode] = useState('');
  const [meetupHotspot, setMeetupHotspot] = useState(srmMeetupHotspots[0]);
  const [subjectQuery, setSubjectQuery] = useState('');
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);

  const [scamResult, setScamResult] = useState(null);

  // Seller details
  const [sellerName, setSellerName] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');

  // Pre-fill seller details from the logged-in user profile or editing listing
  useEffect(() => {
    if (!isOpen) return;

    if (editingListing) {
      setTitle(editingListing.title || '');
      setCategory(editingListing.category || '');
      setPrice(editingListing.price ? String(editingListing.price) : '');
      setTradeType(editingListing.tradeType || 'Sell');
      setCondition(editingListing.condition || 'Like New');
      setDescription(editingListing.description || '');
      setCampus(editingListing.campus || srmCampuses[0]);
      setHostel(editingListing.hostel || '');
      setCourseCode(editingListing.courseCode || '');
      setMeetupHotspot(editingListing.meetupHotspot || srmMeetupHotspots[0]);
      setSellerName(editingListing.seller?.name || '');
      setSellerEmail(editingListing.seller?.email || '');
      setSellerPhone(editingListing.seller?.phone || '');
      setUploadedFileUrl(editingListing.fileUrl || '');
      setUploadedFileName(editingListing.fileName || '');
      if (editingListing.image?.startsWith('data:')) {
        setUploadedImage(editingListing.image);
        setCustomImageUrl('');
      } else {
        setUploadedImage('');
        setCustomImageUrl(editingListing.image || '');
      }
      return;
    }

    if (userProfile) {
      setSellerName(userProfile.name || '');
      setSellerEmail(userProfile.email || '');
      setSellerPhone(userProfile.phone || '');
      setCampus(userProfile.campus || srmCampuses[0]);
      setHostel(userProfile.hostel || '');
    }
  }, [userProfile, isOpen, editingListing]);

  // Dynamically set default hostel when campus changes (create mode only)
  useEffect(() => {
    if (isEditing) return;
    if (campus === 'Kattankulathur') {
      setHostel(srmHostels.Kattankulathur.boys[0]);
    } else if (srmHostels[campus]) {
      const firstGroup = srmHostels[campus].boys || srmHostels[campus];
      setHostel(firstGroup[0] || '');
    }
  }, [campus]);

  // Clear CT Test Papers file upload state when changing away from that category
  useEffect(() => {
    if (category !== 'CT Test Papers') {
      setUploadedFileName('');
      setUploadedFileUrl('');
    }
  }, [category]);

  // Run scam detection when key fields change
  useEffect(() => {
    if (title && description && category) {
      const result = detectScam(title, Number(price) || 0, description, category);
      setScamResult(result);
    } else {
      setScamResult(null);
    }
  }, [title, price, description, category]);

  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(String(reader.result || ''));
      setCustomImageUrl('');
      setUploadedFileName('');
      setUploadedFileUrl('');
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFileUrl(String(reader.result || ''));
      setUploadedFileName(file.name);
      setUploadedImage('');
      setCustomImageUrl('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isCTPaper = category === 'CT Test Papers';
    
    if (isCTPaper) {
      const existingFile = uploadedFileUrl || editingListing?.fileUrl || '';
      if (!description || !existingFile) {
        alert('Please fill in all required fields and upload a CT test paper file!');
        return;
      }
    } else {
      if (!title || !description) {
        alert("Please fill in all required fields!");
        return;
      }
    }

    const finalImage = uploadedImage || customImageUrl.trim() || (category === 'CT Test Papers' ? defaultPaperThumbnail : '');
    const finalTitle = isCTPaper && !isEditing ? `CT Test Paper - ${new Date().toLocaleDateString()}` : title;
    const finalFileUrl = uploadedFileUrl || editingListing?.fileUrl || '';
    const finalFileName = uploadedFileName || editingListing?.fileName || '';

    const listingTradeType = isCTPaper ? 'Free' : tradeType;
    const listingPrice = isCTPaper ? 0 : (tradeType === 'Free' ? 0 : Number(price) || 0);
    const sellerEmailValue = sellerEmail || userProfile?.email || '';
    const sellerNameValue = sellerName || userProfile?.name || 'SRM Student';
    const sellerPhoneValue = sellerPhone || userProfile?.phone || '';

    const newListing = {
      title: finalTitle,
      category,
      price: listingPrice,
      tradeType: listingTradeType,
      condition: isCTPaper ? 'Like New' : condition,
      description,
      campus: isCTPaper ? (userProfile?.campus || campus) : campus,
      hostel: isCTPaper ? (userProfile?.hostel || hostel) : hostel,
      courseCode: courseCode.trim().toUpperCase(),
      image: finalImage,
      fileUrl: finalFileUrl,
      fileName: finalFileName,
      meetupHotspot: enableMeetupHotspot ? meetupHotspot : editingListing?.meetupHotspot,
      seller: {
        name: sellerNameValue,
        email: sellerEmailValue,
        phone: sellerPhoneValue,
        verified: sellerEmailValue.toLowerCase().endsWith('@srmist.edu.in'),
        avatar: editingListing?.seller?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(sellerNameValue)}`
      }
    };

    if (isEditing) {
      onUpdateListing({ id: editingListing.id, ...newListing });
    } else {
      onSubmitListing(newListing);
    }
    
    // Reset Form
    setTitle('');
    setPrice('');
    setDescription('');
    setCustomImageUrl('');
    setUploadedImage('');
    setUploadedFileName('');
    setUploadedFileUrl('');
    setSellerName('');
    setSellerEmail('');
    setSellerPhone('');
    setCourseCode('');
    setSubjectQuery('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', borderRadius: '24px' }}>
        
        <div className="modal-header" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 850, letterSpacing: '-0.5px' }}>
            {isEditing ? 'Edit Listing' : 'List an Item for Trade'}
          </h3>
          <button className="modal-close-btn" onClick={onClose} style={{ borderRadius: '50%', padding: '0.4rem' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto', padding: '1.5rem 0' }}>
            
            {/* Basic Info */}
            {category !== 'CT Test Papers' && (
              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Item Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Casio FX-991EX Calculator, SRM Lab Coat"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{ borderRadius: '10px', padding: '0.75rem' }}
                />
              </div>
            )}

            {/* Course Code Autocomplete (only for CT Test Papers) */}
            {category === 'CT Test Papers' && (
              <div className="form-group" style={{ position: 'relative', marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  <span>SRM Course Code / Subject (Optional)</span>
                  {courseCode && <span style={{ color: '#8b5cf6', fontWeight: 800, fontSize: '0.75rem' }}>Selected: {courseCode}</span>}
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type code or subject name (e.g., DSA, 21CSC201J...)"
                  value={subjectQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSubjectQuery(val);
                    setCourseCode(val);
                    setShowSubjectSuggestions(true);
                  }}
                  onFocus={() => setShowSubjectSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSubjectSuggestions(false), 200)}
                  style={{ borderRadius: '10px', padding: '0.75rem' }}
                />
                {showSubjectSuggestions && subjectQuery.trim() && (
                  <div className="glass-panel" style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                    background: 'rgba(15,23,42,0.98)', border: '1.5px solid var(--glass-border)',
                    borderRadius: 12, maxHeight: 180, overflowY: 'auto', marginTop: 6,
                    boxShadow: 'var(--shadow-lg)', padding: '4px'
                  }}>
                    {allSrmSubjectsList.filter(s => 
                      s.code.toLowerCase().includes(subjectQuery.toLowerCase()) || 
                      s.name.toLowerCase().includes(subjectQuery.toLowerCase())
                    ).slice(0, 8).map((sub) => (
                      <div
                        key={sub.code}
                        onClick={() => {
                          setCourseCode(sub.code);
                          setSubjectQuery(`${sub.code} - ${sub.name}`);
                          setShowSubjectSuggestions(false);
                          if (!title.trim()) {
                            setTitle(`${sub.name} (${sub.code})`);
                          }
                        }}
                        style={{
                          padding: '10px 14px', cursor: 'pointer', borderRadius: 8,
                          fontSize: '0.85rem', color: '#fff', display: 'flex', justifyContent: 'space-between',
                          transition: 'all 0.2s'
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59,130,246,0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        <strong style={{ color: '#93c5fd' }}>{sub.code}</strong>
                        <span style={{ opacity: 0.85 }}>{sub.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Category</label>
                <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)} style={{ borderRadius: '10px', padding: '0.75rem', background: 'var(--card-bg)', color: 'var(--text-primary)' }}>
                  <option value="" disabled>Select category</option>
                  {categories.slice(1).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {category !== 'CT Test Papers' && (
                <>
                  <div className="form-group">
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Condition</label>
                    <select className="form-control" value={condition} onChange={(e) => setCondition(e.target.value)} style={{ borderRadius: '10px', padding: '0.75rem', background: 'var(--card-bg)', color: 'var(--text-primary)' }}>
                      <option value="New (Sealed)">New (Sealed)</option>
                      <option value="Like New">Like New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Needs repair">Needs repair</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {category !== 'CT Test Papers' && (
              <>
                {/* Trade & Pricing */}
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div className="form-group">
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Trade Type</label>
                    <select className="form-control" value={tradeType} onChange={(e) => setTradeType(e.target.value)} style={{ borderRadius: '10px', padding: '0.75rem', background: 'var(--card-bg)', color: 'var(--text-primary)' }}>
                      <option value="Sell">Sell / One-time Buy</option>
                      <option value="Rent">Rent out</option>
                      <option value="Free">Give Away (Free)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Price (₹) {tradeType === 'Free' ? '(Disabled)' : '*'}</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g., 500"
                      disabled={tradeType === 'Free'}
                      value={tradeType === 'Free' ? '' : price}
                      onChange={(e) => setPrice(e.target.value)}
                      required={tradeType !== 'Free'}
                      style={{ borderRadius: '10px', padding: '0.75rem' }}
                    />
                  </div>
                </div>

                {/* Campus & Hostel Selection */}
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div className="form-group">
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>SRM Campus</label>
                    <select className="form-control" value={campus} onChange={(e) => setCampus(e.target.value)} style={{ borderRadius: '10px', padding: '0.75rem', background: 'var(--card-bg)', color: 'var(--text-primary)' }}>
                      {srmCampuses.map((camp) => (
                        <option key={camp} value={camp}>{camp}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Hostel / Specific Meetup Location *</label>
                    <select className="form-control" value={hostel} onChange={(e) => setHostel(e.target.value)} style={{ borderRadius: '10px', padding: '0.75rem', background: 'var(--card-bg)', color: 'var(--text-primary)' }}>
                      {campus === 'Kattankulathur' ? (
                        <>
                          <optgroup label="Boys Hostels" style={{ background: 'var(--card-bg)', color: 'var(--text-primary)' }}>
                            {srmHostels.Kattankulathur.boys.map((host) => (
                              <option key={host} value={host}>{host}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Girls Hostels" style={{ background: 'var(--card-bg)', color: 'var(--text-primary)' }}>
                            {srmHostels.Kattankulathur.girls.map((host) => (
                              <option key={host} value={host}>{host}</option>
                            ))}
                          </optgroup>
                        </>
                      ) : srmHostels[campus] ? (
                        <>
                          <optgroup label="Boys Blocks" style={{ background: 'var(--card-bg)', color: 'var(--text-primary)' }}>
                            {srmHostels[campus].boys.map((host) => (
                              <option key={host} value={host}>{host}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Girls Blocks" style={{ background: 'var(--card-bg)', color: 'var(--text-primary)' }}>
                            {srmHostels[campus].girls.map((host) => (
                              <option key={host} value={host}>{host}</option>
                            ))}
                          </optgroup>
                        </>
                      ) : (
                        <option value="Main Campus Campus Plaza">Main Campus Plaza</option>
                      )}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Preferred Meetup Hotspot (for KTR) */}
            {enableMeetupHotspot && campus === 'Kattankulathur' && (
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Preferred SRM Campus Meetup Hotspot *</label>
                <select className="form-control" value={meetupHotspot} onChange={(e) => setMeetupHotspot(e.target.value)} style={{ borderRadius: '10px', padding: '0.75rem', background: 'var(--card-bg)', color: 'var(--text-primary)' }}>
                  {srmMeetupHotspots.map((spot) => (
                    <option key={spot} value={spot}>{spot}</option>
                  ))}
                </select>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.4rem', display: 'block' }}>
                  💡 Coordinate handovers at student landmarks to guarantee trade safety.
                </span>
              </div>
            )}

            {/* Image Selection Presets / Custom */}
            {category !== 'CT Test Papers' && (
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Item Photo</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Paste an image URL (optional)"
                  value={customImageUrl}
                  onChange={(e) => {
                    setCustomImageUrl(e.target.value);
                    setUploadedImage('');
                  }}
                  style={{ borderRadius: '10px', padding: '0.75rem' }}
                />

                <div style={{ display: 'flex', gap: 10, marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => uploadInputRef.current && uploadInputRef.current.click()}
                    className="nav-btn nav-btn-secondary"
                    style={{ borderRadius: 10, padding: '0.6rem 0.9rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  >
                    <Upload size={14} />
                    Upload from device
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current && cameraInputRef.current.click()}
                    className="nav-btn nav-btn-secondary"
                    style={{ borderRadius: 10, padding: '0.6rem 0.9rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  >
                    <Camera size={14} />
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
                    <img
                      src={uploadedImage}
                      alt="Uploaded preview"
                      style={{ width: '88px', height: '88px', objectFit: 'cover', borderRadius: '14px', border: '1px solid var(--glass-border)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setUploadedImage('')}
                      style={{
                        border: '1px solid var(--glass-border)',
                        background: 'transparent',
                        borderRadius: '10px',
                        padding: '0.6rem 0.9rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Upload size={14} />
                      Remove photo
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Description *</label>
              <textarea
                className="form-control"
                style={{ resize: 'vertical', minHeight: '80px', borderRadius: '10px', padding: '0.75rem' }}
                placeholder="Describe usage details, condition, availability time..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* CT Test Paper Upload (at the end) */}
            {category === 'CT Test Papers' && (
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Upload CT Test Paper *</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => uploadInputRef.current && uploadInputRef.current.click()}
                    className="nav-btn nav-btn-secondary"
                    style={{ borderRadius: 10, padding: '0.6rem 0.9rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  >
                    <Upload size={14} />
                    Upload paper file
                  </button>
                </div>
                <input
                  ref={(el) => (uploadInputRef.current = el)}
                  type="file"
                  accept="application/pdf,.pdf,.doc,.docx,.ppt,.pptx"
                  onChange={(e) => handleFileUpload(e.target.files?.[0])}
                  style={{ display: 'none' }}
                />
                {uploadedFileName && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.75rem 0.9rem', borderRadius: '14px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.04)' }}>
                      <strong>File:</strong> {uploadedFileName}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFileName('');
                        setUploadedFileUrl('');
                      }}
                      style={{
                        border: '1px solid var(--glass-border)',
                        background: 'transparent',
                        borderRadius: '10px',
                        padding: '0.6rem 0.9rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Upload size={14} />
                      Remove file
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── AI Scam Detection ── */}
            {scamResult && (
              <div style={{
                background: scamResult.safe ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                border: `1.5px solid ${scamResult.safe ? 'rgba(16,185,129,0.22)' : 'rgba(239,68,68,0.22)'}`,
                borderRadius: 14, padding: '12px 16px', marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{scamResult.safe ? '🛡️' : '⚠️'}</span>
                  <div>
                    <div style={{ color: scamResult.safe ? '#10b981' : '#ef4444', fontWeight: 800, fontSize: 13 }}>
                      {scamResult.safe ? 'Listing looks secure' : 'Listing warning flag!'}
                    </div>
                    <div style={{ color: 'var(--text-light)', fontSize: 11, marginTop: '2px' }}>
                      Security Trust Index: {scamResult.score}/100
                    </div>
                  </div>
                </div>
                {scamResult.flags.length > 0 && (
                  <ul style={{ margin: '8px 0 0', paddingLeft: 20, color: '#ef4444', fontSize: 12, lineHeight: 1.4 }}>
                    {scamResult.flags.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                )}
              </div>
            )}

            {category !== 'CT Test Papers' && (
              <>
                {/* Seller Contact Info */}
                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
                    Seller Information Check
                  </h4>
                  
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Your Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Rohan Verma"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      required
                      style={{ borderRadius: '10px', padding: '0.75rem' }}
                    />
                  </div>

                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>SRM Email ID *</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="e.g., rohan_v@srmist.edu.in"
                        value={sellerEmail}
                        onChange={(e) => setSellerEmail(e.target.value)}
                        required
                        style={{ borderRadius: '10px', padding: '0.75rem' }}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>WhatsApp Phone Number *</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="e.g., +91 9876543210"
                        value={sellerPhone}
                        onChange={(e) => setSellerPhone(e.target.value)}
                        required
                        style={{ borderRadius: '10px', padding: '0.75rem' }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>

          <div className="modal-footer" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
            <button type="button" className="nav-btn nav-btn-secondary" onClick={onClose} style={{ borderRadius: '10px' }}>
              Cancel
            </button>
            <button type="submit" className="nav-btn nav-btn-primary" style={{ borderRadius: '10px' }}>
              {isEditing ? 'Save Changes' : 'Create Listing'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
