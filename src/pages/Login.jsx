// src/pages/Login.jsx
import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { pingServer } from '../api/index';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [serverWarningShown, setServerWarningShown] = useState(false);
  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;
  const pingAttempted = useRef(false);

  // Optimize server ping - only ping on user interaction, not on mount
  const handleServerWakeup = useCallback(async () => {
    if (pingAttempted.current) return;
    pingAttempted.current = true;

    setIsWakingUp(true);
    try {
      const isOnline = await pingServer();
      if (!isOnline && !serverWarningShown) {
        setServerWarningShown(true);
      }
    } catch (err) {
      console.warn('Server ping failed:', err);
      if (!serverWarningShown) {
        setServerWarningShown(true);
      }
    } finally {
      setIsWakingUp(false);
    }
  }, [serverWarningShown]);

  // Ping server when user starts typing (lazy ping)
  useEffect(() => {
    if ((email || password) && !pingAttempted.current) {
      handleServerWakeup();
    }
  }, [email, password, handleServerWakeup]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Basic validation
    if (!email || !password) {
      setFormError('Please enter both email and password');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    try {
      console.log('Submitting login form for:', email);

      // Ping server if not already done
      if (!pingAttempted.current) {
        await handleServerWakeup();
      }

      const result = await login(email.trim(), password);

      if (result.success) {
        console.log('Login successful, navigating to dashboard');
        navigate('/dashboard');
      } else {
        // Handle specific error messages
        let errorMessage = 'Login failed. Please check your credentials.';

        if (result.error) {
          if (typeof result.error === 'string') {
            errorMessage = result.error;
          } else if (result.error.detail) {
            errorMessage = result.error.detail;
          } else if (result.error.message) {
            errorMessage = result.error.message;
          }
        }

        setFormError(errorMessage);
      }
    } catch (err) {
      console.error('Login error in component:', err);

      // Handle different types of errors
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (err.response) {
        // Server responded with error status
        if (err.response.status === 401) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (err.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.response.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        // Network error
        errorMessage =
          'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setFormError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img src="/sc_logo.png" alt="Second Certainty" className="h-24 w-auto mx-auto" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-sc-black">
            Sign in to Second Certainty
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">Your tax management solution</p>
        </div>

        {message && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{message}</span>
          </div>
        )}

        {formError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{formError}</span>
          </div>
        )}

        {/* Only show server warning if there's an issue */}
        {serverWarningShown && (
          <div
            className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">
              ⚠️ The server may take 30-60 seconds to respond on first visit (free hosting).
            </span>
          </div>
        )}

        {/* Show loading indicator only when actively waking up server */}
        {isWakingUp && (
          <div
            className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
              <span className="block sm:inline">Checking server status...</span>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-sc-green focus:border-sc-green focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-sc-green focus:border-sc-green focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || isWakingUp}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sc-green hover:bg-sc-green/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sc-green disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : isWakingUp ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Preparing...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/register" className="font-medium text-sc-green hover:text-sc-green/80">
                Don't have an account? Register
              </Link>
            </div>
          </div>
        </form>

        {/* Performance tip */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            💡 Tip: After first login, the app will load much faster on subsequent visits.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;