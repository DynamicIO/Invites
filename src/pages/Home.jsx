import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, ChevronDown, LogOut, User, Sparkles } from 'lucide-react';
import EventCard from '../components/EventCard';
import { logOut } from '../firebase';
import { getGuestId } from '../utils/guestId';
import { featuredEvents } from '../data/featuredEvents';
import './Home.css';

function Home({ events, currentUser, user, requireAuth }) {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Get this device's guest ID
  const guestId = getGuestId();
  
  // Filter events to only show:
  // 1. Events where current user is the host (matched by email)
  // 2. Events where current user/device is in the invitedGuests list
  const myEvents = events.filter(event => {
    // Check if user is the host
    if (user && event.hostEmail === user.email) {
      return true;
    }
    
    // Check if user's email is in invited guests
    if (user && event.invitedGuests) {
      const isInvitedByEmail = event.invitedGuests.some(g => g.email === user.email);
      if (isInvitedByEmail) return true;
    }
    
    // Check if this device (guestId) is in invited guests
    if (event.invitedGuests) {
      const isInvitedByGuestId = event.invitedGuests.some(g => g.guestId === guestId);
      if (isInvitedByGuestId) return true;
    }
    
    // Check if this device has RSVP'd to the event
    if (event.rsvps && event.rsvps[guestId]) {
      return true;
    }
    
    return false;
  });
  
  // Filter for upcoming events only
  const upcomingEvents = myEvents.filter(e => new Date(`${e.startDate}T${e.startTime || '00:00'}`) >= new Date());

  // Filter for past events only
  const pastEvents = myEvents.filter(e => new Date(`${e.startDate}T${e.startTime || '00:00'}`) < new Date());

  // Get featured events that are upcoming
  const upcomingFeatured = featuredEvents.filter(e => new Date(`${e.startDate}T${e.startTime || '00:00'}`) >= new Date());

  // Get featured events that are past
  const pastFeatured = featuredEvents.filter(e => new Date(`${e.startDate}T${e.startTime || '00:00'}`) < new Date());

  const handleLogout = async () => {
    try {
      await logOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleAvatarClick = () => {
    if (user) {
      setShowUserMenu(!showUserMenu);
    } else {
      requireAuth(() => {});
    }
  };

  // Check if there's any content to show
  const hasContent = upcomingEvents.length > 0 || upcomingFeatured.length > 0 || pastEvents.length > 0 || pastFeatured.length > 0;

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="header-title">
          <h1>Upcoming</h1>
          <ChevronDown size={20} className="header-chevron" />
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-icon btn-secondary"
            onClick={() => navigate('/create')}
          >
            <Plus size={24} />
          </button>
          <div className="avatar-wrapper">
            <button 
              className={`avatar ${user ? '' : 'avatar-guest'}`}
              onClick={handleAvatarClick}
            >
              {user ? currentUser.initials : <User size={18} />}
            </button>
            
            {/* User Menu Dropdown */}
            {showUserMenu && user && (
              <>
                <div className="menu-backdrop" onClick={() => setShowUserMenu(false)} />
                <div className="user-menu glass-card">
                  <div className="user-info">
                    <div className="avatar avatar-lg">{currentUser.initials}</div>
                    <div className="user-details">
                      <p className="user-name">{currentUser.name}</p>
                      <p className="user-email">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="menu-divider" />
                  <button className="menu-item" onClick={handleLogout}>
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="home-content">
        {!hasContent ? (
          <div className="empty-state glass-card animate-scale-in">
            <div className="empty-icon">
              <Calendar size={32} strokeWidth={1.5} />
            </div>
            <h2>No Upcoming Events</h2>
            <p>Upcoming events, whether you're a host or a guest, will appear here.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/create')}
            >
              Create Event
            </button>
          </div>
        ) : (
          <div className="events-list">
            {/* Featured Events Section */}
            {upcomingFeatured.length > 0 && (
              <>
                <div className="section-label">
                  <Sparkles size={14} />
                  <span>Featured</span>
                </div>
                {upcomingFeatured.map((event, index) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    index={index}
                    isFeatured={true}
                    onClick={() => navigate(`/event/${event.id}`)}
                  />
                ))}
              </>
            )}
            
            {/* User's Events Section */}
            {upcomingEvents.length > 0 && (
              <>
                {upcomingFeatured.length > 0 && (
                  <div className="section-label">
                    <Calendar size={14} />
                    <span>Your Events</span>
                  </div>
                )}
                {upcomingEvents.map((event, index) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    index={index + upcomingFeatured.length}
                    onClick={() => navigate(`/event/${event.id}`)}
                  />
                ))}
              </>
            )}

            {/* Past Events Section */}
            {(pastEvents.length > 0 || pastFeatured.length > 0) && (
              <>
                <div className="section-label">
                  <Calendar size={14} />
                  <span>Past Events</span>
                </div>

                {/* Past Featured Events */}
                {pastFeatured.map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={index + upcomingEvents.length + upcomingFeatured.length}
                    isFeatured={true}
                    onClick={() => navigate(`/event/${event.id}`)}
                  />
                ))}

                {/* Past User's Events */}
                {pastEvents.map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={index + upcomingEvents.length + upcomingFeatured.length + pastFeatured.length}
                    onClick={() => navigate(`/event/${event.id}`)}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
