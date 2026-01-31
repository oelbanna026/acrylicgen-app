// Auth & API Service
(function() {
    // Determine API URL based on environment
    const getApiUrl = () => {
        const hostname = window.location.hostname;
        // Local development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3001/api';
        }
        // Production / Staging (Served via Nginx proxy)
        return '/api';
    };

    const API_URL = getApiUrl();
    const MOCK_MODE = false; // Set to false when backend is running

    let storedUser = null;
    try {
        storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    } catch (e) {
        console.error('Failed to parse user from localStorage', e);
        localStorage.removeItem('user');
    }

    const AuthService = {
        token: localStorage.getItem('token'),
        user: storedUser,

        async request(endpoint, method = 'GET', body = null) {
            if (MOCK_MODE) return this.mockRequest(endpoint, method, body);

            const headers = { 'Content-Type': 'application/json' };
            if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

            try {
                const res = await fetch(`${API_URL}${endpoint}`, {
                    method,
                    headers,
                    body: body ? JSON.stringify(body) : null
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
                return data;
            } catch (e) {
                // console.error('API Error:', e);
                throw e;
            }
        },

        // Mock API for demonstration when backend is offline
        async mockRequest(endpoint, method, body) {
        // console.log(`[MOCK] ${method} ${endpoint}`, body);
        await new Promise(r => setTimeout(r, 500)); // Simulate delay

        if (endpoint === '/auth/login') {
            if (body.email === 'admin@example.com' && body.password === '123456') {
                return {
                    token: 'mock_admin_token',
                    user: { id: 1, name: 'Admin User', email: 'admin@example.com', plan: 'business', credits: -1, role: 'admin' }
                };
            }
            return {
                token: 'mock_user_token',
                user: { id: 2, name: 'Demo User', email: body.email, plan: 'free', credits: 5, role: 'user' }
            };
        }

        if (endpoint === '/auth/register') {
            return {
                token: 'mock_user_token',
                user: { id: 3, name: body.name, email: body.email, plan: 'free', credits: 5, role: 'user' }
            };
        }

        if (endpoint === '/user/profile') {
            return this.user;
        }

        if (endpoint === '/export/history') {
            return [
                { 
                    id: 1, 
                    type: 'dxf', 
                    cost: 1, 
                    created_at: new Date().toISOString(),
                    parameters: JSON.stringify({ width: 60, height: 40, shapeType: 'rectangle', holePattern: 'corners' })
                },
                { 
                    id: 2, 
                    type: 'svg', 
                    cost: 1, 
                    created_at: new Date(Date.now() - 86400000).toISOString(),
                    parameters: JSON.stringify({ width: 30, height: 30, shapeType: 'oval', holePattern: 'none' })
                }
            ];
        }

        if (endpoint === '/admin/stats') {
            return {
                totalUsers: 150,
                totalExports: 1240,
                totalRevenue: 3500
            };
        }

        if (endpoint === '/admin/users') {
            return [
                { id: 1, name: 'Admin User', email: 'oelbanna026@gmail.com', plan: 'business', credits: -1, role: 'admin', created_at: '2023-01-01' },
                { id: 2, name: 'John Doe', email: 'john@example.com', plan: 'pro', credits: 85, role: 'user', created_at: '2023-02-15' },
                { id: 3, name: 'Jane Smith', email: 'jane@example.com', plan: 'free', credits: 2, role: 'user', created_at: '2023-03-10' }
            ];
        }
        
        if (endpoint === '/payment/mock-purchase') {
            return { success: true, message: 'Mock purchase successful' };
        }

        return {};
    },

    async login(email, password) {
        const data = await this.request('/auth/login', 'POST', { email, password });
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        return data;
    },

    async register(name, email, password) {
        const data = await this.request('/auth/register', 'POST', { name, email, password });
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        return data;
    },

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    },

    async getProfile() {
        if (!this.token) return null;
        try {
            const user = await this.request('/user/profile');
            this.user = user;
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (e) {
            if (e.message.includes('token') || e.message.includes('auth')) {
                this.logout();
            }
            return null;
        }
    },

    async deductCredit(type, filename) {
        const res = await this.request('/export/deduct', 'POST', { type, filename });
        if (res.success) {
            // Update local user credits if provided in response, otherwise fetch profile
            if (res.credits !== undefined) {
                 this.user.credits = res.credits;
                 localStorage.setItem('user', JSON.stringify(this.user));
            } else {
                await this.getProfile();
            }
        }
        return res;
    },

    async mockPurchase(plan, credits, amount) {
        if (!this.user) throw new Error('Must be logged in');
        const res = await this.request('/payment/mock-purchase', 'POST', {
            userId: this.user.id,
            plan,
            credits,
            amount
        });
        await this.getProfile(); // Refresh credits
        return res;
    },

    async forgotPassword(email) {
        return await this.request('/auth/forgot-password', 'POST', { email });
    },

    async resetPassword(token, newPassword) {
        return await this.request('/auth/reset-password', 'POST', { token, newPassword });
    },

    async getHistory() {
        return await this.request('/export/history');
    },

    async getAdminStats() {
        return await this.request('/admin/stats');
    },

    async getAdminUsers() {
        return await this.request('/admin/users');
    },

    async getPublicStats() {
        return await this.request('/public/stats');
    }
};

    window.AuthService = AuthService;
})();