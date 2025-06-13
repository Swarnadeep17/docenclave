// CREATE NEW FILE: docenclave-main/src/components/shared/SEOHead.jsx

import React, { useEffect } from 'react';

const SEOHead = ({ title, description }) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    }
  }, [title, description]);

  return null; // This component does not render anything
};

export default SEOHead;