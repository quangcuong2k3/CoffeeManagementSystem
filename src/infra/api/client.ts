/**
 * API Client - Infrastructure Layer
 * HTTP client for external API calls
 */

import { config } from '../config';
import { ApiResponse, PaginatedResponse } from '../../core/types/common';

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  signal?: AbortSignal;
}

export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  defaultHeaders: Record<string, string>;
}

export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(clientConfig: Partial<ApiClientConfig> = {}) {
    this.baseURL = clientConfig.baseURL || config.apiUrl;
    this.timeout = clientConfig.timeout || config.apiTimeout;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...clientConfig.defaultHeaders
    };
  }

  /**
   * Generic request method
   */
  async request<T = any>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      params,
      data,
      timeout = this.timeout,
      signal
    } = config;

    try {
      // Build URL
      const url = new URL(endpoint, this.baseURL);
      
      // Add query parameters
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, String(params[key]));
          }
        });
      }

      // Prepare headers
      const requestHeaders = {
        ...this.defaultHeaders,
        ...headers
      };

      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
        signal
      };

      // Add body for non-GET requests
      if (method !== 'GET' && data !== undefined) {
        if (data instanceof FormData) {
          // Remove Content-Type for FormData (browser will set it with boundary)
          delete requestHeaders['Content-Type'];
          requestOptions.body = data;
        } else {
          requestOptions.body = JSON.stringify(data);
        }
      }

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout);
      });

      // Make request with timeout
      const response = await Promise.race([
        fetch(url.toString(), requestOptions),
        timeoutPromise
      ]);

      // Handle response
      return await this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * GET request
   */
  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    config: Omit<RequestConfig, 'method' | 'params'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET', params });
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    config: Omit<RequestConfig, 'method' | 'data'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', data });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    config: Omit<RequestConfig, 'method' | 'data'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', data });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    config: Omit<RequestConfig, 'method' | 'data'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', data });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    config: Omit<RequestConfig, 'method'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * Upload file
   */
  async upload<T = any>(
    endpoint: string,
    file: File | Blob,
    fieldName: string = 'file',
    additionalData: Record<string, any> = {},
    config: Omit<RequestConfig, 'method' | 'data'> = {}
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // Add additional form data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, String(additionalData[key]));
    });

    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      data: formData
    });
  }

  /**
   * Download file
   */
  async download(
    endpoint: string,
    filename?: string,
    config: Omit<RequestConfig, 'method'> = {}
  ): Promise<void> {
    try {
      const response = await fetch(new URL(endpoint, this.baseURL).toString(), {
        method: 'GET',
        headers: this.defaultHeaders,
        ...config
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || endpoint.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Set default header
   */
  setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  /**
   * Remove default header
   */
  removeDefaultHeader(key: string): void {
    delete this.defaultHeaders[key];
  }

  /**
   * Set authorization header
   */
  setAuthToken(token: string): void {
    this.setDefaultHeader('Authorization', `Bearer ${token}`);
  }

  /**
   * Remove authorization header
   */
  clearAuthToken(): void {
    this.removeDefaultHeader('Authorization');
  }

  /**
   * Handle successful response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      // Check if response is ok
      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          data: undefined
        };
      }

      // Parse response based on content type
      const contentType = response.headers.get('content-type');
      let data: T;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType && contentType.includes('text/')) {
        data = (await response.text()) as unknown as T;
      } else {
        data = (await response.blob()) as unknown as T;
      }

      return {
        success: true,
        data,
        message: response.statusText
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: undefined
      };
    }
  }

  /**
   * Parse error response
   */
  private async parseErrorResponse(response: Response): Promise<{ message: string; details?: any }> {
    try {
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        return {
          message: errorData.message || errorData.error || response.statusText,
          details: errorData
        };
      } else {
        const errorText = await response.text();
        return {
          message: errorText || response.statusText
        };
      }
    } catch (error) {
      return {
        message: response.statusText || 'Unknown error'
      };
    }
  }

  /**
   * Handle request error
   */
  private handleError<T>(error: any): ApiResponse<T> {
    let message = 'Network error occurred';
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        message = 'Request was cancelled';
      } else if (error.message.includes('timeout')) {
        message = 'Request timeout';
      } else if (error.message.includes('Failed to fetch')) {
        message = 'Network connection failed';
      } else {
        message = error.message;
      }
    }

    return {
      success: false,
      error: message,
      data: undefined
    };
  }
}

/**
 * Create API client instances
 */

// Default API client
export const apiClient = new ApiClient();

// Authenticated API client (for protected routes)
export const authApiClient = new ApiClient();

// File upload client (with different timeout settings)
export const uploadClient = new ApiClient({
  timeout: 60000 // 1 minute timeout for uploads
});

/**
 * Utility functions for common API patterns
 */

/**
 * Create paginated request
 */
export const createPaginatedRequest = async <T>(
  endpoint: string,
  page: number = 1,
  limit: number = 20,
  filters?: Record<string, any>
): Promise<PaginatedResponse<T>> => {
  const params = {
    page,
    limit,
    ...filters
  };

  const response = await apiClient.get<T[]>(endpoint, params);
  
  if (!response.success) {
    return {
      ...response,
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0
      }
    } as PaginatedResponse<T>;
  }

  // Assume the API returns pagination info in headers or data
  // This would need to be adjusted based on your actual API structure
  return response as PaginatedResponse<T>;
};

/**
 * Create search request with debouncing
 */
export const createSearchRequest = <T>(
  endpoint: string,
  debounceMs: number = 300
): ((searchTerm: string, filters?: Record<string, any>) => Promise<ApiResponse<T[]>>) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (searchTerm: string, filters?: Record<string, any>): Promise<ApiResponse<T[]>> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        const params = {
          search: searchTerm,
          ...filters
        };
        const response = await apiClient.get<T[]>(endpoint, params);
        resolve(response);
      }, debounceMs);
    });
  };
};

/**
 * Create batch request handler
 */
export const createBatchRequest = async <T>(
  requests: Array<{ endpoint: string; config?: RequestConfig }>
): Promise<ApiResponse<T>[]> => {
  try {
    const promises = requests.map(({ endpoint, config }) => 
      apiClient.request<T>(endpoint, config)
    );
    
    return await Promise.all(promises);
  } catch (error) {
    throw new Error(`Batch request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export default apiClient;