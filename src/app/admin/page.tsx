"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { LogOut, Trash2, Calendar, Clock, User, Phone, Scissors, Loader2 } from "lucide-react";

interface Appointment {
  id: string;
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (!error && data) {
      setAppointments(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
      } else {
        fetchAppointments();
      }
    };
    checkUser();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          console.log("Realtime update received!", payload);
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;
    setIsDeleting(id);
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (!error) {
      setAppointments(appointments.filter(app => app.id !== id));
    } else {
      alert("Failed to delete appointment");
    }
    setIsDeleting(null);
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-neutral-950">
        <Loader2 className="w-10 h-10 animate-spin text-gold-500" />
      </div>
    );
  }

  // Group appointments by date
  const groupedAppointments = appointments.reduce((acc, app) => {
    if (!acc[app.date]) {
      acc[app.date] = [];
    }
    acc[app.date].push(app);
    return acc;
  }, {} as Record<string, Appointment[]>);

  const sortedDates = Object.keys(groupedAppointments).sort();

  return (
    <div className="flex flex-col flex-grow bg-neutral-950 px-4 py-12">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-playfair text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-neutral-400">Manage your barbershop appointments</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors bg-neutral-900 border border-white/5 px-4 py-2 rounded-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wider">Logout</span>
          </button>
        </div>

        {appointments.length === 0 ? (
          <div className="bg-neutral-900 border border-white/5 p-12 text-center rounded-sm">
            <p className="text-neutral-400">No appointments scheduled.</p>
          </div>
        ) : (
          <div className="space-y-12">
             {sortedDates.map((date) => {
               const dayApps = groupedAppointments[date];
               // Check if date is in the past
               const isPast = new Date(date) < new Date(new Date().setHours(0,0,0,0));
               
               return (
                 <div key={date} className={isPast ? "opacity-50" : ""}>
                   <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                     <Calendar className="w-6 h-6 text-gold-500" />
                     <h2 className="text-2xl font-bold text-white">
                        {format(parseISO(date), "EEEE, MMMM do, yyyy")}
                        {isPast && <span className="ml-3 text-xs uppercase bg-neutral-800 text-neutral-400 px-2 py-1 rounded-sm">Past</span>}
                     </h2>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {dayApps.map((app) => (
                       <div key={app.id} className="bg-neutral-900 border border-white/5 p-6 rounded-sm relative group">
                         {isDeleting === app.id && (
                           <div className="absolute inset-0 bg-neutral-950/80 z-10 flex items-center justify-center rounded-sm">
                             <Loader2 className="w-6 h-6 animate-spin text-gold-500" />
                           </div>
                         )}
                         <div className="flex items-center justify-between mb-4">
                            <span className="text-gold-500 font-bold text-xl flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                {app.time}
                            </span>
                            <button
                              onClick={() => handleDelete(app.id)}
                              className="text-neutral-600 hover:text-red-500 transition-colors bg-neutral-950 p-2 rounded-sm"
                              title="Delete Appointment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                         
                         <div className="space-y-3">
                            <div className="flex items-start gap-3 text-sm">
                                <User className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                                <span className="text-white font-medium">{app.name}</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                                <Phone className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                                <span className="text-neutral-300">{app.phone}</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                                <Scissors className="w-4 h-4 text-gold-500 mt-0.5 shrink-0" />
                                <span className="text-neutral-300">{app.service}</span>
                            </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               );
             })}
          </div>
        )}
      </div>
    </div>
  );
}
