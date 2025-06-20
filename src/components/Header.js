import { navigate } from '../router.js';

const roleStyles = {
  free: "bg-gray-300 text-black font-bold border border-gray-500/50 hover:bg-gray-400/80",
  premium: "bg-gradient-to-br from-purple-500 via-blue-400 to-cyan-400 text-white font-bold border border-blue-300 hover:from-purple-600 hover:to-cyan-500 shadow-md",
  admin: "bg-gradient-to-br from-cyan-700 via-cyan-400 to-sky-300 text-white font-bold border border-cyan-300 hover:from-cyan-800 hover:to-sky-500 shadow-md",
  superadmin: "bg-gradient-to-r from-yellow-400 via-rose-400 to-fuchsia-500 text-white font-extrabold border-2 border-fuchsia-500 shadow-lg ring-4 ring-fuchsia-300/30 animate-pulse hover:from-yellow-500 hover:to-fuchsia-600",
};

const LogoHorizontal = (size = 38) => `
    <span class="flex items-center gap-2 font-mono font-extrabold text-white text-2xl md:text-3xl select-none">
        <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" class="drop-shadow-[0_0_16px_#fff3]" style="filter: drop-shadow(0 0 6px #fff8),drop-shadow(0 0 32px #57cbfd12);">
            <rect x="7" y="7" rx="16" width="50" height="50" fill="rgba(44,44,44,0.72)" stroke="#e9e9e9" stroke-width="2.5" style="filter: drop-shadow(0 0 8px #fff3)"></rect>
            <path d="M25 17h13a13 13 0 1 1 0 26h-13V17z" fill="#fff" style="filter: drop-shadow(0 0 14px #e9e9e9)"></path>
            <path d="M25 17h13a13 13 0 1 1 0 26h-13V17z" fill="none" stroke="#9DECF9" stroke-width="2" style="filter: drop-shadow(0 0 12px #9DECF966)"></path>
        </svg>
        <span class="uppercase tracking-widest">DocEnclave</span>
    </span>
`;

const AnimatedAuthButton = () => `
    <div class="relative overflow-hidden w-[100px] h-10">
      <div id="auth-button-container" class="flex transition-transform duration-700 ease-in-out">
        <button id="login-nav-btn" class="flex-shrink-0 w-[100px] whitespace-nowrap text-black bg-white font-semibold border border-white/30 hover:bg-gray-200 ml-2 rounded-md h-10 px-4 py-2 text-sm inline-flex items-center justify-center">Login</button>
        <button id="signup-nav-btn" class="flex-shrink-0 w-[100px] whitespace-nowrap text-black bg-white font-semibold border border-white/30 hover:bg-gray-200 ml-2 rounded-md h-10 px-4 py-2 text-sm inline-flex items-center justify-center">Sign Up</button>
      </div>
    </div>
`;

export const renderHeader = (user) => {
    const userRole = user?.role || "free";
    const levelStyle = roleStyles[userRole] || roleStyles["free"];
    const currentPath = window.location.hash.slice(1);

    return `
        <div class="w-full flex items-center justify-between px-3 py-5 md:px-10 bg-transparent border-b border-white/10">
            <a href="/#" id="logo-link" class="hover:opacity-90 transition-opacity">
                ${LogoHorizontal()}
            </a>
            <nav class="flex items-center gap-2 md:gap-6">
                ${user && (user.role === "admin" || user.role === "superadmin") ? `
                    <button id="dashboard-nav-btn" class="h-10 px-4 py-2 rounded-md text-sm text-cyan-300 border border-cyan-400/60 bg-cyan-900/30 hover:bg-cyan-400/20 ml-2 font-mono uppercase font-extrabold transition-colors shadow ${currentPath === "/admin-dashboard" ? "ring-2 ring-cyan-400" : ""}">
                        Dashboard
                    </button>
                ` : ''}

                ${!user ? AnimatedAuthButton() : ''}
                
                ${user ? `
                    <button id="account-nav-btn" class="ml-2 px-5 py-2 rounded-lg shadow-md font-mono uppercase tracking-widest text-base transition-all ${levelStyle.className}">
                        ${user.role}
                    </button>
                ` : ''}
            </nav>
        </div>
    `;
};

export const attachHeaderListeners = () => {
    document.getElementById('logo-link')?.addEventListener('click', (e) => { e.preventDefault(); navigate('#/'); });
    document.getElementById('dashboard-nav-btn')?.addEventListener('click', () => navigate('#/admin-dashboard'));
    document.getElementById('account-nav-btn')?.addEventListener('click', () => navigate('#/account'));

    const authContainer = document.getElementById('auth-button-container');
    if(authContainer) {
        let showLogin = true;
        setInterval(() => {
            showLogin = !showLogin;
            authContainer.style.transform = showLogin ? 'translateX(0%)' : 'translateX(-110px)';
        }, 5000);
    }
    document.getElementById('login-nav-btn')?.addEventListener('click', () => navigate('#/login'));
    document.getElementById('signup-nav-btn')?.addEventListener('click', () => navigate('#/signup'));
};