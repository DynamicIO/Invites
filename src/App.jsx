import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import CreateEvent from './pages/CreateEvent';
import EventPreview from './pages/EventPreview';
import EventDetail from './pages/EventDetail';
import { createEvent, getAllEvents, updateEventInDb, deleteEventFromDb } from './firebase';
import './App.css';

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentUser] = useState({
    initials: 'BA',
    name: 'Ba aa',
    email: 'user@example.com'
  });

  // Load events from Firebase on mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const firebaseEvents = await getAllEvents();
        setEvents(firebaseEvents);
      } catch (error) {
        console.error('Error loading events from Firebase:', error);
        // Fallback to localStorage if Firebase fails
        try {
          const saved = localStorage.getItem('invites-events');
          if (saved) setEvents(JSON.parse(saved));
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
  }, []);

  // Also save to localStorage as backup
  useEffect(() => {
    if (!loading && events.length > 0) {
      try {
        // Save without large images to avoid quota issues
        const eventsForLocal = events.map(e => ({
          ...e,
          backgroundImage: null,
          photos: []
        }));
        localStorage.setItem('invites-events', JSON.stringify(eventsForLocal));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [events, loading]);

  const addEvent = async (event) => {
    const newEvent = { ...event, id: Date.now().toString() };
    
    // Optimistically update UI
    setEvents(prev => [...prev, newEvent]);
    
    // Save to Firebase
    try {
      await createEvent(newEvent);
    } catch (error) {
      console.error('Error saving event to Firebase:', error);
      alert('Event created locally. Cloud sync failed - check your internet connection.');
    }
  };

  const updateEvent = async (id, updates) => {
    // Optimistically update UI
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    
    // Update in Firebase
    try {
      await updateEventInDb(id, updates);
    } catch (error) {
      console.error('Error updating event in Firebase:', error);
    }
  };

  const deleteEvent = async (id) => {
    // Optimistically update UI
    setEvents(prev => prev.filter(e => e.id !== id));
    
    // Delete from Firebase
    try {
      await deleteEventFromDb(id);
    } catch (error) {
      console.error('Error deleting event from Firebase:', error);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route 
            path="/" 
            element={<Home events={events} currentUser={currentUser} />} 
          />
          <Route 
            path="/create" 
            element={
              <CreateEvent 
                addEvent={addEvent} 
                currentUser={currentUser} 
              />
            } 
          />
          <Route 
            path="/preview/:id" 
            element={
              <EventPreview 
                events={events} 
                currentUser={currentUser}
              />
            } 
          />
          <Route 
            path="/event/:id" 
            element={
              <EventDetail 
                events={events} 
                updateEvent={updateEvent}
                currentUser={currentUser}
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
