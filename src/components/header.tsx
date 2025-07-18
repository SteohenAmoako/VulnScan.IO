import { Shield } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-card shadow-sm sticky top-0 z-50">
      <Link href="/" className="flex items-center justify-center" aria-label="VulnScan.IO Home">
        <Shield className="h-6 w-6 text-primary" />
        <span className="ml-3 text-xl font-bold font-headline">VulnScan.IO</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Link href="/#resources" className="text-sm font-medium hover:underline underline-offset-4">
          Resources
        </Link>
      </nav>
    </header>
  );
}
