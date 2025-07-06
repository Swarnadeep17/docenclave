"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Github,
  Twitter,
  Mail,
  Shield,
  FileText,
  HelpCircle,
  Zap,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "All Tools", href: "#tools" },
      { name: "PDF Tools", href: "#tools" },
      { name: "Image Tools", href: "#tools" },
      { name: "Document Tools", href: "#tools" },
      { name: "API Access", href: "/api" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
      { name: "Press Kit", href: "/press" },
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Documentation", href: "/docs" },
      { name: "Community", href: "/community" },
      { name: "Status Page", href: "/status" },
      { name: "Bug Reports", href: "/bugs" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" },
      { name: "Security", href: "/security" },
    ],
  };

  const socialLinks = [
    {
      name: "GitHub",
      href: "https://github.com/docenclave",
      icon: Github,
      hoverColor: "hover:text-gray-400",
    },
    {
      name: "Twitter",
      href: "https://twitter.com/docenclave",
      icon: Twitter,
      hoverColor: "hover:text-blue-400",
    },
    {
      name: "Email",
      href: "mailto:hello@docenclave.com",
      icon: Mail,
      hoverColor: "hover:text-green-400",
    },
  ];

  return (
    <footer className="bg-black text-white">
      <div className="section-padding py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Link
                href="/"
                className="text-2xl font-bold text-white mb-4 block"
              >
                DocEnclave
              </Link>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Professional file processing platform with enterprise-grade
                security, lightning-fast performance, and comprehensive
                analytics. Built for the modern workflow.
              </p>

              {/* Key Features */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Shield size={14} className="text-green-400" />
                  Enterprise Security
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Zap size={14} className="text-yellow-400" />
                  Lightning Fast Processing
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <FileText size={14} className="text-blue-400" />
                  50+ Professional Tools
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-200 ${social.hoverColor}`}
                    aria-label={social.name}
                  >
                    <social.icon size={18} />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Product Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Company Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Support Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Legal Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="section-padding py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <div className="text-sm text-gray-400">
              © {currentYear} DocEnclave. All rights reserved. Built with ❤️
              for professionals worldwide.
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                System Status: Operational
              </div>
              <Link
                href="/status"
                className="hover:text-white transition-colors duration-200"
              >
                View Details
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
