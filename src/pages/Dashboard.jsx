// src/pages/Dashboard.jsx
import React from 'react';
import TaxSummary from '../components/dashboard/TaxSummary';
import { useTaxCalc } from '../hooks/useTaxCalc';
import Loading from '../components/common/Loading';

const Dashboard = () => {
  const { loading, error } = useTaxCalc();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tax Dashboard</h1>
      <TaxSummary />
    </div>
  );
};

export default Dashboard;