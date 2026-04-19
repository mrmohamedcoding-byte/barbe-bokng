import { FadeIn } from "@/components/ui/FadeIn";
import { Scissors, Sparkles, Droplets, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const SERVICES_CATEGORIES = [
  {
    title: "Hair Services",
    icon: Scissors,
    image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=1600",
    items: [
      { name: "Classic Haircut", price: "35", duration: "45 Min", desc: "Precision cut tailored to your head shape and personal style. Includes wash and style." },
      { name: "Skin Fade", price: "40", duration: "45 Min", desc: "Seamless fade down to the skin, blended perfectly with the top." },
      { name: "Buzz Cut", price: "25", duration: "30 Min", desc: "Even clipper cut all over, finished with a fresh lineup." },
      { name: "Scissor Cut", price: "45", duration: "60 Min", desc: "Exclusive all-shear haircut for longer styles requiring meticulous detailing." },
    ]
  },
  {
    title: "Beard & Shave",
    icon: Droplets,
    image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=1600",
    items: [
      { name: "Beard Sculpting", price: "25", duration: "30 Min", desc: "Detailed trim, shape-up, and razor alignment with hot towel." },
      { name: "Traditional Hot Towel Shave", price: "40", duration: "45 Min", desc: "Classic straight razor shave with essential oils, hot lather, and multiple hot towels." },
      { name: "Mustache Trim & Styling", price: "15", duration: "15 Min", desc: "Precision trim and waxing for handlebar or classic styles." },
    ]
  },
  {
    title: "Premium Packages",
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=1600",
    items: [
      { name: "The Full Gentleman", price: "55", duration: "75 Min", desc: "Complete haircut and beard sculpting service with premium styling." },
      { name: "The Executive VIP", price: "80", duration: "90 Min", desc: "Haircut, traditional shave, facial cleanse, black mask, and scalp massage." },
    ]
  }
];

export default function ServicesPage() {
  return (
    <div className="flex flex-col flex-grow bg-neutral-950">
      {/* Header */}
      <section className="pt-32 pb-16 px-4 bg-neutral-900 border-b border-white/5 text-center">
        <div className="container mx-auto max-w-4xl">
          <FadeIn>
            <h1 className="font-playfair text-5xl md:text-7xl font-bold mb-6 text-white">
              Menu of <span className="text-gold-500 italic">Services</span>
            </h1>
            <p className="text-neutral-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              Our master barbers provide an unparalleled grooming experience utilizing time-honored techniques and premium products.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Services List */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          {SERVICES_CATEGORIES.map((category, idx) => (
            <div key={category.title} className={`mb-24 last:mb-0 flex flex-col ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 lg:gap-24 items-center`}>
              
              {/* Image side */}
              <div className="w-full lg:w-1/2">
                <FadeIn direction={idx % 2 !== 0 ? "right" : "left"} className="relative h-[500px] w-full rounded-sm overflow-hidden">
                  <Image 
                    src={category.image} 
                    alt={category.title} 
                    fill 
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-neutral-950/20 mix-blend-multiply" />
                  <div className="absolute inset-0 border border-white/10 m-4 pointer-events-none" />
                </FadeIn>
              </div>

              {/* Content side */}
              <div className="w-full lg:w-1/2">
                <FadeIn direction={idx % 2 !== 0 ? "left" : "right"}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-neutral-900 rounded-full text-gold-500">
                      <category.icon className="w-6 h-6" />
                    </div>
                    <h2 className="font-playfair text-3xl font-bold text-white">{category.title}</h2>
                  </div>

                  <div className="space-y-8">
                    {category.items.map((item) => (
                      <div key={item.name} className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-gold-500 before:rounded-full">
                        <div className="flex justify-between items-baseline mb-2 gap-4">
                          <h3 className="text-xl font-bold text-white tracking-wide">{item.name}</h3>
                          <div className="flex-grow border-b border-dashed border-white/20 relative top-[-6px]" />
                          <span className="text-gold-500 font-bold text-xl">${item.price}</span>
                        </div>
                        <p className="text-neutral-400 text-sm mb-2">{item.desc}</p>
                        <span className="inline-block text-xs uppercase tracking-wider text-neutral-500 font-medium">
                          {item.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                </FadeIn>
              </div>
            </div>
          ))}

          <div className="mt-24 text-center">
            <FadeIn>
              <div className="p-12 bg-neutral-900 border border-white/5 rounded-sm max-w-3xl mx-auto">
                <h3 className="font-playfair text-3xl font-bold text-white mb-4">Ready for your transformation?</h3>
                <p className="text-neutral-400 mb-8">Walk-ins are welcome, but appointments are highly recommended to secure your preferred time.</p>
                <Link
                  href="/booking"
                  className="inline-block bg-gold-500 hover:bg-gold-400 text-neutral-950 px-10 py-4 rounded-sm font-bold transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] uppercase tracking-widest"
                >
                  Book Your Slot Now
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
