// src/api/__tests__/auth.test.js
import { login, isAuthenticated } from '../auth';
import api from '../index';

// Mock the api module
jest.mock('../index');

describe('Auth API', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('stores token in localStorage after successful login', async () => {
    // Mock the API response
    api.post.mockResolvedValueOnce({
      data: { access_token: 'test-token' },
    });

    await login('test@example.com', 'password123');

    expect(localStorage.getItem('auth_token')).toBe('test-token');
    expect(api.post).toHaveBeenCalledWith('/auth/token', expect.any(FormData), expect.any(Object));
  });

  it('correctly reports authentication status', () => {
    // Not authenticated initially
    expect(isAuthenticated()).toBe(false);

    // Set token and check again
    localStorage.setItem('auth_token', 'test-token');
    expect(isAuthenticated()).toBe(true);
  });
});
