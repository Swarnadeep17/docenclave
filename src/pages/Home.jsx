import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadFull } from 'tsparticles';
import Particles from 'react-tsparticles';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { trackVisitor, hasTrackedThisSession, markVisitorTracked, getVisitorStats } from '../utils/analytics';

const HeroParticles = () => (
  <Particles
    id="tsparticles"
    init={loadFull}
    options={{
      fullScreen: { enable: false },
      background: { color: 'transparent' },
      particles: {
        number: { value: 60 },
        size: { value: 2 },
        color: { value: '#00f0ff' },
        links: { enable: true, color: '#00f0ff', opacity: 0.3 },
        move: { enable: true, speed: 0.5 },
      },
    }}
    className="absolute inset-0 z-0"
  />
);

const TickerStats = ({ visitors, downloads }) => (
  <div className="flex justify-center items-center gap-6 text-sm md:text-base text-neon-blue font-mono px-4 py-2 bg-dark-tertiary rounded-full shadow-lg shadow-neon-blue/30 border border-dark-border animate-pulse">
    <motion.div
      className="flex items-center gap-2"
      animate={{ x: [0, 3, -3, 0] }}
      transition={{ repeat: Infinity, duration: 4 }}
    >
      <ShieldCheck className="w-4 h-4 text-neon-green animate-bounce" />
      {visitors} visitors this month
    </motion.div>
    <span className="w-px h-4 bg-dark-border" />
    <motion.div
      className="flex items-center gap-2"
      animate={{ x: [0, -3, 3, 0] }}
      transition={{ repeat: Infinity, duration: 4 }}
    >
      <ShieldCheck className="w-4 h-4 text-neon-green animate-bounce" />
      {downloads} downloads
    </motion.div>
  </div>
);

const ToolCard = ({ tool, available }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className={`rounded-xl p-4 ${available ? 'bg-dark-secondary hover:bg-dark-tertiary' : 'bg-dark-secondary opacity-50'
      } transition-all border border-dark-border group`}
  >
    <div className="flex justify-between items-center">
      <div>
        <h6 className="text-dark-text-primary font-semibold group-hover:text-white">{tool.name}</h6>
        <p className="text-dark-text-muted text-sm">{tool.description}</p>
      </div>
      <span className={`text-xs px-2 py-1 rounded ${available ? 'bg-green-500/20 text-green-400' : 'bg-dark-tertiary text-dark-text-secondary'
        }`}>
        {available ? 'Available' : 'Coming Soon'}
      </span>
    </div>
  </motion.div>
);

const ToolCategoryCard = ({ category, isExpanded, onToggle }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
    className="bg-dark-secondary rounded-xl border border-dark-border overflow-hidden transition-all"
  >
    <div onClick={onToggle} className="p-6 cursor-pointer hover:bg-dark-tertiary transition-colors">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-4xl mb-2">{category.icon}</div>
          <h4 className="text-xl font-semibold text-dark-text-primary mb-1">{category.title}</h4>
          <p className="text-dark-text-secondary text-sm">{category.description}</p>
        </div>
        <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>⌄</div>
      </div>
    </div>
    {isExpanded && (
      <div className="bg-dark-primary border-t border-dark-border px-6 py-4">
        <h5 className="text-dark-text-primary text-md font-semibold mb-4">Tools</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {category.tools.map((tool, idx) => (
            tool.available ? (
              <Link key={idx} to={tool.path}>
                <ToolCard tool={tool} available={true} />
              </Link>
            ) : (
              <ToolCard key={idx} tool={tool} available={false} />
            )
          ))}
        </div>
      </div>
    )}
  </motion.div>
);

const Home = () => {
  const [expanded, setExpanded] = useState(null);
  const [stats, setStats] = useState({ visitors: 0, downloads: 0 });

  useEffect(() => {
    if (!hasTrackedThisSession()) {
      trackVisitor();
      markVisitorTracked();
    }
    getVisitorStats().then(setStats);
  }, []);

  const categories = [
    {
      id: 'pdf',
      icon: '📄',
      title: 'PDF Tools',
      description: 'Merge, split, and convert your PDFs effortlessly.',
      tools: [
        { name: 'PDF Merge', path: '/tools/pdf/merge', description: 'Combine PDFs into one', available: true },
        { name: 'PDF Split', path: '/tools/pdf/split', description: 'Split PDF into parts', available: true },
        { name: 'PDF Compress', path: '/tools/pdf/compress', description: 'Reduce PDF size', available: false },
        { name: 'PDF to Image', path: '/tools/pdf/to-image', description: 'Convert PDF pages to images', available: false },
      ],
    },
    {
      id: 'image',
      icon: '🖼️',
      title: 'Image Tools',
      description: 'Resize, compress, or convert image formats.',
      tools: [
        { name: 'Image Resize', path: '/tools/image/resize', description: 'Change image dimensions', available: false },
        { name: 'Image Compress', path: '/tools/image/compress', description: 'Compress image files', available: false },
        { name: 'Format Convert', path: '/tools/image/convert', description: 'Convert image formats', available: false },
        { name: 'Image to PDF', path: '/tools/image/to-pdf', description: 'Convert image to PDF', available: false },
      ],
    },
    {
      id: 'document',
      icon: '📝',
      title: 'Document Tools',
      description: 'Convert documents to PDF easily.',
      tools: [
        { name: 'Word to PDF', path: '/tools/document/word-to-pdf', description: 'Convert DOCX to PDF', available: false },
        { name: 'Excel to PDF', path: '/tools/document/excel-to-pdf', description: 'Convert XLSX to PDF', available: false },
        { name: 'PowerPoint to PDF', path: '/tools/document/ppt-to-pdf', description: 'Convert PPT to PDF', available: false },
        { name: 'Text to PDF', path: '/tools/document/text-to-pdf', description: 'Convert TXT to PDF', available: false },
      ],
    },
  ];

  const scrollToTools = () => {
    document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative z-10">
      <div className="relative z-10 bg-dark-primary">
        <div className="absolute inset-0 -z-10">
          <HeroParticles />
        </div>

        {/* HERO */}
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-dark-text-primary mb-4">
            Process Documents <span className="block text-neon-blue">Securely</span>
          </h1>
          <p className="text-dark-text-secondary mb-8 max-w-xl mx-auto">
            All processing happens locally. Your files never leave your device.
          </p>
          <div className="mb-6">
            <TickerStats visitors={stats.visitors} downloads={stats.downloads} />
          </div>
          <motion.button
            onClick={scrollToTools}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="bg-neon-blue hover:bg-neon-blue/80 text-dark-primary font-bold py-3 px-6 rounded-full shadow shadow-neon-blue/30 transition"
          >
            Get Started
          </motion.button>
        </section>

        {/* TOOL SECTION */}
        <section id="tools-section" className="container mx-auto px-4 py-12">
          <h2 className="text-center text-3xl text-dark-text-primary font-bold mb-8">Choose Your File Type</h2>
          <div className="space-y-6 max-w-4xl mx-auto">
            {categories.map((cat) => (
              <ToolCategoryCard
                key={cat.id}
                category={cat}
                isExpanded={expanded === cat.id}
                onToggle={() => setExpanded(expanded === cat.id ? null : cat.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;