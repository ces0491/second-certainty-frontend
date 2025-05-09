// src/components/common/Footer.jsx
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white shadow-inner py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-600 text-sm">
            &copy; {currentYear} Second Certainty. All rights reserved.
          </div>
          <div className="mt-2 md:mt-0">
            <p className="text-gray-600 text-sm">
              Disclaimer: This is not official tax advice. Please consult a registered tax practitioner.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;