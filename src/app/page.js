const toolCategories = [
  { name: 'PDF Tools', description: 'Merge, split, compress, and edit PDFs securely on your own device.', href: '#' },
  { name: 'Image Tools', description: 'Quickly compress, convert, and resize images without uploading them.', href: '#' },
  { name: 'Word Tools', description: 'View Word documents or convert them to PDF in complete privacy.', href: '#' },
  { name: 'Excel Tools', description: 'View spreadsheets and export data to CSV, all from your browser.', href: '#' },
];

const uspItems = [
    {
        icon: '🔒',
        title: '100% Private',
        description: 'Your files are never uploaded to a server. All processing happens on your computer, ensuring your data remains yours, and yours alone.',
    },
    {
        icon: '⚡',
        title: 'Blazing Fast',
        description: 'No more waiting for large files to upload and download. Get your results in seconds, not minutes, at the full speed of your own device.',
    },
    {
        icon: '🎁',
        title: 'Completely Free',
        description: 'No subscriptions, no watermarks, and no hidden fees. All our browser-based tools are free to use, forever.',
    }
];

export default function HomePage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen text-center px-4 pt-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-gray-200 to-gray-400 text-transparent bg-clip-text">
          Your Private Document Enclave
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl">
          The secure offline toolkit to merge, compress, and convert your files. No uploads. No tracking. No compromise.
        </p>
      </section>

      {/* Tools & USP Sections Wrapper */}
      <div className="bg-black py-20 md:py-24 px-4">
        {/* Tool Selection Grid */}
        <div id="tools" className="w-full max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-100">Start with a Tool</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {toolCategories.map((tool) => (
              <a 
                key={tool.name}
                href={tool.href}
                className="bg-card-bg p-6 rounded-lg border border-gray-700 hover:border-accent transition-all duration-200 group"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-accent">{tool.name}</h3>
                <p className="text-gray-400">{tool.description}</p>
              </a>
            ))}
          </div>
        </div>

        {/* USP Section */}
        <div className="w-full max-w-6xl mx-auto mt-24 md:mt-32">
            <h2 className="text-3xl font-bold mb-12 text-center text-gray-100">Why DocEnclave?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {uspItems.map((item) => (
                    <div key={item.title} className="bg-card-bg p-8 rounded-lg border border-gray-700">
                        <div className="text-4xl mb-4">{item.icon}</div>
                        <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                        <p className="text-gray-400">{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}