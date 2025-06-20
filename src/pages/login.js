import { authManager } from '../lib/auth.js';
import { navigate } from '../router.js';

export const render = () => `
    <div class="min-h-screen w-full flex items-center justify-center px-2 py-8">
        <form id="login-form" class="w-full max-w-md mx-auto bg-gray-900/95 shadow-xl rounded-xl p-8 border border-cyan-300/20">
            <h2 class="text-3xl font-bold text-white mb-6 text-center font-mono tracking-widest uppercase">Login</h2>
            <div class="space-y-4">
                <div>
                    <label for="email" class="block mb-1 font-mono text-xs text-white/70">Email</label>
                    <input type="email" id="email" autocomplete="email" required class="flex h-10 w-full rounded-md border border-cyan-600/30 bg-black/30 px-3 py-2 text-base text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                </div>
                <div>
                    <label for="password" class="block mb-1 font-mono text-xs text-white/70">Password</label>
                    <input type="password" id="password" autocomplete="current-password" required class="flex h-10 w-full rounded-md border border-cyan-600/30 bg-black/30 px-3 py-2 text-base text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                </div>
                <div id="error-message" class="text-red-400 font-mono text-xs h-4"></div>
                <button type="submit" id="login-btn" class="w-full mt-2 bg-black hover:bg-gray-800 text-white font-bold shadow transition-all uppercase h-10 px-4 py-2 rounded-md inline-flex items-center justify-center">Login</button>
            </div>
            <div class="flex gap-2 my-6 items-center justify-center">
                <span class="block border-b w-16 border-gray-200/30"></span>
                <span class="font-medium text-gray-400">or</span>
                <span class="block border-b w-16 border-gray-200/30"></span>
            </div>
            <button id="google-login-btn" type="button" class="w-full flex items-center justify-center mb-2 border border-white/70 text-black bg-white font-bold uppercase hover:bg-gray-200 hover:text-black transition-all h-10 px-4 py-2 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 22c-1.667 0-3.235-.427-4.577-1.19a9.92 9.92 0 0 1-2.288-2.288A9.92 9.92 0 0 1 4 12"></path></svg>
                Login with Google
            </button>
        </form>
    </div>
`;

export const attachListeners = () => {
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorDiv = document.getElementById('error-message');
    const googleBtn = document.getElementById('google-login-btn');
    const loginBtn = document.getElementById('login-btn');

    const setLoading = (isLoading) => {
        emailInput.disabled = isLoading;
        passwordInput.disabled = isLoading;
        googleBtn.disabled = isLoading;
        loginBtn.disabled = isLoading;
        loginBtn.textContent = isLoading ? 'Logging In...' : 'Login';
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorDiv.textContent = '';
        setLoading(true);
        try {
            await authManager.loginWithEmail(emailInput.value, passwordInput.value);
            alert('Login successful!');
            navigate('#/');
        } catch (err) {
            errorDiv.textContent = err.message || 'An unknown error occurred.';
        } finally {
            setLoading(false);
        }
    });

    googleBtn.addEventListener('click', async () => {
        errorDiv.textContent = '';
        setLoading(true);
        try {
            await authManager.loginWithGoogle();
            alert('Logged in with Google!');
            navigate('#/');
        } catch (err) {
            errorDiv.textContent = err.message || 'An unknown error occurred.';
        } finally {
            setLoading(false);
        }
    });
};