import React from 'react';
import { Link } from 'react-router-dom';

const toolCategories = [
  {
    id: 'pdf',
    name: 'PDF',
    icon: 'picture_as_pdf',
    description: 'Merge, split, compress and convert PDF files easily.',
    link: '/tools/pdf',
  },
  {
    id: 'image',
    name: 'Image',
    icon: 'image',
    description: 'Resize, compress, convert and edit images.',
    link: '/tools/image',
  },
  {
    id: 'document',
    name: 'Document',
    icon: 'description',
    description: 'Work with Word, Excel, PowerPoint files seamlessly.',
    link: '/tools/document',
  },
];

const ToolCategories = () => {
  return (
    <section className="section-spacing bg-gray-900">
      <div className="container-padding mx-auto text-center max-w-7xl space-y-12">
        <h2 className="text-responsive-lg font-bold tracking-tight">Choose Your Tool Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {toolCategories.map(({ id, name, icon, description, link }) => (
            <Link
              to={link}
              key={id}
              className="card-feature group"
              aria-label={`${name} tools`}
              title={`${name} tools`}
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-white/10 text-white mb-4 transition-transform group-hover:scale-110">
                <span className="material-icons text-4xl">{icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{name}</h3>
              <p className="text-gray-400 line-clamp-3">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolCategories;
