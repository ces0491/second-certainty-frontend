# Second Certainty - Frontend

This is the frontend application for Second Certainty, a comprehensive South African tax liability management system that helps users track, calculate, and optimize their tax obligations throughout the fiscal year.

![](/sc_logo.png)

## Live Demo

The application is deployed at [https://second-certainty.onrender.com](https://second-certainty.onrender.com)

> **Note**: The application is deployed on Render's free tier, which may result in slow initial load times after periods of inactivity.

## Overview

The Second Certainty frontend is a React-based application that provides an intuitive interface for managing tax liabilities. It offers a dashboard with advanced visualizations, income and expense tracking, tax calculators, and interactive charts to help users understand and optimize their tax situation.

## Features

- **User Authentication**: Secure JWT-based login and registration with profile management
- **Interactive Dashboard**: Overview of tax situation with advanced visualizations including:
  - Waterfall chart showing financial flow from gross income to net income
  - Pie charts for income and expense breakdowns
  - Real-time tax year filtering
- **Income Management**: Track multiple income sources with PAYE indicators
- **Expense Management**: Record and categorize tax-deductible expenses with type validation
- **Tax Calculator**: Calculate tax liability with real-time updates and custom scenarios
- **Provisional Tax Calculator**: Dedicated section for provisional taxpayers with payment tracking
- **Tax Brackets Viewer**: View current and historical South African tax brackets
- **Profile Management**: Update personal information and change passwords
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Calculations**: Automatic tax calculations when income or expenses change

## Technology Stack

- **Framework**: React 18.2
- **Routing**: React Router 6.22.1 with lazy loading
- **HTTP Client**: Axios 1.6.7 with interceptors
- **State Management**: React Context API with custom hooks
- **Styling**: Tailwind CSS 3.4.1 with custom design system
- **Data Visualization**: Recharts 2.12.0 (pie charts, simple visualizations)
- **Build Tools**: Create React App 5.0.1
- **Testing**: React Testing Library, Jest
- **Code Quality**: ESLint, Prettier
- **TypeScript**: Not implemented (JavaScript only)

## Project Structure

```
src/
├── api/                    # API integration and HTTP client setup
│   ├── auth.js            # Authentication endpoints
│   ├── expenses.js        # Expense management endpoints
│   ├── income.js          # Income management endpoints
│   ├── taxCalculator.js   # Tax calculation endpoints
│   └── index.js           # Base API configuration
├── components/             # Reusable UI components
│   ├── common/            # Shared components
│   │   ├── Alert.jsx      # Alert/notification component
│   │   ├── Button.jsx     # Reusable button component
│   │   ├── Footer.jsx     # Application footer
│   │   ├── Layout.jsx     # Main layout wrapper
│   │   ├── Loading.jsx    # Loading spinner component
│   │   ├── Navbar.jsx     # Navigation header
│   │   └── Sidebar.jsx    # Navigation sidebar
│   ├── dashboard/         # Dashboard-specific components
│   │   └── TaxSummary.jsx # Tax summary widgets
│   ├── income/            # Income management components
│   │   └── IncomeList.jsx # Income listing and management
│   └── tax/               # Tax calculation components
│       ├── TaxBrackets.jsx     # Tax bracket display
│       └── TaxCalculation.jsx  # Tax calculator interface
├── context/               # React Context providers
│   ├── AuthContext.jsx    # Authentication state management
│   ├── ExpenseContext.jsx # Expense data management
│   ├── IncomeContext.jsx  # Income data management
│   └── TaxContext.jsx     # Tax calculation state
├── hooks/                 # Custom React hooks
│   ├── useAuth.js         # Authentication hook
│   ├── useExpenses.js     # Expense management hook
│   ├── useIncome.js       # Income management hook
│   ├── useTaxCalc.js      # Tax calculation hook
│   ├── useErrorHandler.js # Error handling utilities
│   └── useDataUpdates.js  # Data refresh utilities
├── pages/                 # Page components (route targets)
│   ├── Dashboard.jsx      # Main dashboard with waterfall charts
│   ├── Login.jsx          # User login page
│   ├── Register.jsx       # User registration page
│   ├── Income.jsx         # Income management page
│   ├── Expenses.jsx       # Expense management page
│   ├── TaxCalculator.jsx  # Tax calculator page
│   ├── ProvisionalTax.jsx # Provisional tax page
│   ├── Profile.jsx        # User profile management
│   └── NotFound.jsx       # 404 error page
├── styles/                # Global styles and CSS
│   └── index.css          # Tailwind CSS imports and custom styles
├── utils/                 # Utility functions and helpers
│   ├── formatters.js      # Currency, date, percentage formatters
│   ├── validators.js      # Form validation utilities
│   ├── taxUtils.js        # Tax calculation helpers
│   └── index.js           # Utility exports
├── App.jsx                # Main application component with providers
├── index.jsx              # Application entry point
└── routes.jsx             # Application routing configuration
```

## Getting Started

### Prerequisites

- **Node.js**: Version 16.0 or higher
- **npm**: Version 7.0 or higher (or yarn equivalent)
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/ces0491/second-certainty.git
cd second-certainty
```

2. **Navigate to the frontend directory:**
```bash
cd frontend
```

3. **Install dependencies:**
```bash
npm install
# or
yarn install
```

4. **Configure environment variables:**

Create a `.env` file in the root directory:
```env
# Backend API Configuration
REACT_APP_API_BASE_URL=http://localhost:8000/api

# Optional: Development settings
REACT_APP_ENVIRONMENT=development
```

For production deployment:
```env
REACT_APP_API_BASE_URL=https://second-certainty-api.onrender.com/api
REACT_APP_ENVIRONMENT=production
```

5. **Start the development server:**
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

This creates an optimized production build in the `build` directory, ready for deployment.

## Available Scripts

- **`npm start`**: Runs the development server
- **`npm run build`**: Creates a production build
- **`npm test`**: Runs the test suite
- **`npm run lint`**: Runs ESLint for code quality checks
- **`npm run lint:fix`**: Automatically fixes linting issues
- **`npm run format`**: Formats code using Prettier
- **`npm run format:check`**: Checks code formatting

## Key Components and Features

### Authentication System
- **JWT-based authentication** with automatic token refresh
- **Protected routes** that redirect unauthenticated users
- **Profile management** with password change functionality
- **Registration system** with comprehensive validation

### Dashboard Analytics
- **Interactive waterfall charts** showing financial flow from gross income to net income
- **Real-time tax calculations** that update automatically
- **Income and expense breakdowns** with visual pie charts
- **Tax year filtering** for historical data analysis
- **Responsive summary cards** with key metrics

### Tax Calculation Engine
- **Real-time tax liability calculations** based on current tax brackets
- **Custom tax scenarios** with adjustable parameters
- **Provisional tax calculations** for qualifying taxpayers
- **Effective tax rate analysis** and optimization suggestions
- **Historical tax bracket comparisons**

### Data Management
- **Comprehensive income tracking** with multiple source types
- **Detailed expense categorization** with deductible expense types
- **Data validation** to ensure accuracy
- **Automatic data synchronization** across components

## API Integration

The frontend communicates with the Second Certainty backend API. Key integration points:

- **Authentication endpoints**: `/auth/token`, `/auth/register`, `/auth/me`
- **Tax calculation endpoints**: `/tax/users/{id}/tax-calculation/`
- **Income management**: `/tax/users/{id}/income/`
- **Expense management**: `/tax/users/{id}/expenses/`
- **Tax brackets**: `/tax/tax-brackets/`

### API Configuration
The API client includes:
- **Automatic token attachment** for authenticated requests
- **Request/response interceptors** for error handling
- **Timeout configuration** (15 seconds)
- **Automatic logout** on 401 responses

## Development Guidelines

### Code Style and Standards
- **ESLint configuration** for code quality
- **Prettier integration** for consistent formatting
- **Functional components** with React Hooks
- **Context API** for state management instead of Redux
- **Custom hooks** for reusable logic

### Component Architecture
- **Atomic design principles** with reusable components
- **Separation of concerns** between presentation and logic
- **Error boundaries** for graceful error handling
- **Loading states** for better user experience

### Testing Strategy
- **Unit tests** for utility functions
- **Component testing** with React Testing Library
- **Integration tests** for critical user flows
- **Manual testing** for visual and UX validation

### Adding New Features

1. **Create API functions** in the appropriate `src/api/` file
2. **Add context providers** if new state management is needed
3. **Build reusable components** in `src/components/`
4. **Create page components** in `src/pages/`
5. **Update routing** in `src/routes.jsx`
6. **Add proper error handling** and loading states

## Current Tax Year Configuration

The application is configured for the **2025-2026 tax year** as the default, with support for:
- 2025-2026 (current)
- 2024-2025
- 2023-2024
- 2022-2023

Tax rates, brackets, and thresholds are updated annually based on SARS (South African Revenue Service) announcements.

## Deployment

### Environment Setup
- **Development**: Local development server with hot reloading
- **Staging**: Preview deployments for testing
- **Production**: Deployed on Render.com with automatic builds

### Deployment Process
1. **Code changes** are pushed to the main branch
2. **Automatic deployment** triggers on Render
3. **Build process** runs `npm run build`
4. **Static files** are served from the build directory

## Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile browsers**: iOS Safari 14+, Chrome Mobile 90+

## Performance Considerations

- **Code splitting** with React.lazy for route-based splitting
- **Image optimization** with appropriate formats and sizes
- **Bundle size monitoring** to maintain fast load times
- **Caching strategies** for static assets
- **API response caching** where appropriate

## Security Features

- **JWT token management** with secure storage
- **Input validation** on all forms
- **XSS protection** through React's built-in sanitization
- **CSRF protection** through SameSite cookies
- **Secure API communication** over HTTPS

## Accessibility

- **WCAG 2.1 compliance** for screen readers
- **Keyboard navigation** support
- **Color contrast** meeting accessibility standards
- **Semantic HTML** structure
- **ARIA labels** where necessary

## Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/my-feature`
3. **Follow code style guidelines**: Run `npm run lint` and `npm run format`
4. **Write tests** for new functionality
5. **Commit changes**: `git commit -m 'Add my feature'`
6. **Push to branch**: `git push origin feature/my-feature`
7. **Open a Pull Request** with detailed description

## Troubleshooting

### Common Issues

**Backend Connection Errors:**
- Verify `REACT_APP_API_BASE_URL` in `.env`
- Check if backend server is running
- Confirm CORS settings on backend

**Build Failures:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify all dependencies are properly installed

**Chart Rendering Issues:**
- Check browser console for JavaScript errors
- Verify chart data format matches expected structure

## License

This project is licensed under the MIT License - see the [LICENSE](/LICENSE) file for details.

## Support

For support and questions:
- **GitHub Issues**: For bug reports and feature requests
- **Documentation**: This README and inline code comments
- **Email**: tbsces001@myuct.ac.za

---

**Disclaimer**: This application is for demonstration purposes ONLY, as part of a Financial Software Engineering assignment. It is not intended as official tax advice. Please consult a registered tax practitioner for professional tax guidance.