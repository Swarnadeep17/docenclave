import { useState, useRef, useEffect } from "react"; import Layout from "../components/layout/Layout"; import PDFMerge from "../tools/pdf/merge/PDFMerge"; import PDFSplit from "../tools/pdf/split/PDFSplit"; import particlesConfig from "../utils/particlesConfig"; import StatsCounter from "../components/home/StatsCounter";

export default function Home() { const [activeTab, setActiveTab] = useState(0); const toolsSectionRef = useRef(null); const [particlesInitialized, setParticlesInitialized] = useState(false);

const tools = [ { name: "Merge PDFs", component: <PDFMerge /> }, { name: "Split PDF", component: <PDFSplit /> }, ];

useEffect(() => { if (particlesInitialized) return;

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

const scrollToTools = () => { toolsSectionRef.current?.scrollIntoView({ behavior: "smooth" }); };

return ( <Layout> <div id="particles-js" className="absolute inset-0 -z-10" style={{ height: '75vh' }} />

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative text-center">
    <div className="animate-pulse mx-auto mb-6">
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-700 shadow-xl border-4 border-white">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.105.895-2 2-2s2 .895 2 2-.895 2-2 2-2-.895-2-2zm6 2a6 6 0 11-12 0 6 6 0 0112 0z" />
        </svg>
      </div>
    </div>
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

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-200">
      <StatsCounter compactMode={true} />
    </div>
  </div>

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

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
    <h2 className="text-3xl font-bold text-gray-800 mb-6">DocEnclave vs Competitors</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 border">Feature</th>
            <th className="p-4 border">DocEnclave</th>
            <th className="p-4 border">iLovePDF</th>
            <th className="p-4 border">SmallPDF</th>
          </tr>
        </thead>
        <tbody>
          {comparisonData.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-blue-50"}>
              <td className="p-4 border font-medium text-left">{row.feature}</td>
              <td className="p-4 border text-center">✔</td>
              <td className="p-4 border text-center">{row.ilovepdf ? "✔" : "✘"}</td>
              <td className="p-4 border text-center">{row.smallpdf ? "✔" : "✘"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

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

); }

const comparisonData = [ { feature: 'Client-Side Processing', ilovepdf: false, smallpdf: false }, { feature: 'No File Uploads', ilovepdf: false, smallpdf: false }, { feature: '100% Free', ilovepdf: false, smallpdf: false }, { feature: 'No Watermarks', ilovepdf: false, smallpdf: false }, { feature: 'No Registration Required', ilovepdf: false, smallpdf: false }, { feature: 'No Tracking', ilovepdf: false, smallpdf: false }, ];

