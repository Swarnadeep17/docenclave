"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  Download,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "file_processed" | "user_registered" | "error" | "system";
  message: string;
  timestamp: Date;
  user?: string;
  status: "success" | "error" | "warning" | "info";
}

// Generate mock activity data
const generateMockActivity = (): ActivityItem => {
  const types = [
    {
      type: "file_processed",
      message: "PDF merge completed",
      status: "success",
    },
    {
      type: "file_processed",
      message: "Image compression finished",
      status: "success",
    },
    {
      type: "user_registered",
      message: "New user registration",
      status: "info",
    },
    {
      type: "file_processed",
      message: "Document conversion failed",
      status: "error",
    },
    {
      type: "system",
      message: "System maintenance completed",
      status: "success",
    },
    {
      type: "file_processed",
      message: "Batch processing started",
      status: "warning",
    },
  ] as const;

  const randomType = types[Math.floor(Math.random() * types.length)];

  return {
    id: Math.random().toString(36).substr(2, 9),
    type: randomType.type,
    message: randomType.message,
    timestamp: new Date(),
    user:
      Math.random() > 0.3
        ? `user${Math.floor(Math.random() * 1000)}@example.com`
        : undefined,
    status: randomType.status,
  };
};

const getActivityIcon = (type: string, status: string) => {
  switch (type) {
    case "file_processed":
      return status === "success"
        ? CheckCircle
        : status === "error"
          ? AlertTriangle
          : FileText;
    case "user_registered":
      return UserPlus;
    case "system":
      return status === "success" ? CheckCircle : AlertTriangle;
    default:
      return FileText;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "success":
      return "text-green-600 bg-green-50";
    case "error":
      return "text-red-600 bg-red-50";
    case "warning":
      return "text-yellow-600 bg-yellow-50";
    case "info":
      return "text-blue-600 bg-blue-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Initialize with some activities
  useEffect(() => {
    const initialActivities = Array.from({ length: 8 }, () =>
      generateMockActivity(),
    );
    setActivities(initialActivities);
  }, []);

  // Add new activities periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity = generateMockActivity();
      setActivities((prev) => [newActivity, ...prev.slice(0, 9)]); // Keep only 10 items
    }, 8000); // Add new activity every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl border border-gray-200 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-lg">
            <Clock className="text-gray-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h3>
            <p className="text-sm text-gray-600">
              Live system events and user actions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500">Live</span>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence initial={false}>
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type, activity.status);
            const statusColor = getStatusColor(activity.status);

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index === 0 ? 0 : 0,
                }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                {/* Icon */}
                <div className={`p-2 rounded-lg ${statusColor} flex-shrink-0`}>
                  <Icon size={16} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium">
                    {activity.message}
                  </p>
                  {activity.user && (
                    <p className="text-xs text-gray-500 mt-1">
                      User: {activity.user}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {activity.timestamp.toLocaleTimeString()}
                  </p>
                </div>

                {/* Status Badge */}
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor.replace("bg-", "bg-opacity-20 ")}`}
                >
                  {activity.status}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* View All Button */}
      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
        <button className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200">
          View All Activity →
        </button>
      </div>
    </motion.div>
  );
}
