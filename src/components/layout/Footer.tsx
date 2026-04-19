import Link from 'next/link';
import { Scissors, MapPin, Phone, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-neutral-900 border-t border-white/5 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Scissors className="w-6 h-6 text-gold-500" />
              <span className="text-lg font-bold tracking-widest uppercase text-white">
                The <span className="text-gold-500">Gentleman's</span> Club
              </span>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed mb-6">
              Premium grooming experiences for the modern gentleman. Where classic techniques meet contemporary style.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-xs uppercase tracking-widest text-neutral-400 hover:text-gold-500 transition-all font-semibold">
                Instagram
              </a>
              <a href="#" className="text-xs uppercase tracking-widest text-neutral-400 hover:text-gold-500 transition-all font-semibold border-l border-white/10 pl-4">
                Facebook
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-neutral-400 text-sm">
                <MapPin className="w-5 h-5 text-gold-500 shrink-0" />
                <span>123 Elite Avenue,<br />Downtown District, NY 10001</span>
              </li>
              <li className="flex items-center gap-3 text-neutral-400 text-sm">
                <Phone className="w-5 h-5 text-gold-500 shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Opening Hours</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-neutral-400 text-sm">
                <Clock className="w-5 h-5 text-gold-500 shrink-0" />
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between"><span>Mon - Fri</span> <span>9:00 AM - 8:00 PM</span></div>
                  <div className="flex justify-between"><span>Saturday</span> <span>10:00 AM - 6:00 PM</span></div>
                  <div className="flex justify-between text-gold-500"><span>Sunday</span> <span>Closed</span></div>
                </div>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/services" className="text-neutral-400 hover:text-gold-400 text-sm transition-colors">Our Services</Link></li>
              <li><Link href="/booking" className="text-neutral-400 hover:text-gold-400 text-sm transition-colors">Book Appointment</Link></li>
              <li><Link href="#about" className="text-neutral-400 hover:text-gold-400 text-sm transition-colors">About Us</Link></li>
              <li><Link href="/admin" className="text-neutral-400 hover:text-gold-400 text-sm transition-colors">Admin Login</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 text-center text-neutral-500 text-sm">
          <p>&copy; {new Date().getFullYear()} The Gentleman's Club. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
