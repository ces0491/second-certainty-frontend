// src/pages/Register.jsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    surname: '',
    date_of_birth: '',
    is_provisional_taxpayer: false,
  });
  const [formError, setFormError] = useState('');
  const { register, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const validateForm = () => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return false;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return false;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }

    // Validate required fields
    if (!formData.name || !formData.surname || !formData.date_of_birth) {
      setFormError('All fields are required');
      return false;
    }

    // Validate names are not just whitespace
    if (formData.name.trim().length === 0 || formData.surname.trim().length === 0) {
      setFormError('Name and surname cannot be empty');
      return false;
    }

    // Validate date of birth (must be in the past)
    const birthDate = new Date(formData.date_of_birth);
    const today = new Date();
    if (birthDate >= today) {
      setFormError('Date of birth must be in the past');
      return false;
    }

    // Check if person is at least 16 years old
    const birthYear = birthDate.getFullYear();
    const birthMonth = birthDate.getMonth();
    const birthDay = birthDate.getDate();

    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    let age = currentYear - birthYear;

    // Adjust age if birthday hasn't occurred this year
    if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
      age--;
    }

    if (age < 16) {
      setFormError('You must be at least 16 years old to register');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validateForm()) {
      return;
    }

    // Remove confirmPassword and prepare data for API
    const { confirmPassword, ...apiData } = formData;

    // Ensure names are trimmed
    apiData.name = apiData.name.trim();
    apiData.surname = apiData.surname.trim();
    apiData.email = apiData.email.trim().toLowerCase();

    try {
      console.log('Submitting registration:', { ...apiData, password: '[HIDDEN]' });

      const result = await register(apiData);

      if (result.success) {
        console.log('Registration successful');
        // Redirect to login page after successful registration
        navigate('/login', {
          state: {
            message: 'Registration successful! Please log in with your new account.',
          },
        });
      } else {
        // Handle specific error messages
        let errorMessage = 'Registration failed. Please try again.';

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
      console.error('Registration error:', err);

      // Handle different types of errors
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (err.response) {
        // Server responded with error status
        if (err.response.status === 400) {
          if (err.response.data?.detail) {
            errorMessage = err.response.data.detail;
          } else {
            errorMessage = 'Invalid registration data. Please check your inputs.';
          }
        } else if (err.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.response.data?.detail) {
          errorMessage = err.response.data.detail;
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
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Second Certainty to manage your tax liabilities
          </p>
        </div>

        {formError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{formError}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-sc-green-500 focus:border-sc-green-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
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
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sc-green-500 focus:border-sc-green-500 focus:z-10 sm:text-sm"
                placeholder="Password (minimum 8 characters)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sc-green-500 focus:border-sc-green-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="name" className="sr-only">
                First Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="given-name"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sc-green-500 focus:border-sc-green-500 focus:z-10 sm:text-sm"
                placeholder="First Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="surname" className="sr-only">
                Last Name
              </label>
              <input
                id="surname"
                name="surname"
                type="text"
                autoComplete="family-name"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sc-green-500 focus:border-sc-green-500 focus:z-10 sm:text-sm"
                placeholder="Last Name"
                value={formData.surname}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="date_of_birth" className="sr-only">
                Date of Birth
              </label>
              <input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-sc-green-500 focus:border-sc-green-500 focus:z-10 sm:text-sm"
                value={formData.date_of_birth}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="is_provisional_taxpayer"
              name="is_provisional_taxpayer"
              type="checkbox"
              className="h-4 w-4 text-sc-green-600 focus:ring-sc-green-500 border-gray-300 rounded"
              checked={formData.is_provisional_taxpayer}
              onChange={handleChange}
            />
            <label htmlFor="is_provisional_taxpayer" className="ml-2 block text-sm text-gray-900">
              I am a provisional taxpayer
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sc-green-600 hover:bg-sc-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sc-green-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/login" className="font-medium text-sc-green-600 hover:text-sc-green-500">
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
