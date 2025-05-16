// src/components/common/TaxYearDropdown.jsx
import React from 'react';

const TaxYearDropdown = ({ value, onChange, years = ['2025-2026', '2024-2025', '2023-2024', '2022-2023'] }) => {
  return (
    <div className="relative inline-block">
      <select
        className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sc-green focus:border-sc-green cursor-pointer"
        value={value}
        onChange={onChange}
      >
        {years.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
      
      {/* Custom dropdown arrow */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
};

export default TaxYearDropdown;