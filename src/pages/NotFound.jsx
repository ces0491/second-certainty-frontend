// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            404 - Page Not Found
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="mt-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sc-green-600 hover:bg-sc-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sc-green-500"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
