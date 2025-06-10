import Link from 'next/link';

export default function Header() {
  return (
    <header className="absolute top-0 left-0 w-full p-4 md:p-6 z-10">
      <nav className="max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold text-gray-100 hover:text-accent transition-colors">
          DocEnclave
        </Link>
      </nav>
    </header>
  );
}