import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, ChevronDown, LogOut, User } from 'lucide-react';
import EventCard from '../components/EventCard';
import { logOut } from '../firebase';
import './Home.css';

function Home({ events, currentUser, user, requireAuth }) {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const upcomingEvents = events.filter(e => new Date(e.startDate) >= new Date());

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
        {upcomingEvents.length === 0 ? (
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
            {upcomingEvents.map((event, index) => (
              <EventCard 
                key={event.id} 
                event={event} 
                index={index}
                onClick={() => navigate(`/event/${event.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
