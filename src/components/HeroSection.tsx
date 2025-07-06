"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Globe } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-white py-20 lg:py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-black opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-600 opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="section-padding relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl lg:text-7xl font-bold gradient-text mb-6 leading-tight">
              Professional File Processing
              <br />
              <span className="text-black">Redefined</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Advanced file processing platform with enterprise-grade security,
            lightning-fast performance, and comprehensive analytics.
            <span className="font-semibold text-gray-900">
              Free forever
            </span>{" "}
            for basic use.
          </motion.p>

          {/* Key Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6 mb-10"
          >
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
              <Shield size={16} className="text-green-600" />
              <span className="text-sm font-medium">Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
              <Zap size={16} className="text-yellow-600" />
              <span className="text-sm font-medium">Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
              <Globe size={16} className="text-blue-600" />
              <span className="text-sm font-medium">Global Access</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="#tools"
              className="btn-primary text-lg px-8 py-4 flex items-center gap-2 group"
            >
              Start Processing Files
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform duration-200"
              />
            </Link>
            <Link href="#features" className="btn-secondary text-lg px-8 py-4">
              View All Features
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-black">1M+</div>
              <div className="text-sm text-gray-600 mt-1">Files Processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-black">99.9%</div>
              <div className="text-sm text-gray-600 mt-1">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-black">50+</div>
              <div className="text-sm text-gray-600 mt-1">File Tools</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
