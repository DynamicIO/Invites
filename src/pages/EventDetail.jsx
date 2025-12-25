import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, X, HelpCircle, Share2, Loader } from 'lucide-react';
import SharedAlbum from '../components/SharedAlbum';
import SharedPlaylist from '../components/SharedPlaylist';
import InviteModal from '../components/InviteModal';
import { getEvent, updateEventInDb } from '../firebase';
import './EventDetail.css';

function EventDetail({ events, updateEvent, currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchedEvent, setFetchedEvent] = useState(null);
  const [error, setError] = useState(null);
  
  // First try to find event in local state
  const localEvent = events.find(e => e.id === id);
  
  // If not found locally, fetch from Firebase
  useEffect(() => {
    const fetchEventFromFirebase = async () => {
      if (!localEvent && !fetchedEvent && !error) {
        setLoading(true);
        try {
          const firebaseEvent = await getEvent(id);
          if (firebaseEvent) {
            setFetchedEvent(firebaseEvent);
          } else {
            setError('Event not found');
          }
        } catch (err) {
          console.error('Error fetching event:', err);
          setError('Failed to load event');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchEventFromFirebase();
  }, [id, localEvent, fetchedEvent, error]);
  
  // Use local event if available, otherwise use fetched event
  const event = localEvent || fetchedEvent;

  const handleRsvp = async (status) => {
    if (localEvent) {
      // If we have it locally, use the passed updateEvent function
      updateEvent(id, { rsvpStatus: status });
    } else if (fetchedEvent) {
      // If fetched from Firebase, update directly
      try {
        await updateEventInDb(id, { rsvpStatus: status });
        setFetchedEvent(prev => ({ ...prev, rsvpStatus: status }));
      } catch (err) {
        console.error('Error updating RSVP:', err);
      }
    }
  };

  const handleUpdateEvent = async (eventId, updates) => {
    if (localEvent) {
      updateEvent(eventId, updates);
    } else if (fetchedEvent) {
      try {
        await updateEventInDb(eventId, updates);
        setFetchedEvent(prev => ({ ...prev, ...updates }));
      } catch (err) {
        console.error('Error updating event:', err);
      }
    }
  };

  const formatDateRange = () => {
    if (!event) return '';
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

  // Show loading state
  if (loading) {
    return (
      <div className="event-detail-page">
        <div className="loading-state">
          <Loader size={32} className="spinning" />
          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || (!loading && !event)) {
    return (
      <div className="event-detail-page">
        <div className="error-state">
          <p>{error || 'Event not found'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Determine if current user is the host
  const isHost = event.hostEmail === currentUser.email;

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
          {isHost && (
            <button 
              className="btn btn-icon btn-secondary"
              onClick={() => setShowInviteModal(true)}
            >
              <Share2 size={20} />
            </button>
          )}
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
      <SharedAlbum event={event} updateEvent={handleUpdateEvent} />

      {/* Shared Playlist */}
      <SharedPlaylist event={event} />

      {/* Invite Button - Only show for host */}
      {isHost && (
        <div className="invite-footer">
          <p className="invite-prompt">Ready to start inviting people?</p>
          <button 
            className="btn btn-accent"
            onClick={() => setShowInviteModal(true)}
          >
            Invite Guests
          </button>
        </div>
      )}

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
