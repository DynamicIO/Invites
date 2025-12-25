import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import CreateEvent from './pages/CreateEvent';
import EventPreview from './pages/EventPreview';
import EventDetail from './pages/EventDetail';
import InviteModal from './components/InviteModal';
import './App.css';

function App() {
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('invites-events');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading events:', error);
      return [];
    }
  });
  
  const [currentUser] = useState({
    initials: 'BA',
    name: 'Ba aa',
    email: 'user@example.com'
  });

  useEffect(() => {
    try {
      localStorage.setItem('invites-events', JSON.stringify(events));
    } catch (error) {
      console.error('Error saving events to localStorage:', error);
      // If localStorage is full, try to save without images as fallback
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        try {
          const eventsWithoutImages = events.map(e => ({
            ...e,
            backgroundImage: null,
            photos: []
          }));
          localStorage.setItem('invites-events', JSON.stringify(eventsWithoutImages));
          alert('Storage limit reached. Images were not saved. Consider clearing old events.');
        } catch (fallbackError) {
          console.error('Fallback save also failed:', fallbackError);
        }
      }
    }
  }, [events]);

  const addEvent = (event) => {
    setEvents(prev => [...prev, { ...event, id: Date.now().toString() }]);
  };

  const updateEvent = (id, updates) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEvent = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

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
