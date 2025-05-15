# Second Certainty - Frontend

This is the frontend application for Second Certainty, a comprehensive South African tax liability management system that helps users track, calculate, and optimize their tax obligations throughout the fiscal year.

![Second Certainty Logo](/sc_logo.png)

## Live Demo

The application is deployed at [https://second-certainty.onrender.com](https://second-certainty.onrender.com)

> **Note**: The application is deployed on Render's free tier, which may result in slow initial load times after periods of inactivity.

## Overview

The Second Certainty frontend is a React-based application that provides an intuitive interface for managing tax liabilities. It offers a dashboard, income and expense tracking, tax calculators, and visualizations to help users understand and optimize their tax situation.

## Features

- **User Authentication**: Secure JWT-based login and registration
- **Dashboard**: Overview of tax situation with visualizations
- **Income Management**: Track multiple income sources
- **Expense Management**: Record and categorize tax-deductible expenses
- **Tax Calculator**: Calculate tax liability with real-time updates
- **Provisional Tax**: Track provisional tax payments for provisional taxpayers
- **Tax Brackets**: View current and historical tax brackets
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Framework**: React 18.2
- **Routing**: React Router 6.22.1
- **HTTP Client**: Axios 1.6.7
- **State Management**: React Context API
- **Styling**: Tailwind CSS 3.4.1
- **Data Visualization**: Recharts 2.12.0
- **Build Tools**: Create React App

## Project Structure

```
src/
├── api/              # API integration
├── components/       # Reusable UI components
│   ├── common/       # Shared components (Layout, Navbar, etc.)
│   ├── dashboard/    # Dashboard components
│   ├── income/       # Income management components
│   └── tax/          # Tax calculation components
├── context/          # React Context for state management
├── hooks/            # Custom React hooks
├── pages/            # Page components
├── styles/           # Global styles
├── utils/            # Utility functions
├── App.jsx           # Main application component
├── index.jsx         # Application entry point
└── routes.jsx        # Application routes
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ces0491/second-certainty.git
cd second-certainty
```

2. Navigate to the frontend directory:
```bash
cd frontend
```

3. Install dependencies:
```bash
npm install
# or
yarn install
```

4. Create a `.env` file with the backend API URL:
```
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

5. Start the development server:
```bash
npm start
# or
yarn start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Building for Production

```bash
npm run build
# or
yarn build
```

This will create an optimized production build in the `build` directory.

## Key Components

### AuthContext

Handles user authentication state and provides login, registration, and logout functionality.

### TaxContext

Manages tax calculation state and operations, including fetching tax brackets and calculating tax liability.

### IncomeContext & ExpenseContext

Handle income sources and deductible expenses respectively, providing CRUD operations and state management.

### Dashboard

Displays a summary of the user's tax situation with visualizations and quick access to key features.

### TaxCalculator

An interactive calculator that shows tax liability based on income, expenses, and other factors.

## Development Guidelines

### Adding New Features

1. Create new components in the appropriate directory
2. Add API integration in the `api` directory
3. Update context providers if necessary
4. Add routes in `routes.jsx`

### Code Style

- Use functional components with hooks
- Follow the existing component structure
- Use Tailwind CSS for styling
- Add proper comments and documentation

## Connecting to the Backend

The frontend communicates with the backend API at the URL specified in the `REACT_APP_API_BASE_URL` environment variable. Make sure the backend is running and accessible before starting the frontend.

## Current Tax Year

The application is configured for the 2025-2026 tax year. Tax rates, brackets, and thresholds are updated annually based on SARS announcements.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](/LICENSE) file for details.