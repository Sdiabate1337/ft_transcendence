// Simple SPA Router
class Router {
    constructor() {
        this.routes = {
            '/': 'home',
            '/game': 'game',
            '/tournament': 'tournament',
            '/profile': 'profile'
        };
        
        // Handle navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-page]')) {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.navigateTo(e.target.getAttribute('href'), page);
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.handleLocation();
        });

        // Initial route
        this.handleLocation();
    }

    async loadPage(page) {
        try {
            const response = await fetch(`/views/pages/${page}.html`);
            if (!response.ok) throw new Error(`Page ${page} not found`);
            const content = await response.text();
            document.getElementById('main-content').innerHTML = content;
            
            // Load page-specific scripts if needed
            this.loadPageScripts(page);
        } catch (error) {
            console.error('Error loading page:', error);
            document.getElementById('main-content').innerHTML = '<h1>Page Not Found</h1>';
        }
    }

    loadPageScripts(page) {
        // Remove any previous page-specific scripts
        document.querySelectorAll('script[data-page-script]').forEach(script => script.remove());

        // Add new page-specific script if it exists
        const script = document.createElement('script');
        script.src = `/scripts/pages/${page}.js`;
        script.type = 'module';
        script.setAttribute('data-page-script', '');
        document.body.appendChild(script);
    }

    navigateTo(url, page) {
        window.history.pushState({}, '', url);
        this.loadPage(page);
    }

    handleLocation() {
        const path = window.location.pathname;
        const page = this.routes[path] || 'home';
        this.loadPage(page);
    }
}

// Initialize router
const router = new Router();
