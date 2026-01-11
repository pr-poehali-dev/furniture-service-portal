const API_BASE_URL = {
  auth: 'https://functions.poehali.dev/87b91fa9-e4f1-464c-a690-387f63757225',
  masters: 'https://functions.poehali.dev/8b3792e1-6d11-49b8-ac7f-784b0eb162df',
};

export interface User {
  id: number;
  email: string;
  full_name: string;
  user_type: 'customer' | 'master';
  phone?: string;
  avatar_url?: string;
  master_id?: number;
}

export interface Master {
  id: number;
  user_id: number;
  full_name: string;
  specialty: string;
  description?: string;
  experience_years?: number;
  city: string;
  rating: number;
  reviews_count: number;
  completed_projects: number;
  verified: boolean;
  avatar_url?: string;
  portfolio?: Array<{ url: string; title?: string }>;
  categories?: string[];
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  description?: string;
}

export interface Order {
  id: number;
  customer_id: number;
  master_id?: number;
  title: string;
  description: string;
  category_name?: string;
  budget_min?: number;
  budget_max?: number;
  city: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

export const auth = {
  async register(data: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    user_type: 'customer' | 'master';
    city?: string;
    specialty?: string;
  }): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL.auth}?action=register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    return response.json();
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL.auth}?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    return response.json();
  },

  async getProfile(userId: number, token: string): Promise<{ user: User }> {
    const response = await fetch(`${API_BASE_URL.auth}?action=profile&user_id=${userId}`, {
      headers: { 'X-Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch profile');
    }
    return response.json();
  },
};

export const masters = {
  async getList(filters?: {
    city?: string;
    category?: string;
    min_rating?: number;
    verified?: boolean;
    search?: string;
  }): Promise<{ masters: Master[]; count: number }> {
    const params = new URLSearchParams({ action: 'list' });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const response = await fetch(`${API_BASE_URL.masters}?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch masters');
    }
    return response.json();
  },

  async getCategories(): Promise<{ categories: Category[] }> {
    const response = await fetch(`${API_BASE_URL.masters}?action=categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return response.json();
  },

  async createOrder(
    data: {
      customer_id: number;
      title: string;
      description: string;
      category?: string;
      city: string;
      budget_min?: number;
      budget_max?: number;
    },
    token: string
  ): Promise<{ order: Order }> {
    const response = await fetch(`${API_BASE_URL.masters}?action=create_order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create order');
    }
    return response.json();
  },

  async getOrders(filters?: {
    customer_id?: number;
    master_id?: number;
    status?: string;
  }): Promise<{ orders: Order[]; count: number }> {
    const params = new URLSearchParams({ action: 'orders' });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const response = await fetch(`${API_BASE_URL.masters}?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    return response.json();
  },
};

export const storage = {
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  },
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  },
  removeItem(key: string): void {
    localStorage.removeItem(key);
  },
};
