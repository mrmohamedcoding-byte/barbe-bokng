import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@/components/ui/FadeIn";
import {
  MapPin,
  Phone,
  Clock,
  Scissors,
  Star,
  ArrowRight,
  CheckCircle2,
  Navigation,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col flex-grow bg-neutral-950">
      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-20 px-4">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?auto=format&fit=crop&q=80&w=2400"
            alt="Premium barbershop"
            fill
            priority
            className="object-cover opacity-25"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-neutral-950/85 to-neutral-950" />
        </div>

        <div className="relative container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <FadeIn>
                <p className="text-gold-500 font-semibold tracking-widest uppercase text-xs mb-4">
                  The Gentleman's Club
                </p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Premium grooming, <br />
                  <span className="text-gold-500 italic">exceptional detail</span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-neutral-300/80 mt-6 text-lg leading-relaxed max-w-xl">
                  Traditional barber craft, modern precision. Book in seconds and show up to an experience designed for the modern man.
                </p>
              </FadeIn>

              <FadeIn delay={0.3}>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/booking"
                    className="bg-gold-500 hover:bg-gold-400 text-neutral-950 px-8 py-4 rounded-sm font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.35)] flex items-center justify-center gap-2"
                  >
                    Book Appointment <ArrowRight className="w-5 h-5" />
                  </Link>
                  <a
                    href="#location"
                    className="border border-white/15 hover:border-gold-500/60 text-white px-8 py-4 rounded-sm font-bold uppercase tracking-widest transition-all hover:bg-white/5 flex items-center justify-center gap-2"
                  >
                    Visit Us <Navigation className="w-5 h-5" />
                  </a>
                </div>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { icon: CheckCircle2, title: "Expert barbers", desc: "Precision cuts & fades" },
                    { icon: CheckCircle2, title: "Premium experience", desc: "Clean, quiet, modern" },
                    { icon: CheckCircle2, title: "Easy booking", desc: "Real-time availability" },
                  ].map((item) => (
                    <div key={item.title} className="bg-neutral-900/60 border border-white/10 rounded-sm p-4">
                      <div className="flex items-start gap-3">
                        <item.icon className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white font-semibold">{item.title}</p>
                          <p className="text-neutral-400 text-sm">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>

            <div className="lg:col-span-5">
              <FadeIn delay={0.2} direction="up" className="bg-neutral-900 border border-white/10 rounded-sm overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-950 rounded-full flex items-center justify-center border border-white/10">
                      <Scissors className="w-5 h-5 text-gold-500" />
                    </div>
                    <div>
                      <p className="text-white font-bold">Today</p>
                      <p className="text-neutral-500 text-xs uppercase tracking-wider">Book in under a minute</p>
                    </div>
                  </div>
                  <span className="text-xs text-gold-500 font-semibold uppercase tracking-widest">Open</span>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { service: "Classic Haircut", time: "09:00", price: "35" },
                    { service: "Skin Fade", time: "12:00", price: "40" },
                    { service: "Beard Sculpting", time: "17:00", price: "25" },
                  ].map((row) => (
                    <div key={row.service} className="flex items-center justify-between bg-neutral-950 border border-white/5 rounded-sm px-4 py-3">
                      <div>
                        <p className="text-white font-semibold">{row.service}</p>
                        <p className="text-neutral-500 text-xs flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          {row.time}
                        </p>
                      </div>
                      <p className="text-gold-500 font-bold">${row.price}</p>
                    </div>
                  ))}

                  <Link
                    href="/booking"
                    className="mt-2 block text-center bg-gold-500 hover:bg-gold-400 text-neutral-950 py-3 rounded-sm font-bold uppercase tracking-widest transition-colors"
                  >
                    Book now
                  </Link>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-24 px-4 bg-neutral-950 border-t border-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <FadeIn>
              <h2 className="text-gold-500 font-semibold tracking-widest uppercase text-sm mb-3">Gallery</h2>
              <h3 className="font-playfair text-4xl md:text-5xl font-bold text-white">Inside the club</h3>
              <p className="text-neutral-400 mt-4 max-w-2xl mx-auto">
                A modern space built for comfort, precision, and an unmatched grooming ritual.
              </p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-12 gap-3">
            {[
              { src: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1600", span: "lg:col-span-7", h: "h-[240px] md:h-[360px]" },
              { src: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=1600", span: "lg:col-span-5", h: "h-[240px] md:h-[360px]" },
              { src: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=1600", span: "lg:col-span-4", h: "h-[200px] md:h-[280px]" },
              { src: "https://images.unsplash.com/photo-1520975958225-cc66c02b67ce?auto=format&fit=crop&q=80&w=1600", span: "lg:col-span-4", h: "h-[200px] md:h-[280px]" },
              { src: "https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&q=80&w=1600", span: "lg:col-span-4", h: "h-[200px] md:h-[280px]" },
            ].map((img, idx) => (
              <FadeIn key={idx} delay={idx * 0.05} className={`${img.span} col-span-2`}>
                <div className={`relative ${img.h} rounded-sm overflow-hidden border border-white/10`}>
                  <Image
                    src={img.src}
                    alt="Barbershop gallery"
                    fill
                    className="object-cover hover:scale-[1.02] transition-transform duration-500"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-neutral-950/15" />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section id="location" className="py-24 px-4 bg-neutral-900 border-t border-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <FadeIn>
                <h2 className="text-gold-500 font-semibold tracking-widest uppercase text-sm mb-3">Location</h2>
                <h3 className="font-playfair text-4xl md:text-5xl font-bold text-white">Visit us</h3>
                <p className="text-neutral-400 mt-4 leading-relaxed">
                  Easy to reach, comfortable to stay. Walk-ins are welcome, but appointments are recommended.
                </p>
              </FadeIn>

              <FadeIn delay={0.1}>
                <div className="mt-8 space-y-4">
                  <div className="bg-neutral-950 border border-white/10 rounded-sm p-5">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gold-500 mt-0.5" />
                      <div>
                        <p className="text-white font-semibold">Address</p>
                        <p className="text-neutral-400 text-sm">123 Main Street, Your City</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-950 border border-white/10 rounded-sm p-5">
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gold-500 mt-0.5" />
                      <div>
                        <p className="text-white font-semibold">Phone</p>
                        <p className="text-neutral-400 text-sm">+1 (555) 123-4567</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-950 border border-white/10 rounded-sm p-5">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gold-500 mt-0.5" />
                      <div>
                        <p className="text-white font-semibold">Hours</p>
                        <p className="text-neutral-400 text-sm">Mon–Sat: 9:00–19:00</p>
                        <p className="text-neutral-400 text-sm">Sun: Closed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="mt-8 bg-neutral-950 border border-white/10 rounded-sm p-5">
                  <div className="flex items-center gap-2 text-gold-500 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-white font-semibold">Highly rated</p>
                  <p className="text-neutral-400 text-sm mt-1">
                    “Clean fades, perfect beard lines, and a premium atmosphere.”
                  </p>
                </div>
              </FadeIn>
            </div>

            <div className="lg:col-span-7">
              <FadeIn delay={0.1} className="bg-neutral-950 border border-white/10 rounded-sm overflow-hidden">
                <div className="aspect-[16/11] w-full">
                  <iframe
                    title="Map"
                    className="w-full h-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps?q=Barber%20Shop&output=embed"
                  />
                </div>
                <div className="p-5 border-t border-white/5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <p className="text-neutral-400 text-sm">
                    Replace the map query/address with your real location for production.
                  </p>
                  <Link
                    href="/booking"
                    className="bg-gold-500 hover:bg-gold-400 text-neutral-950 px-6 py-3 rounded-sm font-bold uppercase tracking-widest transition-colors text-center"
                  >
                    Book a slot
                  </Link>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
