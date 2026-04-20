import Link from "next/link";
import { 
  Calendar, CreditCard, BarChart3, Bell, CheckCircle2, Clock, 
  Users, Shield, Smartphone, Globe, ArrowRight, Star, Zap, Heart
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">BookFlow</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Reviews</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/login" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Login
              </Link>
              <Link 
                href="/admin/login" 
                className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-full font-semibold transition-colors flex items-center gap-2"
              >
                Start Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Trusted by 500+ businesses across Europe
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Get More Bookings and <br />
            <span className="text-amber-500">Stop Losing Clients</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            The all-in-one booking system for barbers, clinics, and service businesses. 
            Accept payments online, send automatic reminders, and grow your revenue.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link 
              href="/admin/login" 
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
            >
              Start Free Today <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/booking" 
              className="w-full sm:w-auto border-2 border-gray-200 hover:border-amber-500 text-gray-700 hover:text-amber-600 px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              <Globe className="w-5 h-5" />
              See Demo
            </Link>
          </div>
          
          <p className="text-gray-500 text-sm">
            No credit card required • Free 14-day trial • Setup in 5 minutes
          </p>
          
          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="bg-gray-900 rounded-2xl p-4 shadow-2xl shadow-gray-900/20">
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-700">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-amber-500">247</p>
                      <p className="text-gray-400 text-sm">Bookings</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-green-400">€8,420</p>
                      <p className="text-gray-400 text-sm">Revenue</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-blue-400">98%</p>
                      <p className="text-gray-400 text-sm">Show Rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Sound Familiar?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Many service businesses struggle with these daily frustrations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No-Shows Killing Revenue</h3>
              <p className="text-gray-600">
                Clients book but don't show up. You lose money and time, sitting around waiting for appointments that never come.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Wasted Time on Calls</h3>
              <p className="text-gray-600">
                Hours spent on the phone scheduling appointments, rescheduling, and confirming. Time you could spend serving clients.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <CreditCard className="w-7 h-7 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Unpaid Appointments</h3>
              <p className="text-gray-600">
                Clients leave without paying or cancel last minute. You've already blocked time for them with no guarantee they'll come.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <CheckCircle2 className="w-4 h-4" />
                The Solution
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Everything You Need to <span className="text-amber-500">Grow Your Business</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                BookFlow handles the entire booking experience - from online scheduling to payment collection and automated reminders. You focus on what you do best: serving your clients.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Smart Online Booking</h4>
                    <p className="text-gray-600">Let clients book 24/7 from any device. Real-time availability, no double bookings.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Secure Online Payments</h4>
                    <p className="text-gray-600">Accept payments at booking. Reduce no-shows by up to 80% with prepaid appointments.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Automatic Reminders</h4>
                    <p className="text-gray-600">SMS & email reminders sent automatically. Clients never forget their appointments.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl p-8">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Booking Confirmed!</p>
                      <p className="text-sm text-gray-500">Tomorrow at 14:00</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Service</span>
                      <span className="font-medium text-gray-900">Classic Haircut</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Client</span>
                      <span className="font-medium text-gray-900">Ahmed Hassan</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Amount</span>
                      <span className="font-medium text-green-600">€35.00 (Paid)</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">Reminder</span>
                      <span className="font-medium text-amber-600">Sent 24h before</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Powerful features designed to help you save time and earn more
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Calendar, title: "Smart Scheduling", desc: "Real-time availability with custom time slots and service durations" },
              { icon: CreditCard, title: "Payment Processing", desc: "Accept payments online via Stripe. 100% secure and reliable" },
              { icon: Bell, title: "Auto Reminders", desc: "Email notifications for confirmations and appointment reminders" },
              { icon: BarChart3, title: "Analytics Dashboard", desc: "Track bookings, revenue, and popular services at a glance" },
              { icon: Smartphone, title: "Mobile Friendly", desc: "Beautiful on any device. Clients can book from phone or desktop" },
              { icon: Shield, title: "Secure & Reliable", desc: "Enterprise-grade security. Your data is always safe with us" },
              { icon: Users, title: "Client Management", desc: "Keep track of all your clients and their booking history" },
              { icon: Globe, title: "Your Branding", desc: "White-label solution. Your clients see YOUR business, not ours" },
              { icon: Heart, title: "Easy Setup", desc: "Get started in minutes. No technical knowledge required" },
            ].map((feature, i) => (
              <div key={i} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-amber-500/50 transition-colors">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-amber-500">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              The Results Speak for Themselves
            </h2>
            <p className="text-amber-100 text-lg">
              Join hundreds of businesses already growing with BookFlow
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <p className="text-6xl font-bold text-white mb-2">40%</p>
              <p className="text-amber-100 font-medium">More Bookings</p>
              <p className="text-amber-200 text-sm mt-2">Clients love booking online, anytime</p>
            </div>
            <div className="text-center">
              <p className="text-6xl font-bold text-white mb-2">80%</p>
              <p className="text-amber-100 font-medium">Fewer No-Shows</p>
              <p className="text-amber-200 text-sm mt-2">Prepaid appointments = committed clients</p>
            </div>
            <div className="text-center">
              <p className="text-6xl font-bold text-white mb-2">5hrs</p>
              <p className="text-amber-100 font-medium">Saved Weekly</p>
              <p className="text-amber-200 text-sm mt-2">No more phone tag and scheduling calls</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Loved by Businesses Across Europe
            </h2>
            <p className="text-gray-600 text-lg">
              Don't just take our word for it
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Marco Rossi", role: "Barbershop Owner, Rome", text: "BookFlow completely transformed how I manage my barbershop. No-shows dropped by 75% after I started requiring online payment. Best investment I've made.", rating: 5 },
              { name: "Sophie Weber", role: "Clinic Director, Berlin", text: "The automated reminders are a game-changer. Our show rate improved dramatically. Patients love the convenience of booking online.", rating: 5 },
              { name: "Pierre Dubois", role: "Beauty Salon, Paris", text: "Setup was incredibly easy. I was taking bookings within an hour. The dashboard gives me insights I never had before.", rating: 5 },
            ].map((testimonial, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-8">
                <div className="flex gap-1 text-amber-500 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Join 500+ businesses already using BookFlow to save time and earn more. 
            Get started for free - no credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/admin/login" 
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-gray-900 px-10 py-5 rounded-full font-bold text-lg transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-gray-500 text-sm">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Free 14-day trial
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Setup in 5 minutes
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">BookFlow</span>
            </div>
            <div className="flex items-center gap-8 text-gray-400 text-sm">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <Link href="/admin/login" className="hover:text-white transition-colors">Login</Link>
              <Link href="/booking" className="hover:text-white transition-colors">Book Now</Link>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 BookFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
