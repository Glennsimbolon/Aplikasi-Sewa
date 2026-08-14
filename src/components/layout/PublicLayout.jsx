// src/components/layout/PublicLayout.jsx
import React from 'react';

export const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
};