import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase-config';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { MaxUsersModal } from './MaxUsersModal';

function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMaxUsersModal, setShowMaxUsersModal] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      try {
        await axios.post('https://w-306-mealy-server.vercel.app/api/users/register', {
          name: result.user.displayName,
          email: result.user.email
        }, {
          headers: { 
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        });
        navigate('/');
      } catch (apiError) {
        if (apiError.response?.status === 403) {
          setShowMaxUsersModal(true);
          await signOut(auth);
        } else {
          console.error('API Error:', apiError);
          setError('Failed to register user. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="max-w-md w-[90%] bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
          <h1 className="text-3xl font-bold text-center text-white mb-8 tracking-tight">
            W-306 Meal Tracker
          </h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center bg-gray-700 rounded-lg px-6 py-3.5 text-white font-medium 
            transition-all duration-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
            focus:ring-offset-gray-800 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            <div className="flex items-center justify-center">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <img
                    src="/google.png"
                    alt="Google"
                    className="w-5 h-5 mr-3"
                  />
                  <span className="text-sm">Sign in with Google</span>
                </>
              )}
            </div>
            
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </button>
        </div>
      </div>
      
      <MaxUsersModal 
        isOpen={showMaxUsersModal} 
        onClose={() => setShowMaxUsersModal(false)} 
      />
    </>
  );
}

export default Login;