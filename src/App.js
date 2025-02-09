// src/App.js
import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import LessonPage from './components/LessonPage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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
        <Router>
          <div className="container mt-3">
            <h3>Welcome, {currentUser.email}!</h3>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/lesson/:id" element={<LessonPage />} />
              {/* Additional routes (e.g., coding challenge, dashboard) can be added here */}
            </Routes>
          </div>
        </Router>
      ) : (
        <Auth />
      )}
    </div>
  );
}

export default App;
