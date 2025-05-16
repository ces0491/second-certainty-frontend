// src/components/common/Alert.jsx
import React from 'react';

const Alert = ({ type, message, onDismiss }) => {
  const types = {
    success: {
      bgColor: 'bg-sc-green/10',
      borderColor: 'border-sc-green',
      textColor: 'text-sc-green',
    },
    error: {
      bgColor: 'bg-red-100',
      borderColor: 'border-red-500',
      textColor: 'text-red-700',
    },
    warning: {
      bgColor: 'bg-sc-gold/10',
      borderColor: 'border-sc-gold',
      textColor: 'text-sc-black',
    },
    info: {
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-700',
    },
  };

  const { bgColor, borderColor, textColor } = types[type] || types.info;

  return (
    <div className={`${bgColor} border-l-4 ${borderColor} ${textColor} p-4 mb-4`} role="alert">
      <p className="font-bold">{type.charAt(0).toUpperCase() + type.slice(1)}</p>
      <p>{message}</p>
      {onDismiss && (
        <button
          className={`ml-auto ${textColor} hover:underline focus:outline-none`}
          onClick={onDismiss}
        >
          Dismiss
        </button>
      )}
    </div>
  );
};

export default Alert;