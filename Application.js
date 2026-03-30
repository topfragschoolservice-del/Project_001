import React, { useState, useEffect } from 'react';
import authService from './authService.js';
import api from './api.js';

/**
 * The root Application component that handles session initialization.
 */
const Application = () => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      const token = authService.getAccessToken();
      const storedUser = authService.getCurrentUser();

      // Only attempt restoration if we have a token and user in storage
      if (token && storedUser) {
        try {
          // Fetch fresh user data from server to verify the session
          const response = await api.get('/users/me');
          setUser(response.data.data.user);
        } catch (error) {
          // If fetching profile fails (e.g. token expired and refresh failed),
          // the session is invalid.
          setUser(null);
        }
      }
      
      setIsInitializing(false);
    };

    initApp();
  }, []);

  if (isInitializing) {
    return <div className="loading-container">Loading session...</div>;
  }

  return (
    <div className="app-container">
      <h1>Smart School Transport</h1>
      {user ? <p>Welcome, {user.name} ({user.role})</p> : <p>Please log in.</p>}
      {/* This is where your Router and Page components would go */}
    </div>
  );
};

export default Application;