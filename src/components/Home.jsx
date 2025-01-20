import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getMessaging, getToken } from 'firebase/messaging';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase-config';
import { Loader2, LogOut, Utensils, AlertTriangle } from 'lucide-react';

function Home({ user }) {
  const [users, setUsers] = useState([]);
  const [schedule, setSchedule] = useState({ lunchTime: '12:00', dinnerTime: '21:00' });
  const [currentMeal, setCurrentMeal] = useState('');
  const [loading, setLoading] = useState(true);

  // Firebase messaging setup
  useEffect(() => {
    const setupFCM = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;
        const messaging = getMessaging();
        const token = await getToken(messaging);
        await axios.post('https://w-306-mealy-server.vercel.app/api/users/fcm-token', 
          { token }, 
          { headers: { Authorization: `Bearer ${await user.getIdToken()}` }}
        );
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };
    setupFCM();
  }, [user]);

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, scheduleResponse] = await Promise.all([
          axios.get('https://w-306-mealy-server.vercel.app/api/users', {
            headers: {
              Authorization: `Bearer ${await user.getIdToken()}`,
              'Cache-Control': 'no-cache'
            }
          }),
          axios.get('https://w-306-mealy-server.vercel.app/api/schedule', {
            headers: {
              Authorization: `Bearer ${await user.getIdToken()}`,
              'Cache-Control': 'no-cache'
            }
          })
        ]);

        setUsers(usersResponse.data);
        setSchedule(scheduleResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Meal status update
  useEffect(() => {
    const updateMealStatus = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const lunchStart = 7 * 60 + 30;
      const lunchEnd = 17 * 60;
      const dinnerStart = 17 * 60;
      const dinnerEnd = 7 * 60;
    
      if (currentTime >= lunchStart && currentTime < lunchEnd) {
        setCurrentMeal('Lunch is ready');
      } else if (currentTime >= dinnerStart || currentTime < dinnerEnd) {
        setCurrentMeal('Dinner is ready');
      } else {
        setCurrentMeal('No meal is currently scheduled');
      }
    };

    updateMealStatus();
    const interval = setInterval(updateMealStatus, 60000);
    return () => clearInterval(interval);
  }, [schedule]);

  const markAsAte = async () => {
    try {
      await axios.post('https://w-306-mealy-server.vercel.app/api/users/mark-eaten', {}, {
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      const response = await axios.get('https://w-306-mealy-server.vercel.app/api/users', {
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
          'Cache-Control': 'no-cache'
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error marking as ate:', error);
    }
  };

  const reportFoodFinished = async () => {
    try {
      const response = await axios.post('https://w-306-mealy-server.vercel.app/api/report-food-finished', {}, {
        headers: { Authorization: `Bearer ${await user.getIdToken()}` }
      });
      alert(response.data.message);
    } catch (error) {
      console.error('Error reporting food finished:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Meal Tracker
          </h1>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Current Status</h2>
            <span className="px-4 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
              {currentMeal}
            </span>
          </div>

          <div className="space-y-4">
            {Array.isArray(users) && users.map((flatmate) => (
              <div
                key={flatmate._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-700/50 rounded-xl border border-gray-600"
              >
                <div className="flex items-center mb-2 sm:mb-0">
                  <span className="font-medium text-base text-white">
                    {flatmate.name}
                  </span>
                  <span
                    className={`ml-3 px-3 py-1 text-sm rounded-full ${
                      flatmate.hasEaten
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}
                  >
                    {flatmate.hasEaten ? 'Has eaten' : 'Not eaten yet'}
                  </span>
                </div>
                {flatmate.lastEatenAt && (
                  <span className="text-sm text-gray-400">
                    Last ate at {new Date(flatmate.lastEatenAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={markAsAte}
            disabled={Array.isArray(users) && users.find(u => u.firebaseUid === user.uid)?.hasEaten}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-4 px-6 rounded-xl font-medium
                     hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed 
                     active:transform active:scale-95 transition-all"
          >
            <Utensils className="w-5 h-5" />
            Mark as ate
          </button>
          
          <button
            onClick={reportFoodFinished}
            className="flex items-center justify-center gap-2 bg-red-600 text-white py-4 px-6 rounded-xl font-medium
                     hover:bg-red-500 active:transform active:scale-95 transition-all"
          >
            <AlertTriangle className="w-5 h-5" />
            Report food finished
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;