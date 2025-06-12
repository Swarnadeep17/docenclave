import React from 'react';

const comparisonData = [
  { feature: 'File Privacy', docenclave: true, online: false, desktop: true, note: 'Files are never uploaded.' },
  { feature: 'Data Security', docenclave: true, online: false, desktop: true, note: 'No server storage or data logging.' },
  { feature: 'Processing Speed', docenclave: true, online: false, desktop: true, note: 'Instant, no upload/download wait.' },
  { feature: 'Offline Access', docenclave: true, online: false, desktop: false, note: 'Works after the first load.' },
  { feature: 'Cost', docenclave: true, online: '?', desktop: false, note: 'Generous free tier, no hidden fees.' },
  { feature: 'Registration', docenclave: true, online: '?', desktop: true, note: 'Not required to use the tools.' },
  { feature: 'Advanced Previews', docenclave: true, online: '?', desktop: true, note: 'See every page before you process.' },
  { feature: 'Output Quality', docenclave: true, online: false, desktop: true, note: 'No watermarks, ever.' },
  { feature: 'User Experience', docenclave: true, online: false, desktop: '?', note: 'Clean, modern, and ad-free.' },
  { feature: 'Cross-Platform', docenclave: true, online: true, desktop: false, note: 'Works on any device with a browser.' },
];

const Checkmark = ({ status }) => {
  if (status === true) return <span className="text-green-400 text-2xl font-bold">✓</span>;
  if (status === false) return <span className="text-red-400 text-2xl font-bold">×</span>;
  return <span className="text-yellow-400 text-2xl font-bold">?</span>;
};

const ComparisonTable = () => {
  return (
    <section className="bg-dark-primary py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-dark-text-primary mb-4">
            The DocEnclave Advantage
          </h3>
          <p className="text-dark-text-secondary max-w-2xl mx-auto text-lg">
            See how our privacy-first approach compares to traditional solutions.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 px-6 py-4 text-left text-sm font-semibold text-dark-text-secondary border-b border-dark-border">
            <div className="col-span-1">Feature</div>
            <div className="col-span-1 text-center text-white">DocEnclave</div>
            <div className="col-span-1 text-center">Typical Online Tools</div>
            <div className="col-span-1 text-center">Desktop Software</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-dark-border">
            {comparisonData.map((item, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 px-6 py-5 group hover:bg-dark-secondary/50 transition-colors duration-200">
                <div className="col-span-1">
                  <p className="font-medium text-dark-text-primary">{item.feature}</p>
                  <p className="text-sm text-dark-text-muted transition-opacity opacity-0 group-hover:opacity-100 duration-200">{item.note}</p>
                </div>
                <div className="col-span-1 text-center flex justify-center items-center">
                  <Checkmark status={item.docenclave} />
                </div>
                <div className="col-span-1 text-center flex justify-center items-center">
                  <Checkmark status={item.online} />
                </div>
                <div className="col-span-1 text-center flex justify-center items-center">
                  <Checkmark status={item.desktop} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-dark-text-muted text-sm mt-6">
            <span className="font-bold text-yellow-400">?</span> Varies by provider, often with privacy trade-offs.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;