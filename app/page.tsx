"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import USPSection from "@/components/USPSection";
import ToolsSection from "@/components/ToolsSection";
import DifferentiatorSection from "@/components/DifferentiatorSection";
import Footer from "@/components/Footer";

export default function HomePage() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <HeroSection />
        <USPSection />
        <ToolsSection />
        <DifferentiatorSection />
      </motion.main>

      <Footer />
    </div>
  );
}
