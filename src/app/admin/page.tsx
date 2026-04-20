"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { LogOut, Trash2, Calendar, Clock, User, Phone, Scissors, Loader2, AlertCircle, WifiOff } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  const fetchAppointments = async (client: Awaited<ReturnType<typeof getSupabaseClient>>) => {
    if (!client) {
      setError("Failed to connect to database");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await client
        .from("appointments")
        .select("*")
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (fetchError) throw fetchError;
      setAppointments(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Failed to load appointments. Please refresh the page.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    async function checkUser() {
      if (!isSupabaseConfigured()) {
        setError("Authentication service not configured. Please contact support.");
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }

      const client = getSupabaseClient();
      if (!client) {
        setError("Failed to initialize authentication. Please refresh.");
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        const { data: { session }, error: sessionError } = await client.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          setError("Session error. Please login again.");
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        if (!session) {
          router.push("/admin/login");
          return;
        }

        setIsAuthenticated(true);
        await fetchAppointments(client);

        // Subscribe to realtime updates
        const channel = client
          .channel('schema-db-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'appointments' },
            () => {
              fetchAppointments(client);
            }
          )
          .subscribe();

        return () => {
          client.removeChannel(channel);
        };
      } catch (err) {
        console.error("Auth check error:", err);
        setError("Failed to verify authentication");
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    }

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }
    router.push("/admin/login");
  };

  const handleDelete = async (id: string) => {
    const client = getSupabaseClient();
    if (!client) {
      alert("Authentication error. Please refresh the page.");
      return;
    }

    if (!confirm("Are you sure you want to delete this appointment?")) return;
    
    setIsDeleting(id);
    
    try {
      const { error: deleteError } = await client.from("appointments").delete().eq("id", id);
      
      if (deleteError) {
        alert("Failed to delete appointment. Please try again.");
        setIsDeleting(null);
        return;
      }

      setAppointments(appointments.filter(app => app.id !== id));
    } catch (err) {
      alert("Failed to delete appointment. Please try again.");
    }
    
    setIsDeleting(null);
  };

  // Loading state
  if (isLoading || isAuthenticated === null) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center bg-neutral-950 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-gold-500" />
        <p className="text-neutral-400 text-sm">Loading dashboard...</p>
      </div>
    );
  }

  // Error state
  if (error && isAuthenticated === false) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center bg-neutral-950 p-4">
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-sm max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-white font-bold text-xl mb-2">Something went wrong</h2>
          <p className="text-neutral-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gold-500 text-neutral-950 px-6 py-3 rounded-sm font-bold uppercase tracking-wider text-sm"
          >
            Refresh Page
          </button>
        </div>
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

        {error && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 p-4 rounded-sm mb-8 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {appointments.length === 0 ? (
          <div className="bg-neutral-900 border border-white/5 p-12 text-center rounded-sm">
            <Calendar className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400">No appointments scheduled.</p>
          </div>
        ) : (
          <div className="space-y-12">
             {sortedDates.map((date) => {
               const dayApps = groupedAppointments[date];
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