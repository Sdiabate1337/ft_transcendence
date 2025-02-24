import { authService } from '../services/auth.service.js';
import { router } from './router.js';
import { GameManager } from '../components/game.js';

// Helper function to wrap content in dashboard layout
async function withDashboardLayout(contentPromise) {
    try {
        // Load layout template
        const layoutResponse = await fetch('/views/dashboard/layout.html');
        const layout = await layoutResponse.text();
        
        // Get content
        const content = await contentPromise();
        
        // Get user data
        const user = authService.getCurrentUser();
        
        // Create a temporary div to parse the layout HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = layout;
        
        // Find the main content div and insert the content
        const mainContent = tempDiv.querySelector('#mainContent');
        if (mainContent) {
            mainContent.innerHTML = content;
        }
        
        // Update user data in the layout
        const userAvatar = tempDiv.querySelector('#userAvatar');
        const userName = tempDiv.querySelector('#userName');
        
        if (userAvatar) {
            userAvatar.src = user?.avatar || '/assets/images/default-avatar.png';
            userAvatar.alt = user?.displayName || 'User';
        }
        
        if (userName) {
            userName.textContent = user?.displayName || 'User';
        }
        
        // Get the final HTML
        return tempDiv.innerHTML;
    } catch (error) {
        console.error('Error loading dashboard layout:', error);
        return '<div class="error">Error loading dashboard</div>';
    }
}

// Define components
const components = {
    // Landing page (public)
    landing: async () => {
        const response = await fetch('/views/landing/index.html');
        const content = await response.text();
        
        // Add event listeners after content is loaded
        window.addEventListener('routeLoaded', () => {
            const login42Btn = document.getElementById('login42');
            const mockLoginBtn = document.getElementById('mockLoginBtn');
            
            if (login42Btn) {
                login42Btn.addEventListener('click', () => {
                    authService.login42();
                });
            }
            
            if (mockLoginBtn) {
                mockLoginBtn.addEventListener('click', () => {
                    authService.mockLogin();
                });
            }
        });
        
        return content;
    },

    // Login page (public)
    login: async () => {
        const response = await fetch('/views/auth/login.html');
        const content = await response.text();
        
        // Add event listeners after content is loaded
        window.addEventListener('routeLoaded', () => {
            const loginForm = document.getElementById('loginForm');
            const login42Btn = document.getElementById('login42');
            const mockLoginBtn = document.getElementById('mockLoginBtn');
            
            if (loginForm) {
                loginForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const email = loginForm.email.value;
                    const password = loginForm.password.value;
                    
                    try {
                        await authService.loginWithEmail(email, password);
                    } catch (error) {
                        console.error('Login failed:', error);
                        // Show error message
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'error-message';
                        errorDiv.textContent = error.message || 'Login failed. Please try again.';
                        loginForm.insertBefore(errorDiv, loginForm.firstChild);
                    }
                });
            }
            
            if (login42Btn) {
                login42Btn.addEventListener('click', () => {
                    authService.login42();
                });
            }
            
            if (mockLoginBtn) {
                mockLoginBtn.addEventListener('click', () => {
                    authService.mockLogin();
                });
            }
        });
        
        return content;
    },

    // Register page (public)
    register: async () => {
        const response = await fetch('/views/auth/register.html');
        const content = await response.text();
        
        // Add event listeners after content is loaded
        window.addEventListener('routeLoaded', () => {
            const registerForm = document.getElementById('registerForm');
            const login42Btn = document.getElementById('login42');
            
            if (registerForm) {
                registerForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const email = registerForm.email.value;
                    const password = registerForm.password.value;
                    const confirmPassword = registerForm.confirmPassword.value;
                    const displayName = registerForm.displayName.value;
                    
                    // Validate passwords match
                    if (password !== confirmPassword) {
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'error-message';
                        errorDiv.textContent = 'Passwords do not match';
                        registerForm.insertBefore(errorDiv, registerForm.firstChild);
                        return;
                    }
                    
                    try {
                        await authService.registerWithEmail(email, password, displayName);
                    } catch (error) {
                        console.error('Registration failed:', error);
                        // Show error message
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'error-message';
                        errorDiv.textContent = error.message || 'Registration failed. Please try again.';
                        registerForm.insertBefore(errorDiv, registerForm.firstChild);
                    }
                });
            }
            
            if (login42Btn) {
                login42Btn.addEventListener('click', () => {
                    authService.login42();
                });
            }
        });
        
        return content;
    },

    // Login callback (public)
    callback: async () => {
        const response = await fetch('/views/auth/callback.html');
        const content = await response.text();
        
        // Handle OAuth callback
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            try {
                const redirectPath = await authService.handleOAuthCallback(code);
                router.navigate(redirectPath, { replace: true });
            } catch (error) {
                console.error('Auth callback failed:', error);
                router.navigate('/', { replace: true });
            }
        } else {
            router.navigate('/', { replace: true });
        }
        
        return content;
    },

    // Dashboard overview (protected)
    dashboard: async () => {
        const response = await fetch('/views/dashboard/index.html');
        return await response.text();
    },

    // Game view (protected)
    game: async () => {
        const response = await fetch('/views/dashboard/game.html');
        return  await response.text();
    },

    // Chat view (protected)
    chat: async () => {
        const response = await fetch('/views/dashboard/chat.html');
        return await response.text();
    },

    // Profile view (protected)
    profile: async () => {
        const response = await fetch('/views/dashboard/profile.html');
        return await response.text();
    },

    // Tournament view (protected)
    tournament: async () => {
        const response = await fetch('/views/dashboard/tournament.html');
        return await response.text();
    },

    // Settings view (protected)
    settings: async () => {
        const response = await fetch('/views/dashboard/settings.html');
        return await response.text();
    },

    // Profile setup (protected)
    setup: async () => {
        const response = await fetch('/views/dashboard/setup.html');
        return await response.text();
    },

    // 404 Not Found
    notFound: async () => {
        return '<div class="error-page"><h1>404 - Page Not Found</h1></div>';
    }
};

// Initialize routes
function initializeRoutes() {
    // Public routes
    router.addRoute('/', {
        component: components.landing,
        title: 'Welcome',
        guard: () => !authService.isAuthenticated() // Only show landing if not authenticated
    });

    router.addRoute('/auth/callback', {
        component: components.callback,
        title: 'Completing Authentication'
    });

    router.addRoute('/login', {
        component: components.login,
        title: 'Login',
        guard: () => !authService.isAuthenticated() // Only show login if not authenticated
    });

    router.addRoute('/register', {
        component: components.register,
        title: 'Create Account',
        guard: () => !authService.isAuthenticated() // Only show register if not authenticated
    });

    // Protected routes (all use dashboard layout)
    const protectedRoutes = [
        { path: '/dashboard', component: components.dashboard, title: 'Dashboard' },
        { path: '/game', component: components.game, title: 'Play Game' },
        { path: '/chat', component: components.chat, title: 'Chat' },
        { path: '/profile', component: components.profile, title: 'Profile' },
        { path: '/tournament', component: components.tournament, title: 'Tournament' },
        { path: '/settings', component: components.settings, title: 'Settings' },
        { path: '/auth/setup', component: components.setup, title: 'Complete Your Profile' }
    ];

    protectedRoutes.forEach(route => {
        router.addRoute(route.path, {
            component: () => withDashboardLayout(route.component),
            title: route.title,
            guard: () => authService.isAuthenticated()
        });
    });

    // 404 route
    router.addRoute('*', {
        component: components.notFound,
        title: '404 - Page Not Found'
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing app...');
    initializeRoutes();
    
    // Check if user is authenticated and redirect accordingly
    if (authService.isAuthenticated() && window.location.pathname === '/') {
        router.navigate('/dashboard', { replace: true });
    } else if (!authService.isAuthenticated() && window.location.pathname !== '/') {
        router.navigate('/', { replace: true });
    } else {
        router.handleRoute();
    }
});
