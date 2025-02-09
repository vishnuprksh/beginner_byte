// src/App.js
import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in.
        setCurrentUser(user);
      } else {
        // No user is signed in.
        setCurrentUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className="App">
      {currentUser ? (
        <div className="container mt-3">
          <h3>Welcome, {currentUser.email}!</h3>
          {/* You can now render your main app pages */}
        </div>
      ) : (
        <Auth />
      )}
    </div>
  );
}

export default App;
