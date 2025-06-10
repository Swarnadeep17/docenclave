export default function Footer() {
  return (
    <footer className="w-full max-w-7xl mx-auto mt-20 mb-8 px-4 text-center text-gray-500">
      <div className="flex justify-center space-x-6">
        <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-accent transition-colors">About</a>
        <a href="#" className="hover:text-accent transition-colors">Contact</a>
      </div>
      <p className="mt-4 text-sm">
        © {new Date().getFullYear()} DocEnclave. All rights reserved.
      </p>
      <p className="mt-2 text-xs">
        Disclaimer: All files are processed on your device and are never uploaded.
      </p>
    </footer>
  );
}