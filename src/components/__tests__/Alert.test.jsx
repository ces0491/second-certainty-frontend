// src/components/__tests__/Alert.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Alert from '../common/Alert';

describe('Alert Component', () => {
  it('renders with correct type and message', () => {
    render(<Alert type="error" message="Test error message" />);
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });
  
  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = jest.fn();
    render(<Alert type="error" message="Test message" onDismiss={onDismiss} />);
    
    fireEvent.click(screen.getByText('Dismiss'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});