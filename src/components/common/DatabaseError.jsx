// src/components/common/DatabaseError.jsx
import React from 'react';

const DatabaseError = ({ onRetry, retryCount = 0 }) => {
  const getEstimatedTime = () => {
    if (retryCount <= 1) return '30 seconds';
    if (retryCount <= 2) return '1 minute';
    return '2-3 minutes';
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col items-center">
        <svg className="w-16 h-16 text-sc-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M12 3a9 9 0 110 18 9 9 0 010-18z"></path>
        </svg>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Database Connection Issue</h2>
        <p className="text-gray-600 mb-4 text-center">
          The server is experiencing database connection issues. This is common on free hosting tiers during periods of activity.
        </p>
        <p className="text-gray-600 mb-6 text-center">
          Please wait approximately <span className="font-semibold">{getEstimatedTime()}</span> for the server to recover, or try again later.
        </p>
        {retryCount > 0 && (
          <p className="text-sm text-sc-green-600 mb-4">
            Automatically retrying... (Attempt {retryCount})
          </p>
        )}
        <button 
          className="bg-sc-green-600 hover:bg-sc-green-700 text-white font-medium py-2 px-6 rounded-md"
          onClick={onRetry}
        >
          Retry Now
        </button>
      </div>
    </div>
  );
};

export default DatabaseError;