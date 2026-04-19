import Link from 'next/link';
import { Scissors } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Scissors className="w-8 h-8 text-gold-500 transition-transform group-hover:rotate-180 duration-500" />
          <span className="text-xl font-bold tracking-widest uppercase text-white">
            The <span className="text-gold-500">Gentleman's</span> Club
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
          <Link href="/" className="text-neutral-300 hover:text-gold-400 transition-colors">Home</Link>
          <Link href="/services" className="text-neutral-300 hover:text-gold-400 transition-colors">Services</Link>
          <Link href="/booking" className="text-neutral-300 hover:text-gold-400 transition-colors">Booking</Link>
        </nav>

        <Link
          href="/booking"
          className="bg-gold-500 hover:bg-gold-400 text-neutral-950 px-6 py-2.5 rounded-sm font-semibold transition-all hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] text-sm uppercase tracking-wider"
        >
          Book Now
        </Link>
      </div>
    </header>
  );
}
