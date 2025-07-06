"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  Download,
  TrendingUp,
  Clock,
  Globe,
  Zap,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import StatsCard from "@/components/admin/StatsCard";
import RealtimeChart from "@/components/admin/RealtimeChart";
import TopToolsChart from "@/components/admin/TopToolsChart";
import RecentActivity from "@/components/admin/RecentActivity";

// Mock real-time data - in production, this would come from Firebase/API
const generateMockStats = () => ({
  totalUsers: Math.floor(Math.random() * 50000) + 45000,
  monthlyActiveUsers: Math.floor(Math.random() * 25000) + 20000,
  filesProcessed: Math.floor(Math.random() * 1000000) + 900000,
  monthlyProcessed: Math.floor(Math.random() * 100000) + 80000,
  totalDownloads: Math.floor(Math.random() * 2000000) + 1800000,
  monthlyDownloads: Math.floor(Math.random() * 200000) + 150000,
  systemUptime: 99.97,
  averageProcessingTime: Math.random() * 2 + 1,
});

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState(generateMockStats());
  const [isRealTime, setIsRealTime] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    if (!isRealTime) return;

    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        filesProcessed: prev.filesProcessed + Math.floor(Math.random() * 5),
        totalDownloads: prev.totalDownloads + Math.floor(Math.random() * 10),
        monthlyProcessed: prev.monthlyProcessed + Math.floor(Math.random() * 3),
        monthlyDownloads: prev.monthlyDownloads + Math.floor(Math.random() * 5),
        averageProcessingTime: Math.random() * 2 + 1,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [isRealTime]);

  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: "+12.5%",
      changeType: "positive" as const,
      icon: Users,
      color: "blue",
    },
    {
      title: "Files Processed",
      value: stats.filesProcessed.toLocaleString(),
      change: "+8.2%",
      changeType: "positive" as const,
      icon: FileText,
      color: "green",
    },
    {
      title: "Total Downloads",
      value: stats.totalDownloads.toLocaleString(),
      change: "+15.3%",
      changeType: "positive" as const,
      icon: Download,
      color: "purple",
    },
    {
      title: "System Uptime",
      value: `${stats.systemUptime}%`,
      change: "+0.02%",
      changeType: "positive" as const,
      icon: Shield,
      color: "emerald",
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {userProfile?.email}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Real-time data</span>
            </div>
            <button
              onClick={() => setIsRealTime(!isRealTime)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isRealTime
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {isRealTime ? "Live" : "Paused"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Real-time Activity Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <RealtimeChart isRealTime={isRealTime} />
        </motion.div>

        {/* Top Tools Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <TopToolsChart />
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <RecentActivity />
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-500" />
                  <span className="text-sm text-gray-600">Avg Processing</span>
                </div>
                <span className="text-sm font-medium">
                  {stats.averageProcessingTime.toFixed(1)}s
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-green-500" />
                  <span className="text-sm text-gray-600">Global Reach</span>
                </div>
                <span className="text-sm font-medium">180+ countries</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-yellow-500" />
                  <span className="text-sm text-gray-600">Success Rate</span>
                </div>
                <span className="text-sm font-medium">99.9%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-purple-500" />
                  <span className="text-sm text-gray-600">Monthly Growth</span>
                </div>
                <span className="text-sm font-medium text-green-600">
                  +23.5%
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
