export const render = ({ title, description, icon }) => `
    <div class="relative group bg-gray-900/60 border border-white/10 rounded-2xl p-6 flex flex-col items-start transition-all duration-300 ease-in-out hover:bg-gray-900 hover:border-cyan-400/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 backdrop-blur-sm overflow-hidden h-full">
        <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative z-10 flex flex-col h-full">
            <div class="mb-4 p-2 bg-black/40 border border-white/10 rounded-lg w-fit shadow-inner">
                ${icon}
            </div>
            <h3 class="text-lg font-bold font-mono tracking-wide text-white mb-2 uppercase">
                ${title}
            </h3>
            <p class="text-sm text-cyan-100/80 font-medium leading-relaxed">
                ${description}
            </p>
        </div>
    </div>
`;