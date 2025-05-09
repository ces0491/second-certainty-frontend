// src/components/common/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { currentUser } = useAuth();
  
  // Navigation links
  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: 'home' },
    { name: 'Income', path: '/income', icon: 'trending-up' },
    { name: 'Expenses', path: '/expenses', icon: 'trending-down' },
    { name: 'Tax Calculator', path: '/tax-calculator', icon: 'calculator' },
  ];
  
  // Add provisional tax link for provisional taxpayers
  if (currentUser?.is_provisional_taxpayer) {
    navLinks.push({ name: 'Provisional Tax', path: '/provisional-tax', icon: 'calendar' });
  }
  
  // Add profile link
  navLinks.push({ name: 'Profile', path: '/profile', icon: 'user' });
  
  return (
    <div className="hidden md:block w-64 bg-white shadow-lg">
      <div className="h-full px-3 py-4 overflow-y-auto">
        <ul className="space-y-2">
          {navLinks.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) => 
                  `flex items-center p-2 rounded-lg ${
                    isActive 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {link.icon === 'home' && (
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  )}
                  {link.icon === 'trending-up' && (
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  )}
                  {link.icon === 'trending-down' && (
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"
                    />
                  )}
                  {link.icon === 'calculator' && (
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  )}
                  {link.icon === 'calendar' && (
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  )}
                  {link.icon === 'user' && (
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  )}
                </svg>
                <span className="ml-3">{link.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;