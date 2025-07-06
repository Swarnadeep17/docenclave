"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity, Pause, Play } from "lucide-react";

interface RealtimeChartProps {
  isRealTime: boolean;
}

// Generate initial data
const generateInitialData = () => {
  const data = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 2 * 60 * 1000); // 2-minute intervals
    data.push({
      time: time.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      timestamp: time.getTime(),
      filesProcessed: Math.floor(Math.random() * 50) + 20,
      activeUsers: Math.floor(Math.random() * 200) + 100,
    });
  }

  return data;
};

export default function RealtimeChart({ isRealTime }: RealtimeChartProps) {
  const [data, setData] = useState(generateInitialData());

  useEffect(() => {
    if (!isRealTime) return;

    const interval = setInterval(() => {
      setData((prevData) => {
        const newData = [...prevData];
        const now = new Date();

        // Remove oldest data point and add new one
        newData.shift();
        newData.push({
          time: now.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          }),
          timestamp: now.getTime(),
          filesProcessed: Math.floor(Math.random() * 50) + 20,
          activeUsers: Math.floor(Math.random() * 200) + 100,
        });

        return newData;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isRealTime]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
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
          <div className="p-2 bg-blue-50 rounded-lg">
            <Activity className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Real-time Activity
            </h3>
            <p className="text-sm text-gray-600">
              Live data updates every 5 seconds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRealTime ? (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <Play size={14} />
              <span className="text-sm font-medium">Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <Pause size={14} />
              <span className="text-sm font-medium">Paused</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              stroke="#d1d5db"
            />
            <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} stroke="#d1d5db" />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="filesProcessed"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
              name="Files Processed"
            />
            <Line
              type="monotone"
              dataKey="activeUsers"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
              name="Active Users"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Files Processed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Active Users</span>
        </div>
      </div>
    </motion.div>
  );
}
