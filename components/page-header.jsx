import React from 'react';

// Page header components for consistent styling across the app
export const PageHeader = ({ children, className = "" }) => {
  return (
    <div className={`mb-8 ${className}`}>
      {children}
    </div>
  );
};

export const PageHeaderTitle = ({ children, className = "" }) => {
  return (
    <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${className}`}>
      {children}
    </h1>
  );
};

export const PageHeaderDescription = ({ children, className = "" }) => {
  return (
    <p className={`text-lg text-gray-600 ${className}`}>
      {children}
    </p>
  );
};
