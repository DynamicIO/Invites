import { useState } from 'react';
import { X, Mail, MessageCircle, Copy, Check, Link } from 'lucide-react';
import './InviteModal.css';

function InviteModal({ event, onClose }) {
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [sentEmails, setSentEmails] = useState([]);

  const eventUrl = `${window.location.origin}/event/${event.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleEmailInvite = () => {
    if (!email) return;
    
    const subject = encodeURIComponent(`You're invited to ${event.title}!`);
    const body = encodeURIComponent(
      `Hi there!\n\n` +
      `You've been invited to "${event.title}".\n\n` +
      `📅 Date: ${event.startDate} - ${event.endDate}\n` +
      `📍 Location: ${event.location || 'TBD'}\n\n` +
      `${event.description || ''}\n\n` +
      `View the event and RSVP here:\n${eventUrl}\n\n` +
      `Hope to see you there!\n` +
      `- ${event.hostName}`
    );
    
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
    setSentEmails(prev => [...prev, email]);
    setEmail('');
  };

  const handleMessageInvite = () => {
    const text = encodeURIComponent(
      `You're invited to "${event.title}"! 🎉\n\n` +
      `📅 ${event.startDate} - ${event.endDate}\n` +
      `📍 ${event.location || 'Location TBD'}\n\n` +
      `RSVP here: ${eventUrl}`
    );
    
    // Try SMS on mobile, fallback to copying
    if (/Android|iPhone/i.test(navigator.userAgent)) {
      window.open(`sms:?body=${text}`);
    } else {
      navigator.clipboard.writeText(decodeURIComponent(text));
      alert('Invite message copied to clipboard!');
    }
  };

  const handleWhatsAppInvite = () => {
    const text = encodeURIComponent(
      `You're invited to "${event.title}"! 🎉\n\n` +
      `📅 ${event.startDate} - ${event.endDate}\n` +
      `📍 ${event.location || 'Location TBD'}\n\n` +
      `RSVP here: ${eventUrl}`
    );
    
    window.open(`https://wa.me/?text=${text}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="invite-modal glass-card animate-scale-in" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Invite Guests</h2>
          <button className="btn btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className="modal-content">
          {/* Copy Link */}
          <div className="invite-section">
            <h3>Share Link</h3>
            <div className="link-copy-row">
              <div className="link-display">
                <Link size={16} />
                <span>{eventUrl}</span>
              </div>
              <button 
                className={`btn btn-secondary copy-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopyLink}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Email Invite */}
          <div className="invite-section">
            <h3>Invite via Email</h3>
            <div className="email-input-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
              />
              <button 
                className="btn btn-accent"
                onClick={handleEmailInvite}
                disabled={!email}
              >
                <Mail size={16} />
                Send
              </button>
            </div>
            {sentEmails.length > 0 && (
              <div className="sent-emails">
                <p>Invites sent to:</p>
                {sentEmails.map((e, i) => (
                  <span key={i} className="sent-email">{e}</span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Share Buttons */}
          <div className="invite-section">
            <h3>Quick Share</h3>
            <div className="share-buttons">
              <button className="share-btn message" onClick={handleMessageInvite}>
                <MessageCircle size={24} />
                <span>Message</span>
              </button>
              <button className="share-btn whatsapp" onClick={handleWhatsAppInvite}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InviteModal;

