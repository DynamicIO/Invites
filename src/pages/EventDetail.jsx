import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, X, HelpCircle, Share2, Loader, Pencil, Sparkles } from 'lucide-react';
import SharedAlbum from '../components/SharedAlbum';
import SharedPlaylist from '../components/SharedPlaylist';
import InviteModal from '../components/InviteModal';
import GuestList from '../components/GuestList';
import { getEvent, updateEventInDb } from '../firebase';
import { getGuestId } from '../utils/guestId';
import { featuredEvents } from '../data/featuredEvents';
import './EventDetail.css';

function EventDetail({ events, updateEvent, currentUser, user, showAuthModal }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchedEvent, setFetchedEvent] = useState(null);
  const [error, setError] = useState(null);
  const [myRsvp, setMyRsvp] = useState(null);
  const [pendingRsvp, setPendingRsvp] = useState(null); // Store pending RSVP if user needs to sign in
  
  // Get unique guest ID for this device
  const guestId = getGuestId();
  
  // Check if this is a featured event
  const featuredEvent = featuredEvents.find(e => e.id === id);
  
  // First try to find event in local state
  const localEvent = events.find(e => e.id === id);
  
  // If not found locally or in featured, fetch from Firebase
  useEffect(() => {
    const fetchEventFromFirebase = async () => {
      if (!localEvent && !featuredEvent && !fetchedEvent && !error) {
        setLoading(true);
        try {
          const firebaseEvent = await getEvent(id);
          if (firebaseEvent) {
            setFetchedEvent(firebaseEvent);
            // Get this guest's RSVP from the rsvps object
            if (firebaseEvent.rsvps && firebaseEvent.rsvps[guestId]) {
              setMyRsvp(firebaseEvent.rsvps[guestId]);
            }
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
  }, [id, localEvent, featuredEvent, fetchedEvent, error, guestId]);
  
  // Set myRsvp from local event if available
  useEffect(() => {
    const evt = localEvent || featuredEvent;
    if (evt && evt.rsvps && evt.rsvps[guestId]) {
      setMyRsvp(evt.rsvps[guestId]);
    }
  }, [localEvent, featuredEvent, guestId]);
  
  // Use local event, featured event, or fetched event
  const event = localEvent || featuredEvent || fetchedEvent;
  
  // Check if this is a featured/sample event
  const isFeaturedEvent = !!featuredEvent;

  const handleRsvp = async (status) => {
    // Check if user is signed in
    if (!user) {
      // Store the pending RSVP choice and show auth modal
      setPendingRsvp(status);
      showAuthModal();
      return;
    }
    
    // Proceed with RSVP
    submitRsvp(status);
  };
  
  const submitRsvp = async (status) => {
    // Update local state immediately
    setMyRsvp(status);
    setPendingRsvp(null);
    
    // Build updated rsvps object
    const currentRsvps = event.rsvps || {};
    const updatedRsvps = { ...currentRsvps, [guestId]: status };
    
    // Also add this guest to the invitedGuests list so they can see the event on their home
    const currentGuests = event.invitedGuests || [];
    const guestEntry = {
      guestId,
      email: currentUser.email || null,
      addedAt: new Date().toISOString()
    };
    
    // Check if guest is already in the list
    const guestExists = currentGuests.some(g => g.guestId === guestId);
    const updatedGuests = guestExists ? currentGuests : [...currentGuests, guestEntry];
    
    if (localEvent) {
      // If we have it locally, use the passed updateEvent function
      updateEvent(id, { rsvps: updatedRsvps, invitedGuests: updatedGuests });
    } else if (fetchedEvent) {
      // If fetched from Firebase, update directly
      try {
        await updateEventInDb(id, { rsvps: updatedRsvps, invitedGuests: updatedGuests });
        setFetchedEvent(prev => ({ ...prev, rsvps: updatedRsvps, invitedGuests: updatedGuests }));
      } catch (err) {
        console.error('Error updating RSVP:', err);
      }
    }
  };
  
  // If user signs in and had a pending RSVP, submit it
  useEffect(() => {
    if (user && pendingRsvp) {
      submitRsvp(pendingRsvp);
    }
  }, [user, pendingRsvp]);

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
  
  // Count RSVPs
  const getRsvpCounts = () => {
    if (!event || !event.rsvps) return { going: 0, notGoing: 0, maybe: 0 };
    
    const rsvps = Object.values(event.rsvps);
    return {
      going: rsvps.filter(r => r === 'going').length,
      notGoing: rsvps.filter(r => r === 'not-going').length,
      maybe: rsvps.filter(r => r === 'maybe').length
    };
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
  const rsvpCounts = getRsvpCounts();

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
        
        {/* Featured Badge */}
        {isFeaturedEvent && (
          <div className="featured-event-badge">
            <Sparkles size={14} />
            <span>Sample Event for Inspiration</span>
          </div>
        )}
        
        <header className="detail-header">
          <button 
            className="btn btn-icon btn-secondary" 
            onClick={() => navigate('/')}
          >
            <ChevronLeft size={24} />
          </button>
          {isHost && !isFeaturedEvent && (
            <div className="header-actions-right">
              <button 
                className="btn btn-icon btn-secondary"
                onClick={() => navigate(`/edit/${id}`)}
              >
                <Pencil size={18} />
              </button>
              <button 
                className="btn btn-icon btn-secondary"
                onClick={() => setShowInviteModal(true)}
              >
                <Share2 size={20} />
              </button>
            </div>
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
          className={`rsvp-btn ${myRsvp === 'going' ? 'active' : ''}`}
          onClick={() => handleRsvp('going')}
        >
          <Check size={18} />
          <span>Going</span>
          {rsvpCounts.going > 0 && <span className="rsvp-count">{rsvpCounts.going}</span>}
        </button>
        <button 
          className={`rsvp-btn ${myRsvp === 'not-going' ? 'active' : ''}`}
          onClick={() => handleRsvp('not-going')}
        >
          <X size={18} />
          <span>Not Going</span>
          {rsvpCounts.notGoing > 0 && <span className="rsvp-count">{rsvpCounts.notGoing}</span>}
        </button>
        <button 
          className={`rsvp-btn ${myRsvp === 'maybe' ? 'active' : ''}`}
          onClick={() => handleRsvp('maybe')}
        >
          <HelpCircle size={18} />
          <span>Maybe</span>
          {rsvpCounts.maybe > 0 && <span className="rsvp-count">{rsvpCounts.maybe}</span>}
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

      {/* Guest List - Only visible to host */}
      {isHost && !isFeaturedEvent && (
        <GuestList event={event} />
      )}

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
