import { authManager } from '../lib/auth.js';
import { navigate } from '../router.js';

export const render = () => {
    const user = authManager.getCurrentUser();
    const loading = authManager.isLoading();
    
    if (loading) {
        return `<div class="min-h-screen flex items-center justify-center bg-black"><span class="text-cyan-400 animate-pulse text-xl font-mono font-bold">Verifying Access...</span></div>`;
    }

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        navigate('#/');
        return '';
    }

    return `
        <div class="min-h-screen w-full py-8 px-4 animate-fade-in">
            <div class="w-full max-w-7xl mx-auto bg-gray-900/95 border border-cyan-400/30 shadow-2xl shadow-cyan-500/10 rounded-xl p-6 md:p-10">
                <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 class="text-3xl text-white font-bold font-mono tracking-widest uppercase">Admin Dashboard</h1>
                        <p class="text-cyan-400 text-sm font-mono mt-1">${user.email}</p>
                    </div>
                    <div class="flex gap-2">
                        <button id="home-btn" class="h-10 px-4 py-2 rounded-md text-sm border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-mono border inline-flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                            Home
                        </button>
                        <button id="logout-btn" class="h-10 px-4 py-2 rounded-md text-sm border-red-500 text-red-400 hover:bg-red-500/10 font-mono border inline-flex items-center justify-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
                            Logout
                        </button>
                    </div>
                </header>
                <div class="text-white text-center p-16 border-2 border-dashed border-gray-600 rounded-lg">
                    <h2 class="text-2xl font-bold">Admin Dashboard Content</h2>
                    <p class="text-gray-400 mt-2">The UI for Analytics, Users, and Promo Codes tabs would be built out here.</p>
                </div>
            </div>
        </div>
    `;
};

export const attachListeners = () => {
    const user = authManager.getCurrentUser();
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        alert("Access Denied. You must be an admin to view this page.");
        return;
    }

    document.getElementById('home-btn')?.addEventListener('click', () => navigate('#/'));
    document.getElementById('logout-btn')?.addEventListener('click', async () => {
        try {
            await authManager.logout();
            alert("Logged out successfully");
            navigate('#/');
        } catch (error) {
            alert("Logout failed. Please try again.");
        }
    });
};