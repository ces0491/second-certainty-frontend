// src/components/common/Navbar.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-indigo-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-white text-xl font-bold">
                Second Certainty
              </Link>
            </div>
          </div>
          
          {currentUser && (
            <div className="flex items-center">
              <div className="hidden md:ml-4 md:flex md:items-center">
                <div className="relative">
                  <button
                    className="max-w-xs bg-indigo-600 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    id="user-menu"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    <span className="h-8 w-8 rounded-full bg-indigo-800 flex items-center justify-center text-white">
                      {currentUser.name[0]}
                    </span>
                    <span className="ml-2 text-white">
                      {currentUser.name}
                    </span>
                  </button>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-4 px-3 py-1 rounded-md text-sm font-medium text-white bg-indigo-700 hover:bg-indigo-800"
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;