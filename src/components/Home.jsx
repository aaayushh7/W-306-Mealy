import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getMessaging, getToken } from 'firebase/messaging';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase-config';
import { Loader2, LogOut, Utensils, AlertTriangle } from 'lucide-react';
import { FoodStatusModal, UserRanking, AwayModeButton } from './FoodStatusModals';

function Home({ user }) {
  const [users, setUsers] = useState([]);
  const [awayModeLoading, setAwayModeLoading] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
  const [schedule, setSchedule] = useState({ lunchTime: '12:00', dinnerTime: '21:00' });
  const [currentMeal, setCurrentMeal] = useState('');
  const [loading, setLoading] = useState(true);

  const currentUser = users.find(u => u.firebaseUid === user.uid);
  const isAway = currentUser?.isAway || false;

  const [currentMealPeriod, setCurrentMealPeriod] = useState(() => {
    return localStorage.getItem('currentMealPeriod') || 'none';
  });

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
          { headers: { Authorization: `Bearer ${await user.getIdToken()}` } }
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
    const updateMealStatus = async () => {
      const now = new Date();
      const hours = now.getHours();
      
      let newMealPeriod;
      if (hours >= 7 && hours < 17) {
        newMealPeriod = 'lunch';
      } else if (hours >= 17 || hours < 7) {
        newMealPeriod = 'dinner';
      } else {
        newMealPeriod = 'none';
      }
  
      // Only reset if period changes
      if (currentMealPeriod !== newMealPeriod) {
        try {
          await axios.post('https://w-306-mealy-server.vercel.app/api/users/reset-eaten', {}, {
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
          setCurrentMealPeriod(newMealPeriod);
          localStorage.setItem('currentMealPeriod', newMealPeriod);
        } catch (error) {
          console.error('Error resetting eating status:', error);
        }
      }
  
      setCurrentMeal(
        newMealPeriod === 'lunch' ? 'Lunch is ready' :
        newMealPeriod === 'dinner' ? 'Dinner is ready' :
        'No meal scheduled'
      );
    };
  
    updateMealStatus();
    const interval = setInterval(updateMealStatus, 60000);
    return () => clearInterval(interval);
  }, [schedule, user, currentMealPeriod]);

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
      await axios.post('https://w-306-mealy-server.vercel.app/api/report-food-finished', {}, {
        headers: { Authorization: `Bearer ${await user.getIdToken()}` }
      });
      setIsStatusModalOpen(true);
      setIsRankingModalOpen(true);
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

  const toggleAwayMode = async () => {
    try {
      setAwayModeLoading(true);
      await axios.post(
        'https://w-306-mealy-server.vercel.app/api/users/toggle-away',
        {},
        {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
            'Cache-Control': 'no-cache'
          }
        }
      );

      const response = await axios.get('https://w-306-mealy-server.vercel.app/api/users', {
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
          'Cache-Control': 'no-cache'
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error toggling away mode:', error);
    } finally {
      setAwayModeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-md mx-auto px-3 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Meal Tracker
          </h1>
          <button
            onClick={handleLogout}
            className="p-1.5 text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Current Status Section */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-4 mb-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Current Status</h2>
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs">
              {currentMeal}
            </span>
          </div>

          <div className="space-y-2">
            {Array.isArray(users) && users.map((flatmate) => (
              <div
                key={flatmate._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-gray-700/50 rounded-lg border border-gray-600"
              >
                <div className="flex items-center mb-1 sm:mb-0">
                  <span className="text-sm font-medium text-white">
                    {flatmate.name}
                  </span>
                  <span
                    className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      flatmate.hasEaten
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}
                  >
                    {flatmate.hasEaten ? 'Has eaten' : 'Not eaten yet'}
                  </span>
                </div>
                {flatmate.lastEatenAt && (
                  <span className="text-xs text-gray-400">
                    Last ate at {new Date(flatmate.lastEatenAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-2 mb-4">
          <AwayModeButton
            isAway={isAway}
            onToggle={toggleAwayMode}
            isLoading={awayModeLoading}
          />
          <button
            onClick={markAsAte}
            disabled={isAway || (Array.isArray(users) && users.find(u => u.firebaseUid === user.uid)?.hasEaten)}
            className="flex items-center justify-center gap-1.5 bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium
                     hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed 
                     active:transform active:scale-95 transition-all"
          >
            <Utensils className="w-4 h-4" />
            Mark as ate
          </button>
          
          <button
            onClick={reportFoodFinished}
            disabled={isAway}
            className="flex items-center justify-center gap-1.5 bg-red-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium
                     hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed 
                     active:transform active:scale-95 transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            Report food finished
          </button>
        </div>

        <UserRanking users={users} />

        <FoodStatusModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          users={users}
        />
      </div>
    </div>
  );
}

export default Home;