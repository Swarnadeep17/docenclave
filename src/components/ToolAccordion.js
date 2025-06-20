import { db, ref, onValue } from '../lib/firebase.js';

const renderStatDisplay = (count) => `
    <div class="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 border border-white/15 font-mono font-bold text-base text-white shadow-inner backdrop-blur select-none animate-fade-in">
        <span>${count.toLocaleString()}</span>
        <span class="ml-1 text-xs font-medium text-gray-300/70 tracking-tight">USES</span>
    </div>
`;

const renderToolItem = (title, status, stat) => `
    <li class="flex items-center justify-between gap-4 my-2 py-2 px-4 rounded-xl group border border-white/10 transition-all bg-gradient-to-tr from-black/40 to-white/5 hover:shadow-lg hover:scale-105 hover:bg-white/8 backdrop-blur animate-fade-in">
        <span class="font-mono text-white text-base sm:text-lg tracking-widest uppercase drop-shadow">${title}</span>
        <span>
            ${status === 'available'
                ? (typeof stat === 'number' ? renderStatDisplay(stat) : `<div class="w-12 h-6 rounded-md bg-muted animate-pulse"></div>`)
                : `<span class="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-white/50 uppercase font-bold tracking-widest border border-white/10 blur-[0.5px]">Coming Soon</span>`
            }
        </span>
    </li>
`;

const renderAccordionItems = (toolStatus, toolStats) => {
    if (!toolStatus) return `<div class="w-full h-40 rounded-2xl bg-muted animate-pulse"></div>`;
    
    return Object.entries(toolStatus).map(([category, tools]) => `
        <div class="accordion-item border border-white/15 rounded-2xl bg-gradient-to-bl from-black/25 via-white/5 to-black/65 overflow-hidden shadow-glass backdrop-blur-sm animate-scale-in group" data-category="${category}">
            <button class="accordion-trigger w-full flex flex-1 items-center justify-between px-8 py-6 text-xl sm:text-2xl font-mono font-black tracking-wider uppercase text-white border-b border-white/10 bg-gradient-to-r from-black/30 via-white/0 to-black/40 group-hover:bg-white/10 transition-all drop-shadow">
                <span>${category}</span>
                <span class="chevron transition-transform duration-200">▼</span>
            </button>
            <div class="accordion-content overflow-hidden bg-gradient-to-bl from-black/60 to-white/10 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div class="pb-4 pt-0 px-2 sm:px-6">
                    <ul>
                        ${Object.entries(tools).map(([tool, status]) => {
                            const statValue = toolStats?.tools?.[category]?.[tool]?.visits;
                            return renderToolItem(tool.charAt(0).toUpperCase() + tool.slice(1), status, statValue);
                        }).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `).join('');
};

export const render = () => `
    <section class="w-full max-w-3xl mx-auto animate-fade-in">
        <h2 class="text-2xl font-mono font-extrabold uppercase mb-6 text-center text-white tracking-[0.2em] select-none drop-shadow-xl">
            <span class="inline-block px-5 py-2 rounded-full bg-gradient-to-tr from-white/5 via-white/0 to-black/30 border border-white/15 shadow-inner backdrop-blur-sm">TOOLS</span>
        </h2>
        <div id="accordion-container" class="flex flex-col gap-6 w-full">
            ${renderAccordionItems(null, null)}
        </div>
        <div class="text-center text-xs text-gray-400 font-mono mt-8">
            * All tools run locally in your browser. Realtime stats update live.
        </div>
    </section>
`;

export const attachListeners = () => {
    const accordionContainer = document.getElementById('accordion-container');
    let liveStats = null;
    let statusConfig = null;

    const reRender = () => {
        if (liveStats && statusConfig) {
            accordionContainer.innerHTML = renderAccordionItems(statusConfig, liveStats);
            
            document.querySelectorAll('.accordion-trigger').forEach(trigger => {
                const item = trigger.closest('.accordion-item');
                const content = item.querySelector('.accordion-content');
                
                // Initialize state
                content.style.maxHeight = '0px';
                
                trigger.addEventListener('click', () => {
                    const isOpen = item.classList.toggle('open');
                    if (isOpen) {
                        content.style.maxHeight = content.scrollHeight + "px";
                        trigger.querySelector('.chevron').style.transform = 'rotate(180deg)';
                    } else {
                        content.style.maxHeight = '0px';
                        trigger.querySelector('.chevron').style.transform = 'rotate(0deg)';
                    }
                });
                
                // Set initial closed transition class
                content.classList.add('transition-[max-height]', 'duration-300', 'ease-in-out');
            });
        }
    };

    fetch('/tools/status.json')
        .then(r => r.json())
        .then(data => {
            statusConfig = data;
            reRender();
        });

    const statsRef = ref(db, "/stats");
    onValue(statsRef, (snapshot) => {
        liveStats = snapshot.val();
        reRender();
    });
};