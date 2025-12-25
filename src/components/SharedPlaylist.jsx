import { Music } from 'lucide-react';
import './SharedPlaylist.css';

function SharedPlaylist({ event }) {
  return (
    <div className="shared-playlist glass-card animate-slide-up stagger-5">
      <div className="playlist-header">
        <Music size={20} />
        <h3>Shared Playlist</h3>
      </div>
      <p className="playlist-description">
        Share a playlist with all your guests.
      </p>
      
      <div className="playlist-placeholder">
        <Music size={32} />
        <p>Coming soon</p>
      </div>
    </div>
  );
}

export default SharedPlaylist;

