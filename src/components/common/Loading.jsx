// src/components/common/Loading.jsx
import React from 'react';

const Loading = ({ size = 'md', fullPage = false }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const spinnerSize = sizes[size] || sizes.md;

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <div className={`animate-spin rounded-full ${spinnerSize} border-t-2 border-b-2 border-indigo-500`}></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-4">
      <div className={`animate-spin rounded-full ${spinnerSize} border-t-2 border-b-2 border-indigo-500`}></div>
    </div>
  );
};

export default Loading;