import { useState, useRef, useEffect } from "react";
import { StatsCounter } from "../components/home/StatsCounter";
import Layout from "../components/layout/Layout";
import PDFMerge from "../tools/pdf/merge/PDFMerge";
import PDFSplit from "../tools/pdf/split/PDFSplit";
import particlesConfig from "../utils/particlesConfig";

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const toolsSectionRef = useRef(null);
  const [particlesInitialized, setParticlesInitialized] = useState(false);

  const tools = [
    { name: "Merge PDFs", component: <PDFMerge /> },
    { name: "Split PDF", component: <PDFSplit /> },
  ];

  useEffect(() => {
    if (particlesInitialized) return;

    const initializeParticles = async () => {
      try {
        const { default: particlesJS } = await import("particles.js");
        if (typeof window !== "undefined" && window.particlesJS) {
          window.particlesJS("particles-js", particlesConfig);
        } else if (particlesJS) {
          particlesJS("particles-js", particlesConfig);
        }
        setParticlesInitialized(true);
      } catch (error) {
        console.error("Particles.js initialization failed:", error);
      }
    };

    initializeParticles();
  }, [particlesInitialized]);

  const scrollToTools = () => {
    toolsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const ComparisonTable = () => (
    <div className="overflow-x-auto mb-20">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
        Why Choose DocEnclave?
      </h2>
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border py-3 px-4 text-left"></th>
            <th className="border py-3 px-4">DocEnclave</th>
            <th className="border py-3 px-4">iLovePDF</th>
            <th className="border py-3 px-4">SmallPDF</th>
          </tr>
        </thead>
        <tbody>
          {comparisonData.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
              <td className="border py-3 px-4 font-medium">{row.feature}</td>
              <td className="border py-3 px-4 text-center">
                <CheckIcon />
              </td>
              <td className="border py-3 px-4 text-center">
                {row.ilovepdf ? <CheckIcon /> : <XIcon />}
              </td>
              <td className="border py-3 px-4 text-center">
                {row.smallpdf ? <CheckIcon /> : <XIcon />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <Layout>
      <div id="particles-js" className="absolute inset-0 -z-10" style={{ height: '75vh' }} />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            Privacy-First PDF Tools
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-10">
            Secure client-side processing for PDFs. Your documents never leave your device.
          </p>
          <button 
            onClick={scrollToTools}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Get Started Now
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-200">
          <StatsCounter compactMode={true} />
        </div>
      </div>

      {/* Tools Section */}
      <div ref={toolsSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          PDF Tools That Protect Your Privacy
        </h2>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-12">
            {tools.map((tool, index) => (
              <button
                key={index}
                className={`px-8 py-4 font-medium text-lg mx-2 rounded-xl transition-all transform hover:scale-105 ${
                  activeTab === index
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab(index)}
              >
                {tool.name}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
            {tools[activeTab].component}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-center mb-12 text-gray-800">
          Our Core Principles
        </h2>
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all"
            >
              <div className="mb-5 text-blue-500 neon-glow">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ComparisonTable />
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl py-16 px-6 text-center mb-16 mx-6">
        <h2 className="text-3xl font-bold text-white mb-6">
          Experience True Document Privacy
        </h2>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
          Join thousands who've taken control of their document privacy
        </p>
        <button 
          onClick={scrollToTools}
          className="bg-white text-blue-600 px-10 py-4 rounded-xl font-semibold text-lg shadow-xl hover:bg-blue-50 transition-all duration-300"
        >
          Secure My Documents
        </button>
      </div>
    </Layout>
  );
}

// Icons & Data
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 24 24">
    <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 19.93V12h7c-.93 4.83-4.35 8.1-7 8.93z"/>
    <path fill="none" stroke="currentColor" strokeWidth="2" className="neon-pulse"
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const MoneyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 24 24">
    <path fill="currentColor" d="M12 8c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm0 12c-2.75 0-5-2.25-5-5s2.25-5 5-5 5 2.25 5 5-2.25 5-5 5z"/>
    <path fill="none" stroke="currentColor" strokeWidth="2" className="neon-glow"
          d="M12 1L5 6v12l7 5 7-5V6l-7-5zM5 6h14M5 18h14"/>
    <circle cx="12" cy="15" r="1" fill="currentColor" className="neon-pulse" />
    <circle cx="12" cy="9" r="1" fill="currentColor" className="neon-pulse" />
  </svg>
);

const WatermarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 24 24">
    <path fill="currentColor" d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
    <path fill="none" stroke="currentColor" strokeWidth="2" className="neon-glow" d="M4.93 4.93l14.14 14.14" />
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" className="neon-pulse" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 inline" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 inline" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const features = [
  {
    title: "Privacy First",
    description: "Zero data leaves your browser - 100% client-side processing",
    icon: <ShieldIcon />,
  },
  {
    title: "No Costs, Ever",
    description: "Completely free with no hidden subscriptions",
    icon: <MoneyIcon />,
  },
  {
    title: "No Watermarks",
    description: "Clean results without branding or artifacts",
    icon: <WatermarkIcon />,
  },
];

const comparisonData = [
  { feature: 'Client-Side Processing', ilovepdf: false, smallpdf: false },
  { feature: 'No File Uploads', ilovepdf: false, smallpdf: false },
  { feature: '100% Free', ilovepdf: false, smallpdf: false },
  { feature: 'No Watermarks', ilovepdf: false, smallpdf: false },
  { feature: 'No Registration Required', ilovepdf: false, smallpdf: false },
  { feature: 'No Tracking', ilovepdf: false, smallpdf: false },
];