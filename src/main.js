import { authManager } from './lib/auth.js';
import { renderHeader, attachHeaderListeners } from './components/Header.js';
import { router } from './router.js';

const headerRoot = document.getElementById('header-root');
const footerRoot = document.getElementById('footer-root');

const renderApp = (user) => {
    // Render header
    headerRoot.innerHTML = renderHeader(user);
    attachHeaderListeners();

    // Render footer
    footerRoot.innerHTML = `
        <div class="w-full py-6 text-center text-xs text-white/60 font-mono border-t border-white/10 mt-12">
            © ${new Date().getFullYear()} docenclave — Built for the future.
        </div>
    `;
};

// Initial render and setup
document.addEventListener('DOMContentLoaded', () => {
    // Initial router call
    router();
    
    // Subscribe to auth changes to re-render header and potentially the current page
    authManager.subscribe((user) => {
        renderApp(user);
        // Re-run the router to re-render the current page with the new auth state
        router(); 
    });
});