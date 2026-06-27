import React, { useState, useEffect, useRef } from 'react';
import { srmMeetupHotspots } from '../data/mockData';
import { Calendar, ArrowUp, X, MessageCircle, Clock, ShieldCheck, Plus, FileText } from 'lucide-react';
import { api } from '../api/client';
import { deriveSharedKey, encryptMessage, decryptMessage } from '../utils/crypto';

export default function ChatModal({ listing, userProfile, onClose }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [sharedKey, setSharedKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Determine the "other user" ID. Buyers chat with the listing owner; sellers open a
  // specific buyer conversation from a message notification/conversation entry.
  const sellerUserId = listing.userId || listing.seller_id || listing.seller?.id || listing.user_id || 0;
  const explicitOtherUserId = listing.chatOtherUserId || listing.otherUserId || listing.conversationUserId;
  const otherUserId = Number(explicitOtherUserId || sellerUserId || 0);
  const otherUserName = listing.chatOtherUserName
    || listing.otherUserName
    || (otherUserId === sellerUserId ? listing.seller?.name : null)
    || 'Student';
  
  // Use the listing id as a string room key — works for both "lst-4" (mock) and 7 (real DB)
  const listingRoomId = String(listing.id);

  // Initialize E2EE shared key
  useEffect(() => {
    async function initCrypto() {
      try {
        const key = await deriveSharedKey(listingRoomId, userProfile.id, otherUserId);
        setSharedKey(key);
      } catch (err) {
        console.error("Failed to derive E2EE key:", err);
      }
    }
    if (userProfile?.id !== undefined && listingRoomId && otherUserId) {
      initCrypto();
    }
  }, [listingRoomId, userProfile.id, otherUserId]);

  // Fetch and poll messages
  const fetchMessages = async () => {
    if (!sharedKey) return;
    try {
      const data = await api.getChat(listingRoomId, otherUserId);
      if (data.messages) {
        const decryptedMessages = await Promise.all(
          data.messages.map(async (msg) => {
            const plaintext = await decryptMessage(msg.encryptedMessage, msg.iv, sharedKey);
            let parsedText = plaintext;
            let parsedImage = null;
            let parsedAttachment = null;
            
            // Try to parse JSON in case it contains an attachment
            try {
              const parsed = JSON.parse(plaintext);
              if (parsed.text !== undefined) parsedText = parsed.text;
              if (parsed.image !== undefined) parsedImage = parsed.image;
              if (parsed.attachment !== undefined) parsedAttachment = parsed.attachment;
            } catch (e) {
              // It's just plain text
            }
            
            return {
              id: msg.id,
              senderId: msg.senderId,
              text: parsedText,
              image: parsedImage,
              attachment: parsedAttachment,
              time: new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              isSystem: plaintext.startsWith('📅 Meetup Scheduled!')
            };
          })
        );
        setMessages(decryptedMessages);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sharedKey) {
      fetchMessages();
      pollIntervalRef.current = setInterval(fetchMessages, 3000);
    }
    return () => clearInterval(pollIntervalRef.current);
  }, [sharedKey]);

  // Scheduler States
  const [showScheduler, setShowScheduler] = useState(false);
  const [meetupSpot, setMeetupSpot] = useState(listing.meetupHotspot || srmMeetupHotspots[0]);
  const [meetupTime, setMeetupTime] = useState('');

  async function confirmMeetup() {
    if (!meetupTime.trim()) {
      alert("Please specify a meetup time!");
      return;
    }
    const systemText = `📅 Meetup Scheduled!\n📍 Location: ${meetupSpot}\n⏰ Time: ${meetupTime}`;
    await sendMessage(systemText);
    setShowScheduler(false);
    setMeetupTime('');
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close on Escape
  useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose]);

  async function sendMessage(textOverride, attachmentOverride) {
    const text = textOverride || message.trim();
    const attachment = attachmentOverride !== undefined ? attachmentOverride : (textOverride ? null : previewAttachment);
    if (!text && !attachment) return;
    if (!otherUserId || otherUserId === Number(userProfile.id)) {
      alert("Open a buyer conversation to reply to this listing.");
      return;
    }
    if (!sharedKey) return alert("E2EE Key not ready.");

    const payloadObj = {
      text,
      image: attachment?.isImage ? attachment.dataUrl : null,
      attachment: attachment || null
    };
    const plaintext = JSON.stringify(payloadObj);

    try {
      const { encryptedMessage, iv, signature } = await encryptMessage(plaintext, sharedKey);
      
      // Optimistic UI update
      const tempMsg = {
        id: Date.now(),
        senderId: userProfile.id,
        text,
        image: attachment?.isImage ? attachment.dataUrl : null,
        attachment,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        isSystem: text.startsWith('📅 Meetup')
      };
      setMessages(prev => [...prev, tempMsg]);
      setMessage('');
      setPreviewAttachment(null);

      await api.sendChatMessage(listingRoomId, otherUserId, { encryptedMessage, iv, signature });
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message securely.");
    }
  }

  function handleAttachmentUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewAttachment({
        name: file.name || 'Camera photo',
        type: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl: ev.target.result,
        isImage: (file.type || '').startsWith('image/')
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // Quick negotiation messages
  const quickMessages = [
    `Hi! Is ₹${Math.round(listing.price * 0.85)} okay?`,
    "Is this still available?",
    "Can we meet at SRM Tech Park?",
    "Can you show more photos?",
  ];

  const isMine = (msg) => msg.senderId === userProfile.id;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(10px)',
    }} onClick={onClose}>
      <div className="glass-panel" style={{
        background: 'linear-gradient(135deg, #090d16 0%, #111827 100%)',
        border: '1px solid var(--glass-border)',
        borderRadius: 24, width: '100%', maxWidth: 520,
        height: '80vh', display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--glass-shadow)',
        overflow: 'hidden',
        position: 'relative'
      }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--glass-border)',
          background: 'rgba(255,255,255,0.02)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0, color: 'white',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
          }}><MessageCircle size={20} /></div>
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {listing.title}
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem' }}>
                <ShieldCheck size={12} /> E2EE Secured
              </div>
            </div>
            <div style={{ color: 'var(--primary-color)', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>Chatting with {otherUserName}</span>
              <span>·</span>
              <span>₹{listing.price?.toLocaleString('en-IN')}</span>
            </div>
          </div>
          
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff',
            width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s'
          }}>✕</button>
        </div>

        {/* Messages List */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '20px',
          display: 'flex', flexDirection: 'column', gap: 12,
          background: 'rgba(0,0,0,0.1)'
        }}>
          {messages.length === 0 && (
            <div style={{
              textAlign: 'center', color: 'var(--text-light)',
              padding: '60px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <div style={{ fontSize: 44, animation: 'float 6s ease-in-out infinite' }}>👋</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>Start the conversation!</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '320px', lineHeight: '1.4', margin: 0 }}>
                Inquire about availability, negotiate pricing, or arrange a safe handover spot on campus.
              </p>
            </div>
          )}
          
          {messages.map((msg) => {
            // System messages (meetup scheduled etc.)
            if (msg.isSystem) {
              return (
                <div key={msg.id} style={{
                  alignSelf: 'center',
                  background: 'rgba(16,185,129,0.08)',
                  border: '1.5px solid rgba(16,185,129,0.25)',
                  borderRadius: 14,
                  padding: '12px 18px',
                  margin: '10px 0',
                  maxWidth: '90%',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)',
                  animation: 'paySuccess 0.3s ease'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700, whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: 9, color: '#10b981', fontWeight: 600, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    System Confirmation • {msg.time}
                  </div>
                </div>
              );
            }
            const mine = isMine(msg);
            // Derive avatar letter: for mine use current user's name, for others use seller name or fallback
            const avatarLetter = mine
              ? (userProfile?.name || 'Y').charAt(0).toUpperCase()
              : (otherUserName || listing.seller?.name || listing.sellerName || 'S').charAt(0).toUpperCase();
            return (
              <div key={msg.id} style={{
                display: 'flex',
                flexDirection: mine ? 'row-reverse' : 'row',
                gap: 8, alignItems: 'flex-end',
              }}>
                {/* Avatar */}
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: mine
                    ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                    : 'linear-gradient(135deg, #f59e0b, #e11d48)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 800, color: '#fff', flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {avatarLetter}
                </div>
                
                {/* Bubble */}
                <div style={{
                  maxWidth: '75%',
                  background: mine
                    ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                    : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${mine ? 'rgba(59,130,246,0.15)' : 'var(--glass-border)'}`,
                  borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '10px 14px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {msg.image && (
                    <img src={msg.image} alt="shared" style={{
                      maxWidth: '100%', borderRadius: 10, border: '1px solid var(--glass-border)', marginBottom: msg.text ? 8 : 0,
                    }} />
                  )}
                  {msg.attachment && !msg.attachment.isImage && (
                    <a
                      href={msg.attachment.dataUrl}
                      download={msg.attachment.name || 'attachment'}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        color: '#fff',
                        textDecoration: 'none',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 10,
                        padding: '8px 10px',
                        marginBottom: msg.text ? 8 : 0,
                        maxWidth: 220
                      }}
                    >
                      <FileText size={16} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem', fontWeight: 700 }}>
                        {msg.attachment.name || 'Attachment'}
                      </span>
                    </a>
                  )}
                  {msg.text && (
                    <div style={{ color: '#fff', fontSize: '0.88rem', lineHeight: 1.45, wordBreak: 'break-word' }}>{msg.text}</div>
                  )}
                  <div style={{
                    color: mine ? 'rgba(255,255,255,0.6)' : 'var(--text-light)',
                    fontSize: '0.62rem', marginTop: 4,
                    textAlign: mine ? 'right' : 'left',
                    fontWeight: 500
                  }}>{msg.time}</div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick replies & scheduler button */}
        <div style={{
          padding: '10px 16px', display: 'flex', gap: 8, overflowX: 'auto',
          borderTop: '1px solid var(--glass-border)', alignItems: 'center',
          background: 'rgba(255,255,255,0.01)', scrollbarWidth: 'none'
        }}>
          <button 
            onClick={() => setShowScheduler(true)}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none', borderRadius: 20, padding: '6px 14px',
              color: '#fff', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
              whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4,
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)'
            }}
            className="nav-btn"
          >
            📅 Schedule Meetup
          </button>
          
          {quickMessages.map((qm) => (
            <button 
              key={qm} 
              onClick={() => sendMessage(qm)} 
              style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1.5px solid rgba(59, 130, 246, 0.2)',
                borderRadius: 20, padding: '6px 14px',
                color: '#93c5fd', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
              className="nav-btn"
            >{qm}</button>
          ))}
        </div>

        {/* Attachment preview */}
        {previewAttachment && (
          <div style={{ padding: '8px 16px', position: 'relative', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            {previewAttachment.isImage ? (
              <img src={previewAttachment.dataUrl} alt="preview" style={{
                height: 70, width: 70, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--glass-border)'
              }} />
            ) : (
              <div style={{
                height: 52,
                maxWidth: 260,
                borderRadius: 10,
                border: '1px solid var(--glass-border)',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 12px'
              }}>
                <FileText size={18} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem', fontWeight: 700 }}>
                  {previewAttachment.name}
                </span>
              </div>
            )}
            <button onClick={() => setPreviewAttachment(null)} style={{
              position: 'absolute', top: 8, left: previewAttachment.isImage ? 76 : 268,
              background: '#f43f5e', border: 'none', borderRadius: '50%',
              width: 18, height: 18, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}><X size={10} /></button>
          </div>
        )}

        {/* Chat input footer */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--glass-border)',
          display: 'flex', gap: 8, alignItems: 'center',
          background: 'rgba(255,255,255,0.01)'
        }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAttachmentUpload}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 14, width: 48, height: 48,
              color: '#d1d5db', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.2s'
            }}
            title="Add file"
            className="nav-btn"
          >
            <Plus size={20} strokeWidth={2.2} />
          </button>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            style={{
              flex: 1, 
              background: 'rgba(255,255,255,0.05)',
              border: '1.5px solid var(--glass-border)',
              borderRadius: 12, 
              padding: '0.8rem 1rem',
              color: '#fff', 
              fontSize: '0.88rem',
              outline: 'none', 
              transition: 'all 0.2s'
            }}
          />

          <button
            onClick={() => sendMessage()}
            disabled={!message.trim() && !previewAttachment}
            style={{
              background: message.trim() || previewAttachment
                ? 'linear-gradient(180deg, #4f8df7 0%, #7c6dff 100%)'
                : 'rgba(255,255,255,0.05)',
              border: 'none', borderRadius: '50%', width: 48, height: 48,
              color: '#fff', cursor: message.trim() || previewAttachment ? 'pointer' : 'not-allowed',
              flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: message.trim() || previewAttachment ? '0 4px 10px rgba(59, 130, 246, 0.25)' : 'none'
            }}
            className="nav-btn"
          >
            <ArrowUp size={20} strokeWidth={2.25} />
          </button>
        </div>

        {/* Meetup Scheduler Overlay */}
        {showScheduler && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1000,
            background: 'rgba(9, 13, 22, 0.98)', backdropFilter: 'blur(16px)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: 32, boxSizing: 'border-box',
            animation: 'paySuccess 0.4s ease'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                background: 'rgba(16, 185, 129, 0.08)', 
                width: 54, height: 54, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 0.75rem',
                border: '1.5px dashed rgba(16, 185, 129, 0.3)'
              }}>
                <Calendar size={22} style={{ color: '#10b981' }} />
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.25rem', fontWeight: 850, letterSpacing: '-0.25px' }}>
                Campus Meetup Planner
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>
                Arrange a safe, public spot at Kattankulathur campus landmarks.
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ color: 'var(--text-light)', fontSize: '0.78rem', marginBottom: 6, display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Meetup Hotspot *
                </label>
                <select
                  value={meetupSpot}
                  onChange={(e) => setMeetupSpot(e.target.value)}
                  style={{
                    width: '100%', 
                    background: 'var(--card-bg)',
                    border: '1.5px solid var(--glass-border)', 
                    borderRadius: 12,
                    padding: '0.8rem 1rem', 
                    color: '#fff', 
                    fontSize: '0.88rem', 
                    cursor: 'pointer', 
                    outline: 'none'
                  }}
                >
                  {srmMeetupHotspots.map(spot => (
                    <option key={spot} value={spot} style={{ background: '#090d16', color: '#fff' }}>
                      {spot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ color: 'var(--text-light)', fontSize: '0.78rem', marginBottom: 6, display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Meetup Time / Slot *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="e.g. 1:30 PM (after B-slot class), 5 PM today"
                    value={meetupTime}
                    onChange={(e) => setMeetupTime(e.target.value)}
                    style={{
                      width: '100%', 
                      background: 'rgba(255,255,255,0.03)',
                      border: '1.5px solid var(--glass-border)', 
                      borderRadius: 12,
                      padding: '0.8rem 1.25rem 0.8rem 2.5rem', 
                      color: '#fff', 
                      fontSize: '0.88rem', 
                      outline: 'none'
                    }}
                    required
                  />
                  <Clock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowScheduler(false)}
                  style={{
                    flex: 1, 
                    background: 'rgba(255,255,255,0.06)', 
                    border: '1px solid var(--glass-border)',
                    borderRadius: 12, 
                    padding: '0.8rem', 
                    color: '#fff', 
                    fontSize: '0.9rem', 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  className="nav-btn"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmMeetup}
                  style={{
                    flex: 1, 
                    background: 'linear-gradient(135deg, #10b981, #059669)', 
                    border: 'none',
                    borderRadius: 12, 
                    padding: '0.8rem', 
                    color: '#fff', 
                    fontSize: '0.9rem', 
                    fontWeight: 800, 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                  }}
                  className="nav-btn"
                >
                  Confirm Meetup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
