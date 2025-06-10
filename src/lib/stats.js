import { kv } from '@vercel/kv';

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
}

export async function getStatsData() {
  const monthKey = getCurrentMonthKey();
  const visitsKey = `visits:${monthKey}`;
  const downloadsKey = `downloads:${monthKey}`;

  try {
    const [visits, downloads] = await Promise.all([
      kv.get(visitsKey),
      kv.get(downloadsKey)
    ]);
    return {
      visits: visits || 0,
      downloads: downloads || 0,
    };
  } catch (error) {
    console.error("Failed to get stats from KV:", error);
    return { visits: 0, downloads: 0 }; // Return default on error
  }
}