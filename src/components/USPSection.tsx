"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Layers, DollarSign, Globe, Sparkles } from "lucide-react";

const uspData = [
  {
    icon: Sparkles,
    title: "Effortless Simplicity",
    description:
      "Intuitive interface that makes complex file processing tasks accessible to everyone, regardless of technical expertise.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast Processing",
    description:
      "Advanced algorithms and optimized infrastructure deliver results in seconds, not minutes. Experience unmatched speed.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Shield,
    title: "Enterprise-Grade Security",
    description:
      "Military-grade encryption, zero-knowledge architecture, and complete privacy protection for all your sensitive files.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Layers,
    title: "Comprehensive Toolkit",
    description:
      "Access 50+ professional tools covering PDFs, images, documents, and more. Everything you need in one platform.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: DollarSign,
    title: "Free Forever Resources",
    description:
      "Powerful features available at no cost forever. Premium options unlock advanced capabilities for professionals.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Globe,
    title: "Global Accessibility",
    description:
      "Access your tools from anywhere, anytime. Cloud-native architecture ensures availability across all devices.",
    color: "from-indigo-500 to-purple-500",
  },
];

export default function USPSection() {
  return (
    <section id="features" className="py-20 bg-white">
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
            Why DocEnclave Leads the Industry
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the features that make DocEnclave the preferred choice for
            professionals and businesses worldwide.
          </p>
        </motion.div>

        {/* USP Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {uspData.map((usp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="card-feature group"
            >
              {/* Icon with Gradient Background */}
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${usp.color} p-1 mb-6`}
              >
                <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                  <usp.icon
                    size={28}
                    className={`bg-gradient-to-r ${usp.color} bg-clip-text text-transparent`}
                  />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-black transition-colors duration-200">
                {usp.title}
              </h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-200">
                {usp.description}
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gray-50 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to experience the difference?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of professionals who trust DocEnclave for their
              file processing needs.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
            >
              Start Your Free Trial
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
