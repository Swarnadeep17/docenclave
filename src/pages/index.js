import { incrementStat } from '../lib/statsManager.js';
import { render as renderHeroStats, attachListeners as attachHeroStatsListeners } from '../components/HeroStats.js';
import { render as renderToolAccordion, attachListeners as attachToolAccordionListeners } from '../components/ToolAccordion.js';
import { render as renderUSPCard } from '../components/USPCard.js';
import { render as renderWhyUsTable } from '../components/WhyUsTable.js';

const USP_LIST = [
  { title: "Client-Side Only", description: "All processing is local—your data is never sent to any server, ensuring 100% privacy.", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-cyan-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>` },
  { title: "No Account Needed", description: "Access powerful document tools instantly with zero signup and no personal info required.", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-cyan-400"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>` },
  { title: "Real-Time Transparency", description: "Live stats are publicly displayed, reflecting our commitment to open usage and honesty.", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-cyan-400"><path d="M2.5 2v6m0 0v6m0-6h6m13.5 0h-6m0 0V2m0 6v6m0 0h6m0 0V8m0 6H8.5m0 0v6m0 0h6m0 0v-6"></path></svg>` },
  { title: "Zero File Uploads", description: "Never upload your docs to the internet—edit, convert or redact securely in your own browser.", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-cyan-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path></svg>` },
  { title: "Modern Web Tech", description: "Optimized for speed using cutting-edge browser technologies—no plugins or downloads needed.", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-cyan-400"><rect width="16" height="16" x="4" y="4" rx="2"></rect><rect width="6" height="6" x="9" y="9"></rect><path d="M15 2v2"></path><path d="M15 20v2"></path><path d="M2 15h2"></path><path d="M2 9h2"></path><path d="M20 15h2"></path><path d="M20 9h2"></path><path d="M9 2v2"></path><path d="M9 20v2"></path></svg>` },
  { title: "Forever Free & Secure", description: "Our mission: Simple, secure, and free tools for everyone, with no tracking—ever.", icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-cyan-400"><path d="M6 3h12l4 6-10 13L2 9Z"></path><path d="M12 22V12"></path><path d="m2 9 10-2 10 2"></path></svg>` },
];

export const render = () => `
    <div id="hero-stats-container"></div>
    
    <section class="w-full flex flex-col items-center justify-center mt-8 mb-16 px-4">
        <div class="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${USP_LIST.map(usp => renderUSPCard(usp)).join('')}
        </div>
    </section>

    <div id="tool-accordion-container" class="w-full px-4"></div>
    <div id="why-us-container" class="w-full px-4"></div>
`;

export const attachListeners = () => {
    // Track visit only once per session/load
    if (!sessionStorage.getItem('docenclave_visited')) {
        incrementStat(["overall", "visits"]);
        sessionStorage.setItem('docenclave_visited', 'true');
    }

    // Render Hero Stats
    const heroContainer = document.getElementById('hero-stats-container');
    heroContainer.innerHTML = renderHeroStats();
    attachHeroStatsListeners();

    // Render Tool Accordion
    const accordionContainer = document.getElementById('tool-accordion-container');
    accordionContainer.innerHTML = renderToolAccordion();
    attachToolAccordionListeners();
    
    // Render Why Us Table
    const whyUsContainer = document.getElementById('why-us-container');
    whyUsContainer.innerHTML = renderWhyUsTable();
};