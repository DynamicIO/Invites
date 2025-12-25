import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, CalendarPlus, MapPin, Image, Loader, Trash2 } from 'lucide-react';
import { getEvent, updateEventInDb, deleteEventFromDb } from '../firebase';
import './CreateEvent.css';

// Compress and resize image to reduce storage size
const compressImage = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

function EditEvent({ events, updateEvent, deleteEvent, currentUser, user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '12:00',
    endDate: '',
    endTime: '15:00',
    location: '',
    backgroundImage: null
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [event, setEvent] = useState(null);

  // Load event data
  useEffect(() => {
    const loadEvent = async () => {
      // First check local events
      const localEvent = events.find(e => e.id === id);
      
      if (localEvent) {
        setEvent(localEvent);
        setFormData({
          title: localEvent.title || '',
          description: localEvent.description || '',
          startDate: localEvent.startDate || '',
          startTime: localEvent.startTime || '12:00',
          endDate: localEvent.endDate || '',
          endTime: localEvent.endTime || '15:00',
          location: localEvent.location || '',
          backgroundImage: localEvent.backgroundImage || null
        });
        setLoading(false);
      } else {
        // Fetch from Firebase
        try {
          const firebaseEvent = await getEvent(id);
          if (firebaseEvent) {
            setEvent(firebaseEvent);
            setFormData({
              title: firebaseEvent.title || '',
              description: firebaseEvent.description || '',
              startDate: firebaseEvent.startDate || '',
              startTime: firebaseEvent.startTime || '12:00',
              endDate: firebaseEvent.endDate || '',
              endTime: firebaseEvent.endTime || '15:00',
              location: firebaseEvent.location || '',
              backgroundImage: firebaseEvent.backgroundImage || null
            });
          }
        } catch (err) {
          console.error('Error loading event:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadEvent();
  }, [id, events]);

  // Check if user is the host
  const isHost = event && user && event.hostEmail === user.email;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      try {
        const compressedImage = await compressImage(file, 800, 0.7);
        setFormData(prev => ({ ...prev, backgroundImage: compressedImage }));
      } catch (error) {
        console.error('Error compressing image:', error);
        alert('Error processing image. Please try a smaller image.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.startDate || !formData.endDate) {
      alert('Please fill in the required fields');
      return;
    }

    setSaving(true);
    
    try {
      const updates = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        startTime: formData.startTime,
        endDate: formData.endDate,
        endTime: formData.endTime,
        location: formData.location,
        backgroundImage: formData.backgroundImage,
        updatedAt: new Date().toISOString()
      };
      
      await updateEventInDb(id, updates);
      updateEvent(id, updates);
      navigate(`/event/${id}`);
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEventFromDb(id);
      deleteEvent(id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const formatPreviewDate = () => {
    if (!formData.startDate || !formData.endDate) return 'Select dates';
    
    const start = new Date(`${formData.startDate}T${formData.startTime}`);
    const end = new Date(`${formData.endDate}T${formData.endTime}`);
    
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const startStr = start.toLocaleDateString('en-US', options);
    const endStr = end.toLocaleDateString('en-US', options);
    
    return `${startStr} at ${formData.startTime} – ${endStr} at ${formData.endTime}`;
  };

  if (loading) {
    return (
      <div className="create-event-page">
        <div className="background-overlay"></div>
        <div className="loading-state">
          <Loader size={32} className="spinning" />
          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="create-event-page">
        <div className="background-overlay"></div>
        <div className="error-state">
          <p>Event not found</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!isHost) {
    return (
      <div className="create-event-page">
        <div className="background-overlay"></div>
        <div className="error-state">
          <p>Only the event host can edit this event</p>
          <button className="btn btn-primary" onClick={() => navigate(`/event/${id}`)}>
            Back to Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="create-event-page"
      style={{
        backgroundImage: formData.backgroundImage 
          ? `url(${formData.backgroundImage})`
          : 'linear-gradient(135deg, #2d2535 0%, #1a2030 50%, #2a2520 100%)'
      }}
    >
      <div className="background-overlay"></div>
      
      {/* Header */}
      <header className="create-header">
        <button className="btn btn-icon btn-secondary" onClick={() => navigate(`/event/${id}`)}>
          <X size={20} />
        </button>
        <button 
          className="btn btn-icon btn-secondary delete-btn"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 size={20} />
        </button>
      </header>

      {/* Background upload button */}
      <div className="background-upload">
        <label className="upload-btn">
          {isUploading ? (
            <>
              <Loader size={16} className="spinning" />
              Uploading...
            </>
          ) : (
            <>
              <Image size={16} />
              Edit Background
            </>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload}
            disabled={isUploading}
            hidden
          />
        </label>
      </div>

      {/* Event Form */}
      <div className="event-form-container">
        <div className="form-section title-section glass-card">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Event Title"
            className="title-input"
          />
        </div>

        <div className="form-section glass-card">
          <div className="section-header">
            <CalendarPlus size={20} />
          </div>
          <div className="date-time-preview">
            {formatPreviewDate()}
          </div>
          <div className="date-time-inputs">
            <div className="input-group">
              <label>Start</label>
              <div className="datetime-row">
                <input 
                  type="date" 
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
                <input 
                  type="time" 
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="input-group">
              <label>End</label>
              <div className="datetime-row">
                <input 
                  type="date" 
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                />
                <input 
                  type="time" 
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-section glass-card">
          <div className="section-header">
            <MapPin size={20} />
          </div>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
            className="location-input"
          />
        </div>

        <div className="form-section host-section glass-card">
          <div className="avatar">{currentUser.initials}</div>
          <p className="hosted-by">Hosted by {currentUser.name}</p>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add a description for your guests..."
            rows={3}
          />
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="create-footer">
        <button 
          className="btn btn-accent" 
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader size={18} className="spinning" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="delete-modal glass-card" onClick={e => e.stopPropagation()}>
            <h3>Delete Event?</h3>
            <p>This action cannot be undone. All event data will be permanently deleted.</p>
            <div className="delete-modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditEvent;

