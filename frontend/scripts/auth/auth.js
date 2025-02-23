import { authService } from '../services/auth.service.js';
import { router } from '../core/router.js';

console.log('Auth module loaded');

// Initialize auth handlers
function initializeAuth() {
    console.log('Initializing auth handlers');

    // Handle 42 login button click
    const login42Btn = document.getElementById('login42Btn');
    if (login42Btn) {
        console.log('42 login button found');
        login42Btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('42 login clicked');
            authService.login42();
        });
    } else {
        console.warn('42 login button not found');
    }

    // Handle mock login button click
    const mockLoginBtn = document.getElementById('mockLoginBtn');
    if (mockLoginBtn) {
        console.log('Mock login button found');
        mockLoginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('Mock login clicked');
            try {
                const redirectPath = await authService.mockLogin();
                console.log('Mock login successful, redirecting to:', redirectPath);
                router.navigate(redirectPath);
            } catch (error) {
                console.error('Mock login failed:', error);
            }
        });
    } else {
        console.warn('Mock login button not found');
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
    // DOM already loaded, initialize immediately
    initializeAuth();
}

// Re-initialize when route changes
window.addEventListener('routeLoaded', () => {
    console.log('Route loaded, re-initializing auth handlers');
    initializeAuth();
});

// Handle profile setup form
document.addEventListener('submit', async (e) => {
    if (e.target.id === 'profileSetupForm') {
        e.preventDefault();
        
        const displayName = e.target.elements.displayName.value;
        const avatar = e.target.elements.avatar.files[0];
        
        try {
            // First check if display name is available
            const isAvailable = await authService.isDisplayNameUnique(displayName);
            if (!isAvailable) {
                throw new Error('Display name is already taken');
            }
            
            // Update profile with display name
            await authService.updateProfile({ displayName });
            
            // Upload avatar if provided
            if (avatar) {
                await authService.updateAvatar(avatar);
            }
            
            // Redirect to dashboard
            router.navigate('/dashboard');
        } catch (error) {
            console.error('Profile setup failed:', error);
            // Show error to user
        }
    }
});

// Handle avatar preview
document.addEventListener('change', (e) => {
    if (e.target.id === 'avatarInput') {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('avatarPreview').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
});

// Listen for auth state changes
authService.addListener((isAuthenticated, user) => {
    // Update UI based on auth state
    document.body.classList.toggle('authenticated', isAuthenticated);
    
    // If on landing page and authenticated, redirect to dashboard
    if (isAuthenticated && window.location.pathname === '/') {
        router.navigate('/dashboard');
    }
    
    // If on protected route and not authenticated, redirect to landing
    if (!isAuthenticated && window.location.pathname !== '/') {
        router.navigate('/');
    }
});
