import React from 'react';
import Header from './Header';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-grow py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Header />
          {children}
        </div>
      </div>
      
      <footer className="bg-white shadow-md mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 text-sm">
            © 2024 ThisAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;