import { mockApiClient } from './mockApi';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000/api' 
    : 'https://your-production-api.com/api',
  TIMEOUT: 10000,
  USE_MOCK_DATA: process.env.NODE_ENV === 'development', // Enable mock data in development
};

// API Client with error handling
class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string, timeout: number = 10000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }

      return data.data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        // If connection fails and we're in development, fall back to mock data
        if (API_CONFIG.USE_MOCK_DATA && (error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('CONNECTION_REFUSED'))) {
          console.warn('Backend not available, using mock data for:', endpoint);
          return mockApiClient.get(endpoint);
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      return this.request<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      });
    } catch (error) {
      if (API_CONFIG.USE_MOCK_DATA && error instanceof Error && (error.message.includes('fetch') || error.message.includes('NetworkError'))) {
        console.warn('Backend not available, using mock data for POST:', endpoint);
        return mockApiClient.post(endpoint, data);
      }
      throw error;
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_CONFIG.BASE_URL, API_CONFIG.TIMEOUT);

// Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Utility functions
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};
