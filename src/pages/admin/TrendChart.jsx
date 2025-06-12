import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend
);

const TrendChart = ({ data, type }) => {
  const options = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: true, text: type === 'line' ? 'Monthly Activity' : 'Tool Usage Breakdown' } },
    scales: { x: { ticks: { color: '#9ca3af' } }, y: { ticks: { color: '#9ca3af' } } },
  };

  return (
    <div className="bg-dark-secondary p-4 rounded-lg border border-dark-border">
      {type === 'line' ? <Line options={options} data={data} /> : <Bar options={options} data={data} />}
    </div>
  );
};

export default TrendChart;