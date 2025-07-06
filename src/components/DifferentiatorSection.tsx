"use client";

import { motion } from "framer-motion";
import { Check, X, Star } from "lucide-react";

const comparisonData = [
  {
    feature: "Pricing Model",
    docenclave: "Free with generous limits, affordable premium plans",
    others: "Often paid-only or with severe free plan limitations",
    advantage: true,
  },
  {
    feature: "Tool Variety",
    docenclave: "50+ tools across multiple file types with regular updates",
    others: "Usually specialized in 1-2 file types only",
    advantage: true,
  },
  {
    feature: "File Size Limits",
    docenclave: "20MB free, 200MB premium - industry leading",
    others: "Typically 5-10MB max, even on paid plans",
    advantage: true,
  },
  {
    feature: "Processing Speed",
    docenclave: "Lightning fast with optimized algorithms",
    others: "Often slow, especially during peak times",
    advantage: true,
  },
  {
    feature: "User Interface",
    docenclave: "Modern, intuitive design with accessibility focus",
    others: "Outdated interfaces with poor user experience",
    advantage: true,
  },
  {
    feature: "Security & Privacy",
    docenclave: "Zero-knowledge encryption, GDPR compliant",
    others: "Basic security, questionable data practices",
    advantage: true,
  },
  {
    feature: "API Access",
    docenclave: "Full API access for developers and enterprises",
    others: "Limited or no API availability",
    advantage: true,
  },
  {
    feature: "Analytics Dashboard",
    docenclave: "Comprehensive real-time analytics for admins",
    others: "Basic or no analytics features",
    advantage: true,
  },
  {
    feature: "Batch Processing",
    docenclave: "Advanced batch processing with queue management",
    others: "Single file processing only",
    advantage: true,
  },
  {
    feature: "Mobile Experience",
    docenclave: "Fully responsive with mobile-optimized workflows",
    others: "Poor mobile experience, desktop-only focus",
    advantage: true,
  },
];

export default function DifferentiatorSection() {
  return (
    <section id="comparison" className="py-20 bg-white">
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
            Why DocEnclave Outperforms Competitors
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how DocEnclave compares to traditional file processing
            platforms. We don't just compete - we lead the industry.
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-lg font-semibold text-gray-900">
                  Feature Comparison
                </div>
                <div className="flex items-center gap-2 text-lg font-bold text-black">
                  <Star className="text-yellow-500 fill-current" size={20} />
                  DocEnclave
                </div>
                <div className="text-lg font-semibold text-gray-600">
                  Traditional Platforms
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {comparisonData.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    {/* Feature Name */}
                    <div className="font-medium text-gray-900">
                      {item.feature}
                    </div>

                    {/* DocEnclave */}
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Check
                          className="text-green-600 bg-green-100 rounded-full p-1"
                          size={20}
                        />
                      </div>
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {item.docenclave}
                      </div>
                    </div>

                    {/* Others */}
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <X
                          className="text-red-500 bg-red-100 rounded-full p-1"
                          size={20}
                        />
                      </div>
                      <div className="text-sm text-gray-600 leading-relaxed">
                        {item.others}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-8 text-white max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Experience the DocEnclave Advantage
            </h3>
            <p className="text-gray-300 mb-6">
              Join the revolution in file processing. See why professionals
              choose DocEnclave over traditional platforms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200"
              >
                Start Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-gray-900 transition-colors duration-200"
              >
                View Pricing Plans
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
