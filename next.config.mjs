/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  
  // This ensures links are generated as /pdf-tools/ which works perfectly with Firebase Hosting's static file serving.
  trailingSlash: true,
};

export default nextConfig;