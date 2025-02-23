import { API_CONFIG } from './config.js';

class ApiError extends Error {
    constructor(message, status, code) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

class ApiClient {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.headers = { ...API_CONFIG.HEADERS };
    }

    setAuthToken(token) {
        if (token) {
            this.headers['Authorization'] = `Bearer ${token}`;
        } else {
            delete this.headers['Authorization'];
        }
    }

    async request(endpoint, options = {}) {
        const url = this.baseURL + endpoint;
        const config = {
            ...options,
            headers: {
                ...this.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            
            // Handle 401 (Unauthorized) - Trigger token refresh
            if (response.status === 401 && endpoint !== API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN) {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    // Retry the original request
                    return this.request(endpoint, options);
                }
            }

            const data = await response.json();

            if (!response.ok) {
                throw new ApiError(
                    data.message || 'API request failed',
                    response.status,
                    data.code
                );
            }

            return data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(
                'Network error or invalid JSON response',
                500,
                'NETWORK_ERROR'
            );
        }
    }

    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                return false;
            }

            const response = await this.request(
                API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN,
                {
                    method: 'POST',
                    body: JSON.stringify({ refreshToken })
                }
            );

            if (response.accessToken) {
                localStorage.setItem('accessToken', response.accessToken);
                this.setAuthToken(response.accessToken);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }

    // Auth endpoints
    async login42Callback(code) {
        return this.request(API_CONFIG.ENDPOINTS.AUTH.LOGIN_42, {
            method: 'POST',
            body: JSON.stringify({ code })
        });
    }

    async logout() {
        return this.request(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
            method: 'POST'
        });
    }

    async verify2FA(code) {
        return this.request(API_CONFIG.ENDPOINTS.AUTH.VERIFY_2FA, {
            method: 'POST',
            body: JSON.stringify({ code })
        });
    }

    // Email/Password Authentication
    async loginWithEmail(email, password) {
        const response = await this.request(API_CONFIG.ENDPOINTS.AUTH.LOGIN_EMAIL, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        return response;
    }

    async registerWithEmail(email, password, displayName) {
        const response = await this.request(API_CONFIG.ENDPOINTS.AUTH.REGISTER_EMAIL, {
            method: 'POST',
            body: JSON.stringify({ email, password, displayName })
        });
        return response;
    }

    // User endpoints
    async getUserProfile() {
        return this.request(API_CONFIG.ENDPOINTS.USER.PROFILE);
    }

    async updateProfile(data) {
        return this.request(API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async uploadAvatar(file) {
        const formData = new FormData();
        formData.append('avatar', file);

        return this.request(API_CONFIG.ENDPOINTS.USER.UPLOAD_AVATAR, {
            method: 'POST',
            headers: {
                // Remove Content-Type to let browser set it with boundary
                'Content-Type': undefined
            },
            body: formData
        });
    }

    async checkDisplayName(displayName) {
        return this.request(
            `${API_CONFIG.ENDPOINTS.USER.CHECK_DISPLAY_NAME}?name=${encodeURIComponent(displayName)}`
        );
    }

    async getMatchHistory() {
        return this.request(API_CONFIG.ENDPOINTS.USER.MATCH_HISTORY);
    }

    async getUserStats() {
        return this.request(API_CONFIG.ENDPOINTS.USER.STATS);
    }

    // Friends endpoints
    async getFriendsList() {
        return this.request(API_CONFIG.ENDPOINTS.FRIENDS.LIST);
    }

    async addFriend(userId) {
        return this.request(API_CONFIG.ENDPOINTS.FRIENDS.ADD, {
            method: 'POST',
            body: JSON.stringify({ userId })
        });
    }

    async removeFriend(userId) {
        return this.request(API_CONFIG.ENDPOINTS.FRIENDS.REMOVE, {
            method: 'POST',
            body: JSON.stringify({ userId })
        });
    }

    async acceptFriendRequest(userId) {
        return this.request(API_CONFIG.ENDPOINTS.FRIENDS.ACCEPT, {
            method: 'POST',
            body: JSON.stringify({ userId })
        });
    }

    async rejectFriendRequest(userId) {
        return this.request(API_CONFIG.ENDPOINTS.FRIENDS.REJECT, {
            method: 'POST',
            body: JSON.stringify({ userId })
        });
    }

    async getFriendsStatus() {
        return this.request(API_CONFIG.ENDPOINTS.FRIENDS.STATUS);
    }
}

// Create and export singleton instance
export const apiClient = new ApiClient();
