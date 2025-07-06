"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

// Mock data for top tools
const topToolsData = [
  { name: "PDF Merge", usage: 2340, growth: 12.5 },
  { name: "Image Compress", usage: 1890, growth: 8.3 },
  { name: "PDF Compress", usage: 1650, growth: 15.2 },
  { name: "Image Convert", usage: 1420, growth: 6.7 },
  { name: "PDF Split", usage: 980, growth: -2.1 },
  { name: "Word to PDF", usage: 780, growth: 22.4 },
];

export default function TopToolsChart() {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
          <p className="text-sm text-blue-600">
            {`Usage: ${payload[0].value.toLocaleString()}`}
          </p>
          <p
            className="text-sm"
            style={{
              color: data.growth >= 0 ? "#10b981" : "#ef4444",
            }}
          >
            {`Growth: ${data.growth >= 0 ? "+" : ""}${data.growth}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl border border-gray-200 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <TrendingUp className="text-purple-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Top Tools Usage
            </h3>
            <p className="text-sm text-gray-600">
              Most popular tools this month
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topToolsData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              stroke="#d1d5db"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} stroke="#d1d5db" />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="usage"
              fill="#8b5cf6"
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity duration-200"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {topToolsData
                .reduce((sum, tool) => sum + tool.usage, 0)
                .toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Usage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              +
              {(
                topToolsData.reduce(
                  (sum, tool) => sum + Math.max(0, tool.growth),
                  0,
                ) / topToolsData.filter((t) => t.growth > 0).length
              ).toFixed(1)}
              %
            </div>
            <div className="text-sm text-gray-600">Avg Growth</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
