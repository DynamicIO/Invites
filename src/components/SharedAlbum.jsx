import { useState } from 'react';
import { Image, Plus } from 'lucide-react';
import './SharedAlbum.css';

function SharedAlbum({ event, updateEvent }) {
  const [photos, setPhotos] = useState(event.photos || []);

  const handleAddPhoto = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => {
          const newPhotos = [...prev, reader.result];
          if (updateEvent) {
            updateEvent(event.id, { photos: newPhotos });
          }
          return newPhotos;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="shared-album glass-card animate-slide-up stagger-4">
      <div className="album-header">
        <Image size={20} />
        <h3>Shared Album</h3>
      </div>
      <p className="album-description">
        With Shared Albums, guests can view and add their photos to the event.
      </p>
      
      <div className="photo-grid">
        {photos.map((photo, index) => (
          <div key={index} className="photo-item">
            <img src={photo} alt={`Event photo ${index + 1}`} />
          </div>
        ))}
        
        {/* Empty placeholders */}
        {Array.from({ length: Math.max(0, 3 - photos.length) }).map((_, index) => (
          <label key={`empty-${index}`} className="photo-placeholder">
            <Image size={24} />
            <input 
              type="file" 
              accept="image/*"
              onChange={handleAddPhoto}
              hidden
            />
          </label>
        ))}
        
        {photos.length >= 3 && (
          <label className="photo-placeholder add-more">
            <Plus size={24} />
            <input 
              type="file" 
              accept="image/*"
              multiple
              onChange={handleAddPhoto}
              hidden
            />
          </label>
        )}
      </div>
    </div>
  );
}

export default SharedAlbum;

