import { authManager } from '../lib/auth.js';
import { navigate } from '../router.js';

const roleStyles = {
  free: { className: "bg-gray-500 text-white", icon: "🆓" },
  premium: { className: "bg-gradient-to-br from-purple-500 to-cyan-400 text-white", icon: "⭐" },
  admin: { className: "bg-gradient-to-br from-cyan-700 to-sky-300 text-white", icon: "🛡️" },
  superadmin: { className: "bg-gradient-to-r from-yellow-400 to-fuchsia-500 text-white", icon: "👑" },
};

export const render = () => {
    const user = authManager.getCurrentUser();
    const loading = authManager.isLoading();

    if (loading) {
        return `<div class="min-h-screen flex justify-center items-center"><div class="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>`;
    }

    if (!user) {
        navigate('#/login');
        return ''; // Redirecting, so render nothing.
    }

    const userRole = user.role || "free";
    const roleStyle = roleStyles[userRole] || roleStyles["free"];

    const infoRow = (icon, label, value) => `
        <div class="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
            <div class="w-5 h-5 text-cyan-400 flex items-center justify-center">${icon}</div>
            <div>
                <div class="text-xs text-white/60 uppercase font-mono">${label}</div>
                <div class="text-white/90 font-mono text-sm">${value}</div>
            </div>
        </div>
    `;

    return `
        <div class="min-h-screen flex flex-col items-center justify-center w-full px-2 py-8 animate-fade-in">
            <div class="w-full max-w-lg mx-auto border-cyan-400/30 shadow-lg bg-gray-900/95 rounded-xl border">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <button id="home-btn" class="flex items-center gap-2 text-cyan-400 hover:bg-cyan-500/10 h-9 px-3 rounded-md text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                            Home
                        </button>
                        <button id="logout-btn" class="flex items-center gap-2 text-red-400 hover:bg-red-500/10 h-9 px-3 rounded-md text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
                            Logout
                        </button>
                    </div>
                    <div class="text-center">
                        <h3 class="text-white font-mono tracking-widest uppercase text-2xl mb-4">Account Details</h3>
                        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold font-mono uppercase ${roleStyle.className}">
                            <span class="text-lg">${roleStyle.icon}</span>
                            ${userRole}
                        </div>
                    </div>
                </div>
                <div class="p-6 pt-0 space-y-4">
                    <div class="grid gap-3">
                        ${infoRow('👤', 'User ID', user.uid)}
                        ${user.email ? infoRow('📧', 'Email', user.email) : ''}
                        ${user.displayName ? infoRow('👤', 'Display Name', user.displayName) : ''}
                        ${user.phoneNumber ? infoRow('📞', 'Phone', user.phoneNumber) : ''}
                        ${user.promoCodeRedeemed ? infoRow('🛡️', 'Promo Code Used', user.promoCodeRedeemed) : ''}
                    </div>
                    ${(user.role === "admin" || user.role === "superadmin") ? `
                        <button id="admin-dashboard-btn" class="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-mono uppercase tracking-widest h-10 px-4 py-2 rounded-md flex items-center justify-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path></svg>
                            Admin Dashboard
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
};

export const attachListeners = () => {
    const user = authManager.getCurrentUser();
    if (!user) return; // Should be handled by render, but as a safeguard.

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
    document.getElementById('admin-dashboard-btn')?.addEventListener('click', () => navigate('#/admin-dashboard'));
};