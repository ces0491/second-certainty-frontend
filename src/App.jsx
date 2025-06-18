// src/App.jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import { AuthProvider } from './context/AuthContext';
import { IncomeProvider } from './context/IncomeContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { TaxProvider } from './context/TaxContext';
import './styles/index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <TaxProvider>
          <IncomeProvider>
            <ExpenseProvider>
              <AppRoutes />
            </ExpenseProvider>
          </IncomeProvider>
        </TaxProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
