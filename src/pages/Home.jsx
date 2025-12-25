import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, ChevronDown } from 'lucide-react';
import EventCard from '../components/EventCard';
import './Home.css';

function Home({ events, currentUser }) {
  const navigate = useNavigate();
  
  const upcomingEvents = events.filter(e => new Date(e.startDate) >= new Date());

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
          <div className="avatar">{currentUser.initials}</div>
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

