import { FadeIn } from "@/components/ui/FadeIn";
import { Scissors, Star, ShieldCheck, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const SERVICES = [
  { title: "Classic Haircut", price: "35", duration: "45 Min", desc: "Precision cut tailored to your head shape and personal style." },
  { title: "Beard Sculpting", price: "25", duration: "30 Min", desc: "Detailed trim, shape-up, and razor alignment with hot towel." },
  { title: "The Full Gentleman", price: "55", duration: "75 Min", desc: "Complete haircut and beard service with premium styling." },
];

const REVIEWS = [
  { name: "Ahmed Hassan", role: "Regular Client", text: "The best barber shop in the city. Professional service, luxurious atmosphere, and amazing attention to detail.", rating: 5 },
  { name: "Mohamed Tariq", role: "First-time Client", text: "Incredible experience. The hot towel shave was perfect, and the haircut exceeded my expectations.", rating: 5 },
  { name: "Omar Youssef", role: "Loyal Client", text: "I've been coming here for a year. Consistent quality every single time. They truly care about their craft.", rating: 5 },
];

export default function Home() {
  return (
    <div className="flex flex-col flex-grow">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1920"
            alt="Barber Shop Interior"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/50 via-neutral-950/80 to-neutral-950 z-10" />
        </div>

        <div className="container relative z-20 mx-auto px-4 text-center">
          <FadeIn>
            <h1 className="font-playfair text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight text-white">
              Grooming for <br />
              <span className="text-gold-500 italic">The Modern Man</span>
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Experience the pinnacle of traditional barbering blended with contemporary styling in an atmosphere of pure luxury.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/booking"
                className="bg-gold-500 hover:bg-gold-400 text-neutral-950 px-8 py-4 rounded-sm font-bold transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] uppercase tracking-widest w-full sm:w-auto"
              >
                Book Appointment
              </Link>
              <Link
                href="/services"
                className="border border-gold-500/50 hover:border-gold-500 text-gold-500 px-8 py-4 rounded-sm font-bold transition-all hover:bg-gold-500/10 uppercase tracking-widest w-full sm:w-auto"
              >
                Our Services
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-24 bg-neutral-950 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <FadeIn>
              <h2 className="text-gold-500 font-semibold tracking-widest uppercase text-sm mb-3">Our Expertise</h2>
              <h3 className="font-playfair text-4xl md:text-5xl font-bold text-white">Premium Services</h3>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {SERVICES.map((service, idx) => (
              <FadeIn key={service.title} delay={idx * 0.1} direction="up" className="bg-neutral-900 border border-white/5 p-8 rounded-sm hover:border-gold-500/30 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-xl font-bold text-white group-hover:text-gold-400 transition-colors">{service.title}</h4>
                  <span className="text-gold-500 font-bold text-xl">${service.price}</span>
                </div>
                <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
                  {service.desc}
                </p>
                <div className="flex items-center gap-2 text-neutral-500 text-sm font-medium uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-gold-500/70" />
                  {service.duration}
                </div>
              </FadeIn>
            ))}
          </div>

          <div className="text-center mt-12">
            <FadeIn delay={0.4}>
              <Link href="/services" className="text-gold-500 hover:text-gold-400 uppercase tracking-widest font-semibold text-sm inline-flex items-center gap-2 group">
                View Full Menu
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-neutral-900 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <FadeIn direction="left">
              <div className="relative h-[600px] w-full rounded-sm overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=1600" 
                  alt="Barber styling hair" 
                  fill 
                  className="object-cover"
                />
                <div className="absolute inset-0 border border-white/10 m-4 pointer-events-none" />
              </div>
            </FadeIn>

            <FadeIn direction="right">
              <h2 className="text-gold-500 font-semibold tracking-widest uppercase text-sm mb-3">About Us</h2>
              <h3 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-6">A Tradition of <br/> Excellence</h3>
              <p className="text-neutral-400 leading-relaxed mb-8">
                Since our founding, The Gentleman's Club has been dedicated to providing the highest caliber of men's grooming. We believe that a haircut is more than just a trim—it is an experience, a ritual, and a craft.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-neutral-950 rounded-full text-gold-500 shrink-0">
                    <Scissors className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-2">Master Barbers</h4>
                    <p className="text-neutral-400 text-sm">Decades of combined experience ensuring every cut is absolute perfection.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-neutral-950 rounded-full text-gold-500 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-2">Premium Products</h4>
                    <p className="text-neutral-400 text-sm">We use only the finest styling and grooming products to protect and nourish.</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 bg-neutral-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <FadeIn>
              <h2 className="text-gold-500 font-semibold tracking-widest uppercase text-sm mb-3">Testimonials</h2>
              <h3 className="font-playfair text-4xl md:text-5xl font-bold text-white">Client Reviews</h3>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {REVIEWS.map((review, idx) => (
              <FadeIn key={review.name} delay={idx * 0.1} className="bg-neutral-900 border border-white/5 p-8 rounded-sm">
                <div className="flex gap-1 text-gold-500 mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-neutral-300 italic mb-8 h-24">"{review.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center text-gold-500 font-bold border border-gold-500/20">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{review.name}</h4>
                    <span className="text-neutral-500 text-xs uppercase tracking-wider">{review.role}</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
