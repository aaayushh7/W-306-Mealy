// FoodStatusModal.jsx
import React from 'react';
import { X, AlertCircle } from 'lucide-react';

export const FoodStatusModal = ({ isOpen, onClose, users }) => {
  if (!isOpen) return null;

  // Group users by eaten status
  const { eatenUsers, notEatenUsers } = users.reduce(
    (acc, user) => {
      if (user.hasEaten) {
        acc.eatenUsers.push(user);
      } else {
        acc.notEatenUsers.push(user);
      }
      return acc;
    },
    { eatenUsers: [], notEatenUsers: [] }
  );

  // Determine current meal type based on time
  const getCurrentMeal = () => {
    const hour = new Date().getHours();
    return hour >= 17 || hour < 7 ? 'Dinner' : 'Lunch';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl max-w-lg w-full mx-4 p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Food Status Report</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Users who haven't eaten */}
          {notEatenUsers.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-medium">Haven't Eaten Yet</h3>
              </div>
              <div className="space-y-3">
                {notEatenUsers.map((user) => (
                  <div
                    key={user._id}
                    className="bg-gray-700/50 rounded-xl p-4 border border-gray-600"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-white">{user.name}</span>
                      <span className="text-sm text-gray-400">
                        Missed {getCurrentMeal()} on {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users who have eaten */}
          {eatenUsers.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-green-400">Have Eaten</h3>
              <div className="space-y-3">
                {eatenUsers.map((user) => (
                  <div
                    key={user._id}
                    className="bg-gray-700/50 rounded-xl p-4 border border-gray-600"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-white">{user.name}</span>
                      <span className="text-sm text-gray-400">
                        {user.lastEatenAt ? new Date(user.lastEatenAt).toLocaleTimeString() : 'Time not recorded'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// UserRanking.jsx
export const UserRanking = ({ users }) => {
  // Calculate missed meals count
  const userRankings = users
    .filter(user => !user.hasEaten)
    .map(user => ({
      ...user,
      missedMeals: 1 // This should be calculated from historical data
    }))
    .sort((a, b) => b.missedMeals - a.missedMeals);

  return (
    <div className="bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-6">Missed Meals Ranking</h2>
      
      {userRankings.length > 0 ? (
        <div className="space-y-4">
          {userRankings.map((user, index) => (
            <div
              key={user._id}
              className="bg-gray-700/50 rounded-xl p-4 border border-gray-600 transition-all hover:bg-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${
                    index === 0 ? 'text-red-400' : 
                    index === 1 ? 'text-orange-400' : 
                    index === 2 ? 'text-yellow-400' : 
                    'text-blue-400'
                  }`}>
                    #{index + 1}
                  </span>
                  <span className="font-medium text-white">{user.name}</span>
                </div>
                <span className="text-sm text-gray-400">
                  {user.missedMeals} missed {user.missedMeals === 1 ? 'meal' : 'meals'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-8">
          Everyone has eaten! 🎉
        </div>
      )}
    </div>
  );
};