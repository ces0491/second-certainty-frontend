// src/pages/TaxCalculator.jsx
import React from 'react';
import TaxCalculation from '../components/tax/TaxCalculation';
import TaxBrackets from '../components/tax/TaxBrackets';

const TaxCalculator = () => {
  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tax Calculator</h1>
      
      <TaxCalculation />
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Tax Brackets</h2>
        <TaxBrackets />
      </div>
    </div>
  );
};

export default TaxCalculator;