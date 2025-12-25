import { useState } from 'react';
import { Image, Plus, Loader } from 'lucide-react';
import './SharedAlbum.css';

// Compress and resize image to reduce storage size
const compressImage = (file, maxWidth = 600, quality = 0.6) => {
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

function SharedAlbum({ event, updateEvent }) {
  const [photos, setPhotos] = useState(event.photos || []);
  const [isUploading, setIsUploading] = useState(false);

  const handleAddPhoto = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      for (const file of files) {
        const compressedImage = await compressImage(file, 600, 0.6);
        setPhotos(prev => {
          const newPhotos = [...prev, compressedImage];
          if (updateEvent) {
            updateEvent(event.id, { photos: newPhotos });
          }
          return newPhotos;
        });
      }
    } catch (error) {
      console.error('Error compressing image:', error);
      alert('Error processing image. Please try a smaller image.');
    } finally {
      setIsUploading(false);
    }
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
          <label key={`empty-${index}`} className={`photo-placeholder ${isUploading ? 'uploading' : ''}`}>
            {isUploading && index === 0 ? (
              <Loader size={24} className="spinning" />
            ) : (
              <Image size={24} />
            )}
            <input 
              type="file" 
              accept="image/*"
              onChange={handleAddPhoto}
              disabled={isUploading}
              hidden
            />
          </label>
        ))}
        
        {photos.length >= 3 && (
          <label className={`photo-placeholder add-more ${isUploading ? 'uploading' : ''}`}>
            {isUploading ? (
              <Loader size={24} className="spinning" />
            ) : (
              <Plus size={24} />
            )}
            <input 
              type="file" 
              accept="image/*"
              multiple
              onChange={handleAddPhoto}
              disabled={isUploading}
              hidden
            />
          </label>
        )}
      </div>
    </div>
  );
}

export default SharedAlbum;
