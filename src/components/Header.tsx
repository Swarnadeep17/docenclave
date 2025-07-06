"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, User, Settings, LogOut, BarChart3 } from "lucide-react";
import Link from "next/link";
import AuthModal from "./AuthModal";

export default function Header() {
  const { user, userProfile, logout, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleAuthAction = () => {
    if (user) {
      setIsProfileMenuOpen(!isProfileMenuOpen);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <header className="bg-black text-white shadow-lg relative z-50">
        <div className="section-padding">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="text-2xl font-bold gradient-text">
                DocEnclave
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="#tools"
                className="hover:text-gray-300 transition-colors duration-200"
              >
                Tools
              </Link>
              <Link
                href="#pricing"
                className="hover:text-gray-300 transition-colors duration-200"
              >
                Pricing
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hover:text-gray-300 transition-colors duration-200 flex items-center gap-1"
                >
                  <BarChart3 size={16} />
                  Admin
                </Link>
              )}
            </nav>

            {/* User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={handleAuthAction}
                    className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    <User size={16} />
                    <span className="text-sm">
                      {userProfile?.role === "anonymous"
                        ? "Anonymous"
                        : userProfile?.email}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                      >
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">
                            {userProfile?.email}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {userProfile?.role} Account
                          </p>
                        </div>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Settings size={14} />
                          Profile Settings
                        </Link>
                        <button
                          onClick={logout}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button onClick={handleAuthAction} className="btn-primary">
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-gray-900"
            >
              <div className="section-padding py-4 space-y-4">
                <Link
                  href="#tools"
                  className="block py-2 hover:text-gray-300 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tools
                </Link>
                <Link
                  href="#pricing"
                  className="block py-2 hover:text-gray-300 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block py-2 hover:text-gray-300 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <div className="pt-4 border-t border-gray-700">
                  {user ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-300">
                        {userProfile?.email}
                      </p>
                      <button
                        onClick={logout}
                        className="w-full text-left py-2 text-red-400 hover:text-red-300"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleAuthAction}
                      className="w-full btn-primary"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
