"use client";

import { FadeIn } from "@/components/ui/FadeIn";
import { useState, useEffect } from "react";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@supabase/supabase-js";
import { CheckCircle2, Loader2, Calendar as CalendarIcon, Clock, AlertCircle, CreditCard, ShieldCheck } from "lucide-react";

const bookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(8, "Please enter a valid phone number"),
  service: z.string().min(1, "Please select a service"),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const SERVICES = [
  { name: "Classic Haircut ($35)", price: 35, duration: "45 Min" },
  { name: "Skin Fade ($40)", price: 40, duration: "45 Min" },
  { name: "Buzz Cut ($25)", price: 25, duration: "30 Min" },
  { name: "Scissor Cut ($45)", price: 45, duration: "60 Min" },
  { name: "Beard Sculpting ($25)", price: 25, duration: "30 Min" },
  { name: "Traditional Hot Towel Shave ($40)", price: 40, duration: "45 Min" },
  { name: "The Full Gentleman ($55)", price: 55, duration: "75 Min" },
  { name: "The Executive VIP ($80)", price: 80, duration: "90 Min" },
];

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
];

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [canceledError, setCanceledError] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
  });

  const selectedService = watch("service");
  const selectedServiceData = SERVICES.find(s => s.name === selectedService);
  const upcomingDays = Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("canceled") === "true") {
      setCanceledError(true);
      window.history.replaceState({}, "", "/booking");
    }
  }, []);

  useEffect(() => {
    async function fetchBookedSlots() {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        setNetworkError("Booking service is not configured. Please try again later.");
        return;
      }

      setIsLoadingSlots(true);
      setSelectedTime(null);
      setNetworkError(null);
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      
      try {
        const { data, error } = await supabase
          .from("appointments")
          .select("time")
          .eq("date", formattedDate);

        if (error) {
          console.error("Error fetching slots:", error);
          setNetworkError("Failed to load available time slots.");
        } else {
          setBookedSlots(data.map(a => a.time));
          setNetworkError(null);
        }
      } catch (err) {
        console.error("Network error:", err);
        setNetworkError("Network error. Please check your connection.");
      }
      
      setIsLoadingSlots(false);
    }

    fetchBookedSlots();
  }, [selectedDate]);

  const onSubmit = async (data: BookingFormValues) => {
    if (!selectedTime) {
      setNetworkError("Please select a time slot");
      return;
    }

    if (!selectedServiceData) {
      setNetworkError("Please select a service");
      return;
    }

    setIsProcessingPayment(true);
    setNetworkError(null);
    
    const formattedDate = format(selectedDate, "yyyy-MM-dd");

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: data.service,
          name: data.name,
          phone: data.phone,
          date: formattedDate,
          time: selectedTime,
        }),
      });

      const result = await response.json();

      if (result.error || !result.url) {
        setNetworkError(result.error || "Failed to create payment session");
        setIsProcessingPayment(false);
        return;
      }

      window.location.href = result.url;
    } catch (err) {
      console.error("Payment error:", err);
      setNetworkError("Failed to process payment. Please try again.");
      setIsProcessingPayment(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex-grow flex items-center justify-center p-4">
        <FadeIn className="bg-neutral-900 border border-white/5 p-8 max-w-lg w-full text-center rounded-sm">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="font-playfair text-3xl font-bold text-white mb-4">Booking Confirmed!</h2>
          <p className="text-neutral-400 mb-8">
            Thank you for choosing The Gentleman's Club. Check your email for confirmation details.
          </p>
          <button
            onClick={() => {
              setIsSuccess(false);
              reset();
              setSelectedTime(null);
            }}
            className="bg-gold-500 text-neutral-950 px-8 py-3 font-bold uppercase tracking-wider rounded-sm hover:bg-gold-400 transition-colors w-full"
          >
            Book Another
          </button>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow bg-neutral-950 px-4 py-16">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <FadeIn>
            <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-4 text-white">
              Book Your <span className="text-gold-500 italic">Appointment</span>
            </h1>
            <p className="text-neutral-400 max-w-xl mx-auto">
              Select your preferred date, choose from our available time slots, and secure your grooming session with payment.
            </p>
          </FadeIn>
        </div>

        {canceledError && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-sm mb-8 flex items-center gap-3 max-w-6xl mx-auto">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Payment was canceled. Your booking was not completed. Please try again.</span>
            <button 
              onClick={() => setCanceledError(false)} 
              className="ml-auto text-amber-400/70 hover:text-amber-400"
            >
              ✕
            </button>
          </div>
        )}

        {networkError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm mb-8 flex items-center gap-3 max-w-6xl mx-auto">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{networkError}</span>
            <button 
              onClick={() => setNetworkError(null)} 
              className="ml-auto text-red-400/70 hover:text-red-400"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-12">
            <FadeIn delay={0.1}>
              <div className="bg-neutral-900 border border-white/5 p-6 md:p-8 rounded-sm">
                <div className="flex items-center gap-3 mb-6">
                  <CalendarIcon className="w-6 h-6 text-gold-500" />
                  <h2 className="text-xl font-bold text-white uppercase tracking-wider">1. Select Date</h2>
                </div>
                
                <div className="flex overflow-x-auto pb-4 gap-3 snap-x scrollbar-hide">
                  {upcomingDays.map((day) => {
                    const isSelected = isSameDay(day, selectedDate);
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={`flex flex-col items-center justify-center p-4 min-w-[100px] rounded-sm transition-all snap-start border ${
                          isSelected 
                            ? "bg-gold-500 text-neutral-950 border-gold-500" 
                            : "bg-neutral-950 border-white/5 text-neutral-400 hover:border-gold-500/50"
                        }`}
                      >
                        <span className={`text-sm uppercase tracking-wider font-semibold mb-1 ${isSelected ? "text-neutral-800" : "text-neutral-500"}`}>
                          {format(day, "EEE")}
                        </span>
                        <span className="text-2xl font-bold">
                          {format(day, "d")}
                        </span>
                        <span className={`text-xs mt-1 font-medium ${isSelected ? "text-neutral-800" : "text-neutral-600"}`}>
                          {format(day, "MMM")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="bg-neutral-900 border border-white/5 p-6 md:p-8 rounded-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-gold-500" />
                    <h2 className="text-xl font-bold text-white uppercase tracking-wider">2. Select Time</h2>
                  </div>
                  {isLoadingSlots && <Loader2 className="w-5 h-5 text-gold-500 animate-spin" />}
                </div>

                {isLoadingSlots ? (
                  <div className="flex items-center justify-center py-8 text-neutral-400">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Loading available slots...
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {TIME_SLOTS.map((time) => {
                      const isBooked = bookedSlots.includes(time);
                      const isSelected = selectedTime === time;

                      return (
                        <button
                          key={time}
                          disabled={isBooked || isLoadingSlots}
                          onClick={() => setSelectedTime(time)}
                          className={`py-3 px-2 rounded-sm text-sm font-semibold transition-all border outline-none ${
                            isBooked
                              ? "opacity-30 cursor-not-allowed bg-neutral-950 border-white/5 text-neutral-500 line-through"
                              : isSelected
                              ? "bg-gold-500 text-neutral-950 border-gold-500"
                              : "bg-neutral-950 border-white/10 text-white hover:border-gold-500/50"
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </FadeIn>
          </div>

          <div className="lg:col-span-5">
            <FadeIn delay={0.3}>
              <form onSubmit={handleSubmit(onSubmit)} className="bg-neutral-900 border border-white/5 p-6 md:p-8 rounded-sm sticky top-8">
                <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gold-500" />
                  3. Your Details
                </h2>

                <div className="space-y-6 mb-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2">Full Name</label>
                    <input
                      {...register("name")}
                      placeholder="John Doe"
                      className="w-full bg-neutral-950 border border-white/10 p-4 rounded-sm text-white focus:outline-none focus:border-gold-500 transition-colors placeholder-neutral-600"
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-2">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2">Phone Number</label>
                    <input
                      {...register("phone")}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-neutral-950 border border-white/10 p-4 rounded-sm text-white focus:outline-none focus:border-gold-500 transition-colors placeholder-neutral-600"
                    />
                    {errors.phone && <p className="text-red-400 text-xs mt-2">{errors.phone.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2">Select Service</label>
                    <select
                      {...register("service")}
                      className="w-full bg-neutral-950 border border-white/10 p-4 rounded-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
                    >
                      <option value="">Choose a service...</option>
                      {SERVICES.map((service) => (
                        <option key={service.name} value={service.name}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                    {errors.service && <p className="text-red-400 text-xs mt-2">{errors.service.message}</p>}
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5">
                  <div className="bg-neutral-950 border border-white/5 rounded-sm p-4 mb-6">
                    <h3 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-3">Order Summary</h3>
                    
                    {selectedServiceData ? (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-400">{selectedServiceData.name}</span>
                          <span className="text-white font-semibold">€{selectedServiceData.price}</span>
                        </div>
                        <div className="flex justify-between text-sm text-neutral-500">
                          <span>Duration</span>
                          <span>{selectedServiceData.duration}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-neutral-500 text-sm italic">Select a service to see pricing</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center mb-4 text-neutral-400 text-sm">
                    <span>Date & Time:</span>
                    <span className="text-white font-semibold">
                      {selectedTime ? `${format(selectedDate, "MMM d, yyyy")} at ${selectedTime}` : "Not selected"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-neutral-500 text-xs mb-4">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span>Secure payment powered by Stripe</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingPayment || !selectedTime || !selectedServiceData}
                    className="w-full bg-gold-500 hover:bg-gold-400 text-neutral-950 py-4 font-bold uppercase tracking-widest rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Redirecting to Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pay & Confirm Booking
                      </>
                    )}
                  </button>

                  <p className="text-center text-neutral-500 text-xs mt-3">
                    You'll be redirected to secure payment
                  </p>
                </div>
              </form>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
