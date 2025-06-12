import React, { useState, useEffect } from 'react';
import { getHistoricalStats } from '../../utils/firebase.js';
import KPICard from './KPICard.jsx';
import TrendChart from './TrendChart.jsx';
import { format } from 'date-fns';

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getHistoricalStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p className="text-center py-10">Loading Dashboard...</p>;

  // --- Process Data for KPIs and Charts ---
  const thisMonthStats = stats.length > 0 ? stats[0] : { visitors: 0, downloads: 0, tools_used: {} };
  const conversionRate = (thisMonthStats.visitors || 0) > 0 
    ? (((thisMonthStats.downloads || 0) / thisMonthStats.visitors) * 100).toFixed(1) + '%' 
    : '0%';
  
  const sortedTools = Object.entries(thisMonthStats.tools_used || {}).sort(([,a], [,b]) => b - a);
  const topTool = sortedTools.length > 0 ? sortedTools[0][0].replace(/_/g, ' ') : 'N/A';

  // For Line Chart (reverse for chronological order)
  const reversedStats = [...stats].reverse();
  const lineChartData = {
    // THE FIX IS HERE: We check if `s.created_at` exists before trying to format it.
    labels: reversedStats.map(s => s.created_at ? format(s.created_at.toDate(), 'MMM yyyy') : 'Unknown Date'),
    datasets: [
      { label: 'Visitors', data: reversedStats.map(s => s.visitors || 0), borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.5)' },
      { label: 'Downloads', data: reversedStats.map(s => s.downloads || 0), borderColor: 'rgb(34, 197, 94)', backgroundColor: 'rgba(34, 197, 94, 0.5)' },
    ],
  };

  // For Bar Chart
  const barChartData = {
    labels: sortedTools.map(t => t[0].replace(/_/g, ' ')),
    datasets: [{
      label: 'Total Uses this Month',
      data: sortedTools.map(t => t[1]),
      backgroundColor: 'rgba(168, 85, 247, 0.5)',
      borderColor: 'rgb(168, 85, 247)',
      borderWidth: 1,
    }],
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Visitors (This Month)" value={(thisMonthStats.visitors || 0).toLocaleString()} icon="👥" />
        <KPICard title="Downloads (This Month)" value={(thisMonthStats.downloads || 0).toLocaleString()} icon="📄" />
        <KPICard title="Conversion Rate" value={conversionRate} icon="🎯" />
        <KPICard title="Most Used Tool" value={topTool} icon="🔧" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <TrendChart data={lineChartData} type="line" />
        <TrendChart data={barChartData} type="bar" />
      </div>

      <div className="bg-dark-secondary p-4 rounded-lg border border-dark-border">
        <h2 className="text-xl font-bold mb-4">Historical Data</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-dark-tertiary">
              <tr>
                <th className="p-3">Month</th>
                <th className="p-3">Visitors</th>
                <th className="p-3">Downloads</th>
              </tr>
            </thead>
            <tbody>
              {stats.map(s => (
                <tr key={s.id} className="border-b border-dark-border">
                  {/* THE FIX IS ALSO APPLIED HERE for the table */}
                  <td className="p-3">{s.created_at ? format(s.created_at.toDate(), 'MMMM yyyy') : 'Unknown Date'}</td>
                  <td className="p-3">{(s.visitors || 0).toLocaleString()}</td>
                  <td className="p-3">{(s.downloads || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;