import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import EventPreview from './pages/EventPreview';
import EventDetail from './pages/EventDetail';
import AuthModal from './components/AuthModal';
import ScrollToTop from './components/ScrollToTop';
import { createEvent, getAllEvents, updateEventInDb, deleteEventFromDb, onAuthChange, getUserEvents } from './firebase';
import './App.css';

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRedirect, setAuthRedirect] = useState(null); // Where to go after auth

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          initials: getInitials(firebaseUser.displayName || firebaseUser.email)
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Helper to get initials from name or email
  const getInitials = (nameOrEmail) => {
    if (!nameOrEmail) return '??';
    const parts = nameOrEmail.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nameOrEmail.substring(0, 2).toUpperCase();
  };

  // Load events from Firebase on mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        // Load all events (we can filter later if needed)
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
  }, [user]); // Reload when user changes

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

  // Require auth for certain actions
  const requireAuth = (callback, redirectPath = null) => {
    if (user) {
      callback();
    } else {
      setAuthRedirect(redirectPath);
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    if (authRedirect) {
      // Navigation will be handled by the component
      setAuthRedirect(null);
    }
  };

  // Current user object for components
  const currentUser = user || {
    initials: '??',
    name: 'Guest',
    email: ''
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
      <ScrollToTop />
      <div className="app-container">
        <Routes>
          <Route 
            path="/" 
            element={
              <Home 
                events={events} 
                currentUser={currentUser}
                user={user}
                requireAuth={requireAuth}
              />
            } 
          />
          <Route 
            path="/create" 
            element={
              <CreateEvent 
                addEvent={addEvent} 
                currentUser={currentUser}
                user={user}
                requireAuth={requireAuth}
                showAuthModal={() => setShowAuthModal(true)}
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
                user={user}
                showAuthModal={() => setShowAuthModal(true)}
              />
            } 
          />
          <Route 
            path="/edit/:id" 
            element={
              <EditEvent 
                events={events} 
                updateEvent={updateEvent}
                deleteEvent={deleteEvent}
                currentUser={currentUser}
                user={user}
              />
            } 
          />
        </Routes>

        {/* Auth Modal */}
        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)}
            onSuccess={handleAuthSuccess}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
