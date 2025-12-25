import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CalendarPlus, MapPin, Image, Loader, LogIn } from 'lucide-react';
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
        
        // Resize if larger than maxWidth
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

function CreateEvent({ addEvent, currentUser, user, showAuthModal }) {
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
  
  const [previewMode, setPreviewMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      try {
        // Compress the image to reduce size for localStorage
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

  const handleSubmit = () => {
    // Check auth before submitting
    if (!user) {
      showAuthModal();
      return;
    }

    if (!formData.title || !formData.startDate || !formData.endDate) {
      alert('Please fill in the required fields');
      return;
    }

    const event = {
      ...formData,
      hostName: currentUser.name,
      hostInitials: currentUser.initials,
      hostEmail: currentUser.email,
      guests: [],
      photos: [],
      rsvps: {},
      playlist: null,
      createdAt: new Date().toISOString()
    };

    addEvent(event);
    navigate('/');
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

  // If not logged in, show a prompt
  if (!user) {
    return (
      <div className="create-event-page not-logged-in">
        <div className="background-overlay"></div>
        <header className="create-header">
          <button className="btn btn-icon btn-secondary" onClick={() => navigate('/')}>
            <X size={20} />
          </button>
        </header>
        <div className="auth-prompt glass-card">
          <LogIn size={48} />
          <h2>Sign in to Create Events</h2>
          <p>You need to be logged in to create and manage events.</p>
          <button className="btn btn-accent" onClick={showAuthModal}>
            Sign In / Sign Up
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
      {/* Background overlay */}
      <div className="background-overlay"></div>
      
      {/* Header */}
      <header className="create-header">
        <button className="btn btn-icon btn-secondary" onClick={() => navigate('/')}>
          <X size={20} />
        </button>
        <button 
          className="preview-btn"
          onClick={() => setPreviewMode(!previewMode)}
        >
          Preview
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
        {/* Title */}
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

        {/* Date & Time */}
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

        {/* Location */}
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

        {/* Host Info */}
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
        <p className="cta-text">Ready to start inviting people?</p>
        <button className="btn btn-accent" onClick={handleSubmit}>
          Create Event
        </button>
      </div>
    </div>
  );
}

export default CreateEvent;
