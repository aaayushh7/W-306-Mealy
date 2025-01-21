import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Check for max users error in localStorage
    const maxUsersError = localStorage.getItem('maxUsersError');
    if (maxUsersError === 'true') {
      setShowMaxUsersModal(true);
      localStorage.removeItem('maxUsersError');
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(''); // Clear any previous errors

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      await registerUser(result.user, idToken);
    } catch (error) {
      console.error('Sign-in error:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (user, idToken) => {
    try {
      const response = await axios.post(
        'https://w-306-mealy-server.vercel.app/api/users/register',
        {
          name: user.displayName,
          email: user.email
        },
        {
          headers: { Authorization: `Bearer ${idToken}` }
        }
      );

      if (response.status === 200) {
        navigate('/');
      }
    } catch (error) {
      // Sign out the user if registration fails
      await signOut(auth);

      if (error.response?.data?.error === 'Maximum users reached') {
        localStorage.setItem('maxUsersError', 'true');
        setShowMaxUsersModal(true);
        setError('Maximum number of users reached');
      } else {
        console.error('Registration error:', error.response?.data);
        setError('Registration failed. Please try again later.');
      }
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
              transition-all duration-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-70 disabled:cursor-not-allowed 
              group relative overflow-hidden"
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
            
            <div 
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full 
                transition-transform duration-700 bg-gradient-to-r from-transparent 
                via-white/10 to-transparent" 
            />
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