// src/services/api.ts
class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ProjectKnowledgeResponse {
  response: string;
  confidence: number;
  sources?: string[];
}

interface MenuResponse {
  categories: string[];
  items: MenuItem[];
}

interface OrderResponse {
  order_id: string;
  total: number;
  status: string;
  payment_url?: string;
}

// Add to src/services/api.ts
class APIService {
  private baseURL: string;
  private wsURL: string;
  private isOffline: boolean = false;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    this.wsURL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    
    // Check if backend is available
    this.healthCheck().catch(() => {
      console.warn('⚠️ Backend not available, running in offline mode');
      this.isOffline = true;
    });
  }

  private async fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // If offline, return mock data
    if (this.isOffline) {
      return this.getMockData(endpoint, options) as T;
    }

    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new APIError(response.status, `API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Fallback to mock data on error
      console.warn('API call failed, using mock data:', error);
      return this.getMockData(endpoint, options) as T;
    }
  }
  private getMockData(endpoint: string, options: RequestInit) {
    // Mock responses for offline development
    if (endpoint === '/api/menu') {
      return {
        categories: ['coffee', 'non-coffee', 'food'],
        items: [
          {
            id: '1',
            name: 'Cappuccino',
            price: 4.50,
            category: 'coffee',
            description: 'Classic Italian coffee',
            isHot: true,
            availability: { isAvailable: true, estimatedTime: 5 }
          }
        ]
      };
    }
    
    if (endpoint.includes('/api/project-knowledge')) {
      return {
        response: 'Offline mode: Limited functionality available',
        confidence: 0.5,
        sources: []
      };
    }

    return { success: true, data: {} };
  }
  // Project Knowledge Search (replaces mock)
  async searchProjectKnowledge(query: string): Promise<ProjectKnowledgeResponse> {
    return this.fetchAPI<ProjectKnowledgeResponse>('/api/project-knowledge/search', {
      method: 'POST',
      body: JSON.stringify({ query, max_results: 5 }),
    });
  }

  // Menu API
  async getMenu(): Promise<MenuResponse> {
    return this.fetchAPI<MenuResponse>('/api/menu');
  }

  async getMenuItem(itemId: string) {
    return this.fetchAPI(`/api/menu/items/${itemId}`);
  }

  // Order API
  async createOrder(items: any[], customerInfo?: any): Promise<OrderResponse> {
    return this.fetchAPI<OrderResponse>('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ items, customer_info: customerInfo }),
    });
  }

  async getOrder(orderId: string) {
    return this.fetchAPI(`/api/orders/${orderId}`);
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.fetchAPI(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Payment API
  async createPaymentIntent(orderId: string, amount: number) {
    return this.fetchAPI('/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, amount }),
    });
  }

  async confirmPayment(paymentIntentId: string) {
    return this.fetchAPI('/api/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ payment_intent_id: paymentIntentId }),
    });
  }

  // WebSocket URL for chat
  getWebSocketURL(sessionId: string): string {
    return `${this.wsURL}/ws/chat/${sessionId}`;
  }

  // Health check
  async healthCheck() {
    return this.fetchAPI('/health');
  }

  // Weather-based recommendations
  async getWeatherRecommendations(location?: string) {
    const endpoint = location ? `/api/recommendations/weather?location=${encodeURIComponent(location)}` : '/api/recommendations/weather';
    return this.fetchAPI(endpoint);
  }

  // Queue management
  async getQueueStatus() {
    return this.fetchAPI('/api/queue/status');
  }

  async joinQueue(customerId: string, orderType: string = 'pickup') {
    return this.fetchAPI('/api/queue/join', {
      method: 'POST',
      body: JSON.stringify({ customer_id: customerId, order_type: orderType }),
    });
  }

  // Analytics
  async getAnalytics(timeframe: string = '7d') {
    return this.fetchAPI(`/api/analytics/dashboard?timeframe=${timeframe}`);
  }
}

// Export singleton instance
export const apiService = new APIService();
export type { APIResponse, ProjectKnowledgeResponse, MenuResponse, OrderResponse };