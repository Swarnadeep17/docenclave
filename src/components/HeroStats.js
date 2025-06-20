import { db } from '../lib/firebase.js';
import { ref, onValue } from "firebase/database";

const SoftGlowingNumber = (children) => `
    <span class="inline-block font-bold font-mono text-[2.1rem] sm:text-4xl text-transparent bg-gradient-to-br from-cyan-100 via-white to-violet-200 bg-clip-text" style="filter: drop-shadow(0 2px 6px #6ee7b7b6); text-shadow: 0 1px 4px #89c2fa, 0 0 1px #fff;">
        ${children}
    </span>
`;

const StatLabel = (children) => `<span class="ml-1 text-base font-medium text-cyan-100/75 tracking-wide">${children}</span>`;
const DotSep = () => `<span class="mx-3 text-cyan-300/20 select-none text-2xl align-middle">•</span>`;

const renderStatsContent = (stats, loading) => {
    if (loading) {
        return `
            <div class="flex items-center gap-3">
                <div class="w-12 h-7 rounded-md bg-muted animate-pulse"></div>
                ${DotSep()}
                <div class="w-12 h-7 rounded-md bg-muted animate-pulse"></div>
            </div>`;
    }

    const visits = stats?.overall?.visits;
    const downloads = stats?.overall?.downloads;
    const month = new Date().toLocaleString("en-US", { month: "short", year: "2-digit" });

    if (typeof visits === "number" && typeof downloads === "number") {
        return `
            <div class="flex items-center justify-center gap-0 whitespace-nowrap">
                ${SoftGlowingNumber(visits.toLocaleString())} ${StatLabel('visits')}
                ${DotSep()}
                ${SoftGlowingNumber(downloads.toLocaleString())} ${StatLabel('downloads')}
                <span class="ml-2 text-xs text-cyan-100/40 font-mono">${month}</span>
            </div>`;
    }

    return `<div class="text-red-400 font-mono">No stats available</div>`;
};

export const render = () => `
    <section class="mt-12 mb-8 flex flex-col items-center w-full animate-fade-in">
        <div class="bg-gradient-to-br from-gray-900/90 via-gray-950/70 to-black/95 px-8 py-8 rounded-2xl border border-cyan-300/20 shadow-cyan-200/10 shadow-2xl w-full max-w-lg text-center backdrop-blur-md ring-2 ring-cyan-300/10">
            <h1 class="text-4xl md:text-5xl font-extrabold font-mono tracking-[.02em] text-white drop-shadow-xl mb-5">
                Privacy-first document tools
            </h1>
            <div id="stats-content" class="mt-2 mb-1 flex items-center justify-center w-full">
                ${renderStatsContent(null, true)}
            </div>
            <div class="text-cyan-50/90 text-base mt-7 font-medium max-w-sm mx-auto leading-relaxed">
                All tools run fully in your browser for total privacy. <br />
                Never upload your files. No sign up needed.
            </div>
        </div>
    </section>
`;

export const attachListeners = () => {
    const statsContent = document.getElementById('stats-content');
    const statsRef = ref(db, "/stats");
    const unsubscribe = onValue(statsRef, (snapshot) => {
        const data = snapshot.val();
        if (statsContent) {
            statsContent.innerHTML = renderStatsContent(data, false);
        }
    });

    // Cleanup listener when navigating away (conceptual - depends on router implementation)
    // For now, this will stay active as long as the app is running.
};