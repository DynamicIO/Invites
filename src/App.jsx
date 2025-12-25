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
    const saved = localStorage.getItem('invites-events');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentUser] = useState({
    initials: 'BA',
    name: 'Ba aa',
    email: 'user@example.com'
  });

  useEffect(() => {
    localStorage.setItem('invites-events', JSON.stringify(events));
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
