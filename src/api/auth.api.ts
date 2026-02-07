// Auth service - Handles authentication and token management

import { apiClient } from './client';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '../lib/authTokens';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export const authService = {
  /**
   * Login user
   * POST /api/auth/login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Login endpoint returns tokens directly, not wrapped in success/data
      const response = await apiClient.post<any>('/auth/login', credentials);

      // Handle both wrapped and direct response formats
      let loginData: LoginResponse;
      if (response.success && response.data) {
        loginData = response.data;
      } else if (
        response.data &&
        (response.data.access || response.data.refresh)
      ) {
        // Direct response format
        loginData = response.data;
      } else {
        throw new Error(response.error?.message || 'Login failed');
      }

      // Store tokens in localStorage
      setTokens(loginData.access, loginData.refresh);

      return loginData;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Get access token from storage
   */
  getAccessToken(): string | null {
    return getAccessToken();
  },

  /**
   * Get refresh token from storage
   */
  getRefreshToken(): string | null {
    return getRefreshToken();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },

  /**
   * Logout user
   */
  logout(): void {
    clearTokens();
  },
};
