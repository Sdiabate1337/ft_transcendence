import { apiClient } from '../api/client.js';
import { API_CONFIG } from '../api/config.js';

class AuthService {
    constructor() {
        this.currentUser = null;
        this.listeners = new Set();
        // Initialize from stored token
        this.initializeFromToken();
    }

    async initializeFromToken() {
        const token = localStorage.getItem('accessToken');
        if (token) {
            apiClient.setAuthToken(token);
            try {
                // Fetch user profile
                const userData = await apiClient.getUserProfile();
                this.currentUser = userData;
                this.notifyListeners();
            } catch (error) {
                console.error('Failed to initialize user:', error);
                this.logout(); // Clear invalid token
            }
        }
    }

    // Initiate 42 OAuth login
    login42() {
        // Store current URL for redirect back after OAuth
        localStorage.setItem('authRedirect', window.location.pathname);
        
        // Redirect to 42 OAuth URL
        window.location.href = API_CONFIG.OAUTH_42_URL;
    }

    // Handle OAuth callback
    async handleOAuthCallback(code) {
        try {
            // Exchange code for tokens
            const authData = await apiClient.login42Callback(code);
            
            // Store tokens
            localStorage.setItem('accessToken', authData.accessToken);
            localStorage.setItem('refreshToken', authData.refreshToken);
            
            // Set token in API client
            apiClient.setAuthToken(authData.accessToken);
            
            // Get user profile
            const userData = await apiClient.getUserProfile();
            this.currentUser = userData;
            
            // Notify listeners of auth state change
            this.notifyListeners();
            
            // Return redirect path or default
            return localStorage.getItem('authRedirect') || '/dashboard';
        } catch (error) {
            console.error('OAuth callback failed:', error);
            throw error;
        } finally {
            localStorage.removeItem('authRedirect');
        }
    }

    // Verify 2FA code
    async verify2FA(code) {
        try {
            const response = await apiClient.verify2FA(code);
            if (response.verified) {
                // Update user data if needed
                const userData = await apiClient.getUserProfile();
                this.currentUser = userData;
                this.notifyListeners();
            }
            return response.verified;
        } catch (error) {
            console.error('2FA verification failed:', error);
            throw error;
        }
    }

    // Update user profile
    async updateProfile(updates) {
        try {
            const updatedUser = await apiClient.updateProfile(updates);
            this.currentUser = updatedUser;
            this.notifyListeners();
            return updatedUser;
        } catch (error) {
            console.error('Profile update failed:', error);
            throw error;
        }
    }

    // Upload avatar
    async updateAvatar(file) {
        try {
            const response = await apiClient.uploadAvatar(file);
            if (response.avatarUrl) {
                this.currentUser.avatar = response.avatarUrl;
                this.notifyListeners();
            }
            return response.avatarUrl;
        } catch (error) {
            console.error('Avatar upload failed:', error);
            throw error;
        }
    }

    // Check display name availability
    async isDisplayNameUnique(displayName) {
        try {
            const response = await apiClient.checkDisplayName(displayName);
            return response.available;
        } catch (error) {
            console.error('Display name check failed:', error);
            throw error;
        }
    }

    // Get user's match history
    async getMatchHistory() {
        try {
            return await apiClient.getMatchHistory();
        } catch (error) {
            console.error('Failed to fetch match history:', error);
            throw error;
        }
    }

    // Get user stats
    async getUserStats() {
        try {
            return await apiClient.getUserStats();
        } catch (error) {
            console.error('Failed to fetch user stats:', error);
            throw error;
        }
    }

    // Friend management
    async addFriend(userId) {
        try {
            return await apiClient.addFriend(userId);
        } catch (error) {
            console.error('Failed to add friend:', error);
            throw error;
        }
    }

    async getFriendsList() {
        try {
            return await apiClient.getFriendsList();
        } catch (error) {
            console.error('Failed to fetch friends list:', error);
            throw error;
        }
    }

    async getFriendsStatus() {
        try {
            return await apiClient.getFriendsStatus();
        } catch (error) {
            console.error('Failed to fetch friends status:', error);
            throw error;
        }
    }

    // Email/Password login
    async loginWithEmail(email, password) {
        try {
            // Login with email/password
            const authData = await apiClient.loginWithEmail(email, password);
            
            // Store tokens
            localStorage.setItem('accessToken', authData.accessToken);
            localStorage.setItem('refreshToken', authData.refreshToken);
            
            // Set token in API client
            apiClient.setAuthToken(authData.accessToken);
            
            // Get user profile
            const userData = await apiClient.getUserProfile();
            this.currentUser = userData;
            this.notifyListeners();
            
            // Redirect to saved path or dashboard
            const redirectPath = localStorage.getItem('authRedirect') || '/dashboard';
            localStorage.removeItem('authRedirect');
            window.router.navigate(redirectPath, { replace: true });
            
            return userData;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    // Email/Password registration
    async registerWithEmail(email, password, displayName) {
        try {
            // Register with email/password
            const authData = await apiClient.registerWithEmail(email, password, displayName);
            
            // Store tokens
            localStorage.setItem('accessToken', authData.accessToken);
            localStorage.setItem('refreshToken', authData.refreshToken);
            
            // Set token in API client
            apiClient.setAuthToken(authData.accessToken);
            
            // Get user profile
            const userData = await apiClient.getUserProfile();
            this.currentUser = userData;
            this.notifyListeners();
            
            // Redirect to saved path or dashboard
            const redirectPath = localStorage.getItem('authRedirect') || '/dashboard';
            localStorage.removeItem('authRedirect');
            window.router.navigate(redirectPath, { replace: true });
            
            return userData;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.currentUser;
    }

    // Logout
    async logout() {
        try {
            await apiClient.logout();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            // Clear local state regardless of API call success
            this.currentUser = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            apiClient.setAuthToken(null);
            this.notifyListeners();
        }
    }

    // Mock login for development
    async mockLogin() {
        const mockUser = {
            id: 'mock_' + Math.random().toString(36).substr(2, 9),
            email: 'mock@dev.local',
            displayName: 'Mock User',
            avatar: '/assets/images/default-avatar.png',
            stats: {
                wins: 0,
                losses: 0,
                rank: 'Novice'
            },
            friends: [],
            matchHistory: [],
            isOnline: true,
            createdAt: new Date().toISOString()
        };

        // Create mock tokens
        const mockTokens = {
            accessToken: 'mock_access_' + Math.random().toString(36).substr(2, 9),
            refreshToken: 'mock_refresh_' + Math.random().toString(36).substr(2, 9)
        };

        // Store tokens
        localStorage.setItem('accessToken', mockTokens.accessToken);
        localStorage.setItem('refreshToken', mockTokens.refreshToken);
        
        // Set mock token in API client
        apiClient.setAuthToken(mockTokens.accessToken);
        
        // Set current user
        this.currentUser = mockUser;
        this.notifyListeners();
        
        return '/dashboard';
    }

    // Add auth state change listener
    addListener(callback) {
        this.listeners.add(callback);
        // Immediately call with current state
        callback(this.isAuthenticated(), this.currentUser);
        return () => this.listeners.delete(callback);
    }

    // Notify all listeners of state change
    notifyListeners() {
        this.listeners.forEach(callback => 
            callback(this.isAuthenticated(), this.currentUser)
        );
    }
}

// Create and export singleton instance
export const authService = new AuthService();
