// Generate or retrieve a unique guest ID for this device/browser
// This allows each guest to have their own RSVP status

const GUEST_ID_KEY = 'invites-guest-id';

export const getGuestId = () => {
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  
  if (!guestId) {
    // Generate a unique ID
    guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  
  return guestId;
};

export const isHost = (event, currentUser) => {
  return event.hostEmail === currentUser.email;
};

