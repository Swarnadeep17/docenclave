"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { fileTypes, Tool } from "@/lib/tools";
import {
  ChevronDown,
  ChevronRight,
  Lock,
  Zap,
  Star,
  Clock,
  Upload,
} from "lucide-react";
import Link from "next/link";

export default function ToolsSection() {
  const { userProfile, canAccessFeature, getFileSizeLimit } = useAuth();
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

  const toggleFileType = (fileTypeId: string) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(fileTypeId)) {
      newExpanded.delete(fileTypeId);
    } else {
      newExpanded.add(fileTypeId);
    }
    setExpandedTypes(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            <Zap size={10} />
            Available
          </span>
        );
      case "coming_soon":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
            <Clock size={10} />
            Coming Soon
          </span>
        );
      case "beta":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            <Star size={10} />
            Beta
          </span>
        );
      default:
        return null;
    }
  };

  const ToolCard = ({
    tool,
    fileTypeId,
  }: {
    tool: Tool;
    fileTypeId: string;
  }) => {
    const isAvailable = tool.status === "available";
    const maxFileSize = getFileSizeLimit();

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-gray-50 rounded-lg p-4 ml-6 border-l-4 border-gray-200 hover:border-black transition-all duration-200"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{tool.icon}</span>
            <div>
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                {tool.name}
                {getStatusBadge(tool.status)}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3">
          {/* Basic Features */}
          <div>
            <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Basic Features (Free)
            </h5>
            <ul className="space-y-1">
              {tool.features.basic.map((feature, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-700 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  {feature.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Advanced Features */}
          {tool.features.advanced.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Lock size={10} />
                Premium Features
              </h5>
              <ul className="space-y-1">
                {tool.features.advanced.map((feature, index) => (
                  <li key={index} className="text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                    <span
                      className={
                        !userProfile || userProfile.role === "free"
                          ? "text-gray-400"
                          : "text-gray-700"
                      }
                    >
                      {feature.name}
                    </span>
                    {(!userProfile || userProfile.role === "free") && (
                      <Lock size={10} className="text-gray-400" />
                    )}
                  </li>
                ))}
              </ul>

              {(!userProfile || userProfile.role === "free") && (
                <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-xs text-yellow-800">
                    <Lock size={10} className="inline mr-1" />
                    Upgrade to Premium to unlock advanced features
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* File Size Limit */}
        <div className="mt-3 text-xs text-gray-500">
          Max file size: {maxFileSize}MB per file
        </div>

        {/* Action Button */}
        <div className="mt-4">
          {isAvailable ? (
            <Link
              href={`/tools/${fileTypeId}/${tool.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors duration-200"
            >
              <Upload size={14} />
              Use Tool
            </Link>
          ) : (
            <button
              disabled
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed"
            >
              <Clock size={14} />
              Coming Soon
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <section id="tools" className="py-20 bg-gray-50">
      <div className="section-padding">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold gradient-text mb-6">
            Professional File Tools
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive suite of file processing tools designed for
            professionals. Basic features are free forever, premium features
            unlock advanced capabilities.
          </p>
        </motion.div>

        {/* File Types */}
        <div className="max-w-5xl mx-auto space-y-4">
          {fileTypes.map((fileType, index) => (
            <motion.div
              key={fileType.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* File Type Header */}
              <button
                onClick={() => toggleFileType(fileType.id)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{fileType.icon}</span>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-black transition-colors duration-200">
                      {fileType.name} Tools
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {fileType.description} • {fileType.tools.length} tools
                      available
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {
                      fileType.tools.filter((t) => t.status === "available")
                        .length
                    }{" "}
                    available
                  </span>
                  {expandedTypes.has(fileType.id) ? (
                    <ChevronDown
                      size={20}
                      className="text-gray-400 group-hover:text-gray-600 transition-colors duration-200"
                    />
                  ) : (
                    <ChevronRight
                      size={20}
                      className="text-gray-400 group-hover:text-gray-600 transition-colors duration-200"
                    />
                  )}
                </div>
              </button>

              {/* Expanded Tools */}
              <AnimatePresence>
                {expandedTypes.has(fileType.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 space-y-4">
                      {fileType.tools.map((tool, toolIndex) => (
                        <ToolCard
                          key={tool.id}
                          tool={tool}
                          fileTypeId={fileType.id}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-white rounded-2xl p-8 max-w-4xl mx-auto border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="text-3xl font-bold text-black">
                  {fileTypes.reduce((acc, ft) => acc + ft.tools.length, 0)}+
                </div>
                <div className="text-sm text-gray-600">Total Tools</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black">
                  {fileTypes.reduce(
                    (acc, ft) =>
                      acc +
                      ft.tools.filter((t) => t.status === "available").length,
                    0,
                  )}
                </div>
                <div className="text-sm text-gray-600">Available Now</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black">
                  {getFileSizeLimit()}MB
                </div>
                <div className="text-sm text-gray-600">File Size Limit</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black">99.9%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
