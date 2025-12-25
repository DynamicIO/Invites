import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCkS94D6iWg-7rDhslCJXxA8JLfehccOls",
  authDomain: "inviteusbackend.firebaseapp.com",
  projectId: "inviteusbackend",
  storageBucket: "inviteusbackend.firebasestorage.app",
  messagingSenderId: "814096595652",
  appId: "1:814096595652:web:551af9be8adecb9e3f6791",
  measurementId: "G-DQC0ZLNVSC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Events collection reference
const eventsCollection = collection(db, 'events');

// Create a new event
export const createEvent = async (event) => {
  const eventRef = doc(eventsCollection, event.id);
  await setDoc(eventRef, {
    ...event,
    createdAt: new Date().toISOString()
  });
  return event;
};

// Get a single event by ID
export const getEvent = async (eventId) => {
  const eventRef = doc(db, 'events', eventId);
  const eventSnap = await getDoc(eventRef);
  
  if (eventSnap.exists()) {
    return { id: eventSnap.id, ...eventSnap.data() };
  }
  return null;
};

// Get all events (for the current user - you can add filtering later)
export const getAllEvents = async () => {
  const querySnapshot = await getDocs(eventsCollection);
  const events = [];
  querySnapshot.forEach((doc) => {
    events.push({ id: doc.id, ...doc.data() });
  });
  return events;
};

// Update an event
export const updateEventInDb = async (eventId, updates) => {
  const eventRef = doc(db, 'events', eventId);
  await updateDoc(eventRef, updates);
};

// Delete an event
export const deleteEventFromDb = async (eventId) => {
  const eventRef = doc(db, 'events', eventId);
  await deleteDoc(eventRef);
};

export { db };
