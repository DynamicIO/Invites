import { useState } from 'react';
import { Users, Check, X, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import './GuestList.css';

function GuestList({ event }) {
  const [expanded, setExpanded] = useState(true);
  
  // Get guests with their RSVP status
  const getGuestsWithRsvp = () => {
    const guests = {
      going: [],
      notGoing: [],
      maybe: []
    };
    
    if (!event.rsvps || !event.invitedGuests) return guests;
    
    // Map through invited guests and get their RSVP status
    event.invitedGuests.forEach(guest => {
      const rsvpStatus = event.rsvps[guest.guestId];
      const guestInfo = {
        email: guest.email || 'Anonymous Guest',
        initials: guest.email ? guest.email.substring(0, 2).toUpperCase() : '??',
        addedAt: guest.addedAt
      };
      
      if (rsvpStatus === 'going') {
        guests.going.push(guestInfo);
      } else if (rsvpStatus === 'not-going') {
        guests.notGoing.push(guestInfo);
      } else if (rsvpStatus === 'maybe') {
        guests.maybe.push(guestInfo);
      }
    });
    
    return guests;
  };
  
  const guests = getGuestsWithRsvp();
  const totalResponses = guests.going.length + guests.notGoing.length + guests.maybe.length;

  if (totalResponses === 0) {
    return (
      <div className="guest-list glass-card animate-slide-up">
        <div className="guest-list-header" onClick={() => setExpanded(!expanded)}>
          <div className="header-left">
            <Users size={20} />
            <h3>Guest List</h3>
          </div>
          <span className="guest-count">No responses yet</span>
        </div>
        {expanded && (
          <p className="no-guests-message">
            Once guests RSVP to your event, they'll appear here.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="guest-list glass-card animate-slide-up">
      <div className="guest-list-header" onClick={() => setExpanded(!expanded)}>
        <div className="header-left">
          <Users size={20} />
          <h3>Guest List</h3>
        </div>
        <div className="header-right">
          <span className="guest-count">{totalResponses} response{totalResponses !== 1 ? 's' : ''}</span>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>
      
      {expanded && (
        <div className="guest-sections">
          {/* Going Section */}
          {guests.going.length > 0 && (
            <div className="guest-section">
              <div className="section-title going">
                <Check size={16} />
                <span>Going ({guests.going.length})</span>
              </div>
              <div className="guest-items">
                {guests.going.map((guest, index) => (
                  <div key={index} className="guest-item">
                    <div className="guest-avatar going">{guest.initials}</div>
                    <span className="guest-email">{guest.email}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Maybe Section */}
          {guests.maybe.length > 0 && (
            <div className="guest-section">
              <div className="section-title maybe">
                <HelpCircle size={16} />
                <span>Maybe ({guests.maybe.length})</span>
              </div>
              <div className="guest-items">
                {guests.maybe.map((guest, index) => (
                  <div key={index} className="guest-item">
                    <div className="guest-avatar maybe">{guest.initials}</div>
                    <span className="guest-email">{guest.email}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Not Going Section */}
          {guests.notGoing.length > 0 && (
            <div className="guest-section">
              <div className="section-title not-going">
                <X size={16} />
                <span>Not Going ({guests.notGoing.length})</span>
              </div>
              <div className="guest-items">
                {guests.notGoing.map((guest, index) => (
                  <div key={index} className="guest-item">
                    <div className="guest-avatar not-going">{guest.initials}</div>
                    <span className="guest-email">{guest.email}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GuestList;

