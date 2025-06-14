import { useState, useEffect } from 'react';

export default function ToolLoader({ category }) {
  const [tools, setTools] = useState([]);
  
  useEffect(() => {
    const loadTools = async () => {
      // GitHub API to get directory structure
      const res = await fetch(
        `https://api.github.com/repos/Swarnadeep17/docenclave/contents/src/tools/${category}`
      );
      
      const data = await res.json();
      const toolList = [];
      
      for (const item of data) {
        if (item.type === 'dir') {
          const toolRes = await fetch(
            `https://raw.githubusercontent.com/Swarnadeep17/docenclave/main/src/tools/${category}/${item.name}/config.json`
          );
          const config = await toolRes.json();
          toolList.push({
            name: item.name,
            ...config
          });
        }
      }
      
      setTools(toolList);
    };
    
    loadTools();
  }, [category]);

  return (
    <div className="tool-grid">
      {tools.map(tool => (
        <div key={tool.name} className="tool-card">
          <h3>{tool.name.replace(/-/g, ' ')}</h3>
          <p>Status: {tool.status}</p>
          {tool.status === 'soon' ? (
            <button disabled>Coming Soon</button>
          ) : (
            <button>Use Tool</button>
          )}
        </div>
      ))}
    </div>
  );
}