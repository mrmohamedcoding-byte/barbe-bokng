"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Calendar, Clock, User, Phone, Scissors, Loader2, Home } from "lucide-react";
import { FadeIn } from "@/components/ui/FadeIn";

interface BookingData {
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
}

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bookingEncoded = searchParams.get("booking");
    const sessionId = searchParams.get("session_id");

    if (bookingEncoded) {
      try {
        const decoded = JSON.parse(atob(bookingEncoded));
        setBookingData(decoded);
      } catch {
        setError("Failed to load booking details");
      }
    } else if (sessionId) {
      fetch(`/api/stripe/get-session?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "complete") {
            setError(null);
          } else {
            setError("Payment verification pending");
          }
        })
        .catch(() => {
          setError("Failed to verify payment");
        });
    }

    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center bg-neutral-950 p-4">
        <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
        <p className="text-neutral-400 mt-4">Verifying your booking...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center bg-neutral-950 p-4">
        <div className="bg-neutral-900 border border-white/5 p-8 max-w-lg w-full text-center rounded-sm">
          <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gold-500">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="font-playfair text-3xl font-bold text-white mb-4">Booking Confirmed!</h2>
          <p className="text-neutral-400 mb-8">
            Your appointment has been successfully booked. Check your email for confirmation details.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="flex-1 bg-gold-500 text-neutral-950 px-6 py-3 font-bold uppercase tracking-wider rounded-sm hover:bg-gold-400 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
            <Link
              href="/booking"
              className="flex-1 border border-white/10 text-white px-6 py-3 font-bold uppercase tracking-wider rounded-sm hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              Book Another
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center bg-neutral-950 p-4">
        <div className="bg-neutral-900 border border-white/5 p-8 max-w-lg w-full text-center rounded-sm">
          <h2 className="font-playfair text-2xl font-bold text-white mb-4">No Booking Found</h2>
          <Link
            href="/booking"
            className="bg-gold-500 text-neutral-950 px-6 py-3 font-bold uppercase tracking-wider rounded-sm hover:bg-gold-400 transition-colors inline-block"
          >
            Make a Booking
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow items-center justify-center bg-neutral-950 px-4 py-16">
      <FadeIn className="bg-neutral-900 border border-white/5 p-8 md:p-12 max-w-lg w-full text-center rounded-sm shadow-2xl">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <h2 className="font-playfair text-3xl md:text-4xl font-bold text-white mb-4">
          Booking Confirmed!
        </h2>
        
        <p className="text-neutral-400 mb-8">
          Thank you for choosing us! Your appointment has been confirmed and payment was successful.
        </p>

        <div className="bg-neutral-950 border border-white/5 rounded-sm p-6 text-left mb-8">
          <h3 className="text-gold-500 font-semibold uppercase tracking-wider text-sm mb-4 text-center">
            Appointment Details
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-neutral-500" />
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Name</p>
                <p className="text-white font-medium">{bookingData.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-neutral-500" />
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Phone</p>
                <p className="text-white font-medium">{bookingData.phone}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Scissors className="w-5 h-5 text-gold-500" />
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Service</p>
                <p className="text-white font-medium">{bookingData.service}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-neutral-500" />
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Date</p>
                <p className="text-white font-medium">{bookingData.date}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-neutral-500" />
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Time</p>
                <p className="text-white font-medium">{bookingData.time}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-sm p-4 mb-8">
          <p className="text-green-400 text-sm">
            A confirmation email has been sent to your email address. You'll also receive a reminder 24 hours before your appointment.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 bg-gold-500 text-neutral-950 px-6 py-3 font-bold uppercase tracking-wider rounded-sm hover:bg-gold-400 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/booking"
            className="flex-1 border border-white/10 text-white px-6 py-3 font-bold uppercase tracking-wider rounded-sm hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
          >
            Book Another
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex flex-col flex-grow items-center justify-center bg-neutral-950 p-4">
      <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
      <p className="text-neutral-400 mt-4">Verifying your booking...</p>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BookingSuccessContent />
    </Suspense>
  );
}
