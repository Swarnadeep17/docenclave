export const render = () => `
    <div class="min-h-screen w-full flex flex-col justify-center items-center px-2 py-8">
      <div class="w-full max-w-md mx-auto bg-gray-900/95 border border-cyan-300/20 shadow-xl rounded-xl py-12 px-8 text-center animate-fade-in">
        <h1 class="text-5xl text-white font-bold font-mono mb-3 tracking-widest">404</h1>
        <p class="text-xl text-white/70 mb-6 font-mono">Oops! Page not found</p>
        <a href="/#" class="inline-block rounded bg-white hover:bg-gray-200 text-black px-6 py-2 font-mono uppercase text-sm tracking-wider font-bold shadow transition-all">
          Return to Home
        </a>
      </div>
    </div>
`;

export const attachListeners = () => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      window.location.hash.slice(1)
    );
};