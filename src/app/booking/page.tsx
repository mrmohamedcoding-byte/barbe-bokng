"use client";

import { FadeIn } from "@/components/ui/FadeIn";
import { useState, useEffect } from "react";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { CheckCircle2, Loader2, Calendar as CalendarIcon, Clock, AlertCircle, WifiOff } from "lucide-react";

const bookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(8, "Please enter a valid phone number"),
  service: z.string().min(1, "Please select a service"),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const SERVICES = [
  "Classic Haircut ($35)",
  "Skin Fade ($40)",
  "Buzz Cut ($25)",
  "Scissor Cut ($45)",
  "Beard Sculpting ($25)",
  "Traditional Hot Towel Shave ($40)",
  "The Full Gentleman ($55)",
  "The Executive VIP ($80)",
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
  });

  // Generate next 14 days for selection
  const upcomingDays = Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i));

  useEffect(() => {
    async function fetchBookedSlots() {
      if (!isSupabaseConfigured()) {
        setNetworkError("Booking service is not configured. Please try again later.");
        return;
      }

      setIsLoadingSlots(true);
      setSelectedTime(null);
      setNetworkError(null);
      
      const client = getSupabaseClient();
      if (!client) {
        setNetworkError("Failed to connect to booking service. Please refresh.");
        setIsLoadingSlots(false);
        return;
      }
      
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      
      try {
        const { data, error } = await client
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
      alert("Please select a time slot");
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setNetworkError("Failed to connect to booking service. Please refresh.");
      return;
    }

    setIsSubmitting(true);
    setNetworkError(null);
    
    const formattedDate = format(selectedDate, "yyyy-MM-dd");

    try {
      const { error } = await client.from("appointments").insert({
        name: data.name,
        phone: data.phone,
        service: data.service,
        date: formattedDate,
        time: selectedTime,
      });

      if (error) {
        console.error("Booking error:", error);
        setNetworkError(error.message.includes("duplicate") 
          ? "This time slot was just booked. Please select another."
          : "Failed to book appointment. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Trigger email notification silently
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            phone: data.phone,
            service: data.service,
            date: formattedDate,
            time: selectedTime,
          })
        });
      } catch {
        // Silent fail - booking already succeeded
      }

      setIsSuccess(true);
      reset();
      setSelectedTime(null);
    } catch (err) {
      console.error("Submit error:", err);
      setNetworkError("Failed to book appointment. Please try again.");
    }
    
    setIsSubmitting(false);
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
            Thank you for choosing The Gentleman's Club. We look forward to seeing you on {format(selectedDate, "MMMM do, yyyy")} at {selectedTime}.
          </p>
          <button
            onClick={() => setIsSuccess(false)}
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
              Select your preferred date, choose from our available time slots, and secure your grooming session.
            </p>
          </FadeIn>
        </div>

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
          
          {/* Step 1 & 2: Date and Time Selection */}
          <div className="lg:col-span-7 space-y-12">
            <FadeIn delay={0.1}>
              <div className="bg-neutral-900 border border-white/5 p-6 md:p-8 rounded-sm">
                <div className="flex items-center gap-3 mb-6">
                  <CalendarIcon className="w-6 h-6 text-gold-500" />
                  <h2 className="text-xl font-bold text-white uppercase tracking-wider">1. Select Date</h2>
                </div>
                
                {/* Horizontal Date Scroller */}
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
                              : "bg-neutral-950 border-white/5 text-white hover:border-gold-500/50"
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

          {/* Step 3: Client Details */}
          <div className="lg:col-span-5">
            <FadeIn delay={0.3}>
              <form onSubmit={handleSubmit(onSubmit)} className="bg-neutral-900 border border-white/5 p-6 md:p-8 rounded-sm sticky top-24">
                <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-6">3. Your Details</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2">Service</label>
                    <select
                      {...register("service")}
                      className="w-full bg-neutral-950 border border-white/10 p-4 rounded-sm text-white focus:outline-none focus:border-gold-500 transition-colors appearance-none"
                    >
                      <option value="">Select a service...</option>
                      {SERVICES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.service && <p className="text-red-400 text-xs mt-2">{errors.service.message}</p>}
                  </div>

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
                </div>

                <div className="mt-8 pt-8 border-t border-white/5">
                  <div className="flex justify-between items-center mb-6 text-neutral-400 text-sm">
                    <span>Date & Time:</span>
                    <span className="text-white font-semibold flex items-center gap-2">
                       {selectedTime ? `${format(selectedDate, "MMM d, yyyy")} at ${selectedTime}` : "Not selected"}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedTime}
                    className="w-full bg-gold-500 hover:bg-gold-400 text-neutral-950 py-4 font-bold uppercase tracking-widest rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      "Confirm Booking"
                    )}
                  </button>
                </div>
              </form>
            </FadeIn>
          </div>

        </div>
      </div>
    </div>
  );
}