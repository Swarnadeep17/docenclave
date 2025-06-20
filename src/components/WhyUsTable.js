const differentiators = [
  ["100% Client-side Processing", "Yes", "No"],
  ["No File Uploads Ever", "Yes", "Rarely"],
  ["Realtime Usage Stats", "Yes", "No"],
  ["Zero Account Required", "Yes", "Rarely"],
  ["Truly Free to Use", "Yes", "No"],
  ["Open, Transparent Privacy", "Yes", "No"],
  ["Monochrome, Modern UI", "Yes", "No"],
  ["Mobile Friendly & Responsive", "Yes", "Some"],
  ["Minimal, Distraction-free", "Yes", "No"],
  ["Future-focused Tech", "Yes", "No"],
];

export const render = () => `
    <section class="w-full max-w-2xl mx-auto mt-12 mb-10 animate-fade-in">
        <h2 class="text-xl font-bold text-white/90 font-mono mb-3 tracking-wide">Why Docenclave vs. Others?</h2>
        <div class="overflow-x-auto border border-white/10 rounded-xl bg-black/90 shadow backdrop-blur-sm">
            <table class="min-w-full table-auto border-separate" style="border-spacing: 0.5rem">
                <thead class="text-xs uppercase text-white/60 font-bold">
                    <tr>
                        <th class="py-3 px-2 font-extrabold text-left">Features</th>
                        <th class="py-3 px-2 font-extrabold text-center">Docenclave</th>
                        <th class="py-3 px-2 font-extrabold text-center">Others</th>
                    </tr>
                </thead>
                <tbody>
                    ${differentiators.map(([feature, ours, theirs]) => `
                        <tr class="border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                            <td class="py-2 px-2 font-semibold text-white/90">${feature}</td>
                            <td class="py-2 px-2 text-center">
                                <span class="inline-block rounded font-bold bg-black/60 border border-white/10 px-3 py-1">${ours}</span>
                            </td>
                            <td class="py-2 px-2 text-center">
                                <span class="inline-block rounded font-bold bg-white/5 text-white/50 border border-white/10 px-3 py-1">${theirs}</span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </section>
`;