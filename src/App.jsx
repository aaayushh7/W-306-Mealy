import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, requestNotificationPermission } from './firebase-config';
import Login from './components/Login';
import Home from './components/Home';
import ScheduleSettings from './components/ScheduleSettings';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Request notification permission when user logs in
        const fcmToken = await requestNotificationPermission();
        if (fcmToken) {
          // You might want to send this token to your backend
          console.log('FCM Token:', fcmToken);
        }
      }
      setLoading(false);
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }


    return () => unsubscribe();
  }, []);



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="relative flex items-center justify-center">
          {/* Outer spinning ring with thicker border and better glow */}
          <div className="absolute animate-spin rounded-full h-16 w-16 border-4 border-t-indigo-500 border-r-transparent border-b-purple-500 border-l-transparent shadow-[0_0_15px_rgba(99,102,241,0.3)]"></div>

          {/* Inner spinning ring */}
          <div className="absolute animate-spin rounded-full h-12 w-12 border-2 border-r-indigo-400 border-l-purple-400 border-t-transparent border-b-transparent" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>

          {/* Center gradient pulse */}
          <div className="absolute rounded-full h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/"
            element={user ? <Home user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/settings"
            element={user ? <ScheduleSettings user={user} /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;