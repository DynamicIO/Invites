import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, X, HelpCircle, Image, Music, Share2, Mail, MessageCircle } from 'lucide-react';
import SharedAlbum from '../components/SharedAlbum';
import SharedPlaylist from '../components/SharedPlaylist';
import InviteModal from '../components/InviteModal';
import './EventDetail.css';

function EventDetail({ events, updateEvent, currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  const event = events.find(e => e.id === id);
  
  if (!event) {
    return (
      <div className="event-detail-page">
        <div className="error-state">
          <p>Event not found</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const handleRsvp = (status) => {
    updateEvent(id, { rsvpStatus: status });
  };

  const formatDateRange = () => {
    const startDate = new Date(`${event.startDate}T${event.startTime || '12:00'}`);
    const endDate = new Date(`${event.endDate}T${event.endTime || '15:00'}`);
    
    const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    const timeOptions = { hour: 'numeric', minute: '2-digit' };
    
    const startDateStr = startDate.toLocaleDateString('en-US', dateOptions);
    const startTimeStr = startDate.toLocaleTimeString('en-US', timeOptions);
    const endDateStr = endDate.toLocaleDateString('en-US', dateOptions);
    const endTimeStr = endDate.toLocaleTimeString('en-US', timeOptions);
    
    return `${startDateStr} at ${startTimeStr} – ${endDateStr} at ${endTimeStr}`;
  };

  return (
    <div className="event-detail-page">
      {/* Hero Section */}
      <div 
        className="event-hero"
        style={{
          backgroundImage: event.backgroundImage 
            ? `url(${event.backgroundImage})`
            : 'linear-gradient(135deg, #2d2535 0%, #1a2030 50%, #2a2520 100%)'
        }}
      >
        <div className="hero-overlay"></div>
        
        <header className="detail-header">
          <button 
            className="btn btn-icon btn-secondary" 
            onClick={() => navigate('/')}
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            className="btn btn-icon btn-secondary"
            onClick={() => setShowInviteModal(true)}
          >
            <Share2 size={20} />
          </button>
        </header>

        <div className="hero-content">
          <h1 className="event-title animate-slide-up">{event.title}</h1>
          <p className="event-date animate-slide-up stagger-1">{formatDateRange()}</p>
        </div>
      </div>

      {/* RSVP Section */}
      <div className="rsvp-section glass-card animate-slide-up stagger-2">
        <button 
          className={`rsvp-btn ${event.rsvpStatus === 'going' ? 'active' : ''}`}
          onClick={() => handleRsvp('going')}
        >
          <Check size={18} />
          <span>Going</span>
        </button>
        <button 
          className={`rsvp-btn ${event.rsvpStatus === 'not-going' ? 'active' : ''}`}
          onClick={() => handleRsvp('not-going')}
        >
          <X size={18} />
          <span>Not Going</span>
        </button>
        <button 
          className={`rsvp-btn ${event.rsvpStatus === 'maybe' ? 'active' : ''}`}
          onClick={() => handleRsvp('maybe')}
        >
          <HelpCircle size={18} />
          <span>Maybe</span>
        </button>
      </div>

      {/* Host Info */}
      <div className="host-section glass-card animate-slide-up stagger-3">
        <div className="avatar">{event.hostInitials}</div>
        <p className="hosted-by">Hosted by {event.hostName}</p>
        {event.description && (
          <p className="event-description">{event.description}</p>
        )}
      </div>

      {/* Shared Album */}
      <SharedAlbum event={event} updateEvent={updateEvent} />

      {/* Shared Playlist */}
      <SharedPlaylist event={event} />

      {/* Invite Button */}
      <div className="invite-footer">
        <p className="invite-prompt">Ready to start inviting people?</p>
        <button 
          className="btn btn-accent"
          onClick={() => setShowInviteModal(true)}
        >
          Invite Guests
        </button>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal 
          event={event}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}

export default EventDetail;

