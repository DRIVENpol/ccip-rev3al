'use client';
import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ type, message, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastDetails = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: <FaCheckCircle className="text-green-500 w-6 h-6" />,
          bgColor: 'bg-green-100',
          borderColor: 'border-green-500',
          textColor: 'text-green-700',
        };
      case 'error':
        return {
          icon: <FaExclamationCircle className="text-red-500 w-6 h-6" />,
          bgColor: 'bg-red-100',
          borderColor: 'border-red-500',
          textColor: 'text-red-700',
        };
      case 'warning':
        return {
          icon: <FaExclamationCircle className="text-yellow-500 w-6 h-6" />,
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-700',
        };
      case 'info':
      default:
        return {
          icon: <FaInfoCircle className="text-blue-500 w-6 h-6" />,
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-500',
          textColor: 'text-blue-700',
        };
    }
  };

  const { icon, bgColor, borderColor, textColor } = getToastDetails(type);

  return (
    <div className={`max-w-sm w-full ${bgColor} border-l-4 ${borderColor} p-4 rounded shadow-lg flex items-start space-x-3`} role="alert" aria-live="assertive" aria-atomic="true">
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className={`flex-1 text-sm ${textColor}`}>
        <p className={`font-medium ${textColor}`}>
          {message}
        </p>
      </div>
      <button onClick={onClose} className={`ml-2 text-${textColor} focus:outline-none`}>
        <FaTimes className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
