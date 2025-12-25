import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import './EventPreview.css';

function EventPreview({ events, currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const event = events.find(e => e.id === id);
  
  if (!event) {
    return (
      <div className="event-preview-page">
        <p>Event not found</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  return (
    <div 
      className="event-preview-page"
      style={{
        backgroundImage: event.backgroundImage 
          ? `url(${event.backgroundImage})`
          : 'linear-gradient(135deg, #2d2535 0%, #1a2030 50%, #2a2520 100%)'
      }}
    >
      <div className="background-overlay"></div>
      
      <header className="preview-header">
        <button 
          className="btn btn-icon btn-secondary" 
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={24} />
        </button>
      </header>

      <div className="preview-content">
        <h1 className="preview-title">{event.title}</h1>
        <p className="preview-date">
          {new Date(event.startDate).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })} – {new Date(event.endDate).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })}
        </p>
      </div>
    </div>
  );
}

export default EventPreview;

