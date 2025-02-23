// Router Class for SPA navigation
export class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;

        // Bind methods
        this.handleRoute = this.handleRoute.bind(this);
        this.navigate = this.navigate.bind(this);

        // Set up event listeners
        window.addEventListener('popstate', this.handleRoute);
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="/"]');
            if (link) {
                e.preventDefault();
                this.navigate(link.getAttribute('href'));
            }
        });
    }

    // Add routes with their corresponding views and guards
    addRoute(path, {
        component,
        guard = null,
        title = 'ft_transcendence'
    }) {
        this.routes.set(path, { component, guard, title });
    }

    // Navigate to a new route
    navigate(path, options = {}) {
        console.log('Navigating to:', path);
        
        // Update browser history
        if (options.replace) {
            window.history.replaceState(null, '', path);
        } else {
            window.history.pushState(null, '', path);
        }
        
        // Handle the new route
        this.handleRoute();
    }

    // Handle route changes
    async handleRoute() {
        const path = window.location.pathname;
        console.log('Handling route:', path);
        
        let route = this.routes.get(path);
        
        // If route not found, use 404 route
        if (!route) {
            console.log('Route not found, using 404');
            route = this.routes.get('*');
        }

        try {
            // Check route guard
            if (route.guard && !route.guard()) {
                console.log('Route guard failed, redirecting to appropriate page');
                // If authenticated, go to dashboard, otherwise go to landing
                const redirectPath = window.authService?.isAuthenticated() ? '/dashboard' : '/';
                this.navigate(redirectPath, { replace: true });
                return;
            }

            // Update document title
            document.title = route.title;

            // Get the app container
            const appContainer = document.getElementById('app');
            if (!appContainer) {
                throw new Error('App container not found');
            }

            // Render component
            const content = await route.component();
            appContainer.innerHTML = content;

            // Update active navigation item
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                const itemPath = item.getAttribute('href');
                item.classList.toggle('active', itemPath === path);
            });

            // Update page title in header
            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) {
                pageTitle.textContent = route.title;
            }

            // Update current route
            this.currentRoute = path;

            // Dispatch event for newly loaded content
            window.dispatchEvent(new CustomEvent('routeLoaded', { 
                detail: { path, route } 
            }));
        } catch (error) {
            console.error('Route handling failed:', error);
            // Handle route loading error
            const notFoundRoute = this.routes.get('*');
            document.title = notFoundRoute.title;
            document.getElementById('app').innerHTML = await notFoundRoute.component();
        }
    }
}

// Create and export router instance
export const router = new Router();
