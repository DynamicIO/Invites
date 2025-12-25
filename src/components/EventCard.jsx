import { format } from 'date-fns';
import { MapPin } from 'lucide-react';
import './EventCard.css';

function EventCard({ event, index, onClick }) {
  const formatDateRange = () => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    
    return `${format(start, 'EEE, MMM d')} – ${format(end, 'EEE, MMM d')}`;
  };

  return (
    <div 
      className={`event-card animate-slide-up stagger-${index + 1}`}
      onClick={onClick}
      style={{
        backgroundImage: event.backgroundImage 
          ? `linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%), url(${event.backgroundImage})`
          : undefined
      }}
    >
      <div className="event-card-content">
        <h3 className="event-title">{event.title}</h3>
        <p className="event-date">{formatDateRange()}</p>
        {event.location && (
          <div className="event-location">
            <MapPin size={14} />
            <span>{event.location}</span>
          </div>
        )}
        <div className="event-host">
          <div className="avatar avatar-sm">{event.hostInitials}</div>
          <span>Hosted by {event.hostName}</span>
        </div>
      </div>
    </div>
  );
}

export default EventCard;

