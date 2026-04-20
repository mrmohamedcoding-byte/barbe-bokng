"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { 
  LogOut, Trash2, Calendar, Clock, User, Phone, Scissors, 
  Loader2, TrendingUp, DollarSign, Users, BarChart3, PieChart,
  CheckCircle2, XCircle
} from "lucide-react";

interface Appointment {
  id: string;
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  created_at: string;
  status?: string;
  payment_status?: string;
  amount_paid?: number;
}

interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  todayBookings: number;
  pendingPayments: number;
  popularServices: { service: string; count: number }[];
  hourlyDistribution: { hour: string; count: number }[];
  weeklyData: { day: string; bookings: number; revenue: number }[];
}

export default function AdminDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState<'appointments' | 'analytics'>('appointments');
  const router = useRouter();

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/admin/login");
        return;
      }

      const { data } = await supabase
        .from("appointments")
        .select("*")
        .order("date", { ascending: false })
        .order("time", { ascending: true });

      if (data) {
        setAppointments(data);
        calculateStats(data);
      }
      setIsLoading(false);

      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'appointments' },
          () => {
            supabase
              .from("appointments")
              .select("*")
              .order("date", { ascending: false })
              .order("time", { ascending: true })
              .then(({ data }) => {
                if (data) {
                  setAppointments(data);
                  calculateStats(data);
                }
              });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    checkUser();
  }, [router]);

  const calculateStats = (data: Appointment[]) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayBookings = data.filter(a => a.date === today).length;
    const totalRevenue = data
      .filter(a => a.payment_status === 'paid')
      .reduce((sum, a) => sum + (a.amount_paid || 0), 0) / 100;
    
    const serviceCount: Record<string, number> = {};
    data.forEach(a => {
      serviceCount[a.service] = (serviceCount[a.service] || 0) + 1;
    });
    const popularServices = Object.entries(serviceCount)
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const hourCount: Record<string, number> = {};
    data.forEach(a => {
      const hour = a.time.split(':')[0] + ':00';
      hourCount[hour] = (hourCount[hour] || 0) + 1;
    });
    const hourlyDistribution = Object.entries(hourCount)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    const weekData: { day: string; bookings: number; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayBookings = data.filter(a => a.date === dateStr);
      weekData.push({
        day: format(date, 'EEE'),
        bookings: dayBookings.length,
        revenue: dayBookings
          .filter(a => a.payment_status === 'paid')
          .reduce((sum, a) => sum + (a.amount_paid || 0), 0) / 100,
      });
    }

    setStats({
      totalBookings: data.length,
      totalRevenue,
      todayBookings,
      pendingPayments: data.filter(a => a.payment_status !== 'paid').length,
      popularServices,
      hourlyDistribution,
      weeklyData: weekData,
    });
  };

  const handleLogout = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.auth.signOut();
    }
    router.push("/admin/login");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return;

    setIsDeleting(id);
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    
    if (!error) {
      const updatedData = appointments.filter(app => app.id !== id);
      setAppointments(updatedData);
      calculateStats(updatedData);
    }
    setIsDeleting(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center bg-neutral-950">
        <Loader2 className="w-10 h-10 animate-spin text-gold-500" />
      </div>
    );
  }

  const groupedAppointments = appointments.reduce((acc, app) => {
    if (!acc[app.date]) {
      acc[app.date] = [];
    }
    acc[app.date].push(app);
    return acc;
  }, {} as Record<string, Appointment[]>);

  const sortedDates = Object.keys(groupedAppointments).sort().reverse();

  const maxWeeklyBookings = Math.max(...(stats?.weeklyData.map(d => d.bookings) || [1]));
  const maxHourlyCount = Math.max(...(stats?.hourlyDistribution.map(d => d.count) || [1]));

  return (
    <div className="flex flex-col flex-grow bg-neutral-950 px-4 py-8">
      <div className="container mx-auto max-w-7xl">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-neutral-400">Manage appointments and view analytics</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors bg-neutral-900 border border-white/5 px-4 py-2 rounded-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wider">Logout</span>
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-neutral-900 border border-white/5 p-6 rounded-sm">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-5 h-5 text-gold-500" />
                <span className="text-xs text-green-400 uppercase tracking-wider">Total</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalBookings}</p>
              <p className="text-xs text-neutral-500 mt-1">All Bookings</p>
            </div>
            
            <div className="bg-neutral-900 border border-white/5 p-6 rounded-sm">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="text-xs text-green-400 uppercase tracking-wider">Revenue</span>
              </div>
              <p className="text-3xl font-bold text-white">€{stats.totalRevenue.toFixed(0)}</p>
              <p className="text-xs text-neutral-500 mt-1">Total Earned</p>
            </div>
            
            <div className="bg-neutral-900 border border-white/5 p-6 rounded-sm">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-blue-400 uppercase tracking-wider">Today</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.todayBookings}</p>
              <p className="text-xs text-neutral-500 mt-1">Appointments</p>
            </div>
            
            <div className="bg-neutral-900 border border-white/5 p-6 rounded-sm">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <span className="text-xs text-amber-400 uppercase tracking-wider">Popular</span>
              </div>
              <p className="text-xl font-bold text-white truncate">
                {stats.popularServices[0]?.service || 'N/A'}
              </p>
              <p className="text-xs text-neutral-500 mt-1">{stats.popularServices[0]?.count || 0} bookings</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-3 font-semibold uppercase tracking-wider text-sm transition-colors border-b-2 ${
              activeTab === 'appointments' 
                ? 'text-gold-500 border-gold-500' 
                : 'text-neutral-400 border-transparent hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Appointments
            </div>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-3 font-semibold uppercase tracking-wider text-sm transition-colors border-b-2 ${
              activeTab === 'analytics' 
                ? 'text-gold-500 border-gold-500' 
                : 'text-neutral-400 border-transparent hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </div>
          </button>
        </div>

        {activeTab === 'appointments' && (
          <div className="space-y-8">
            {appointments.length === 0 ? (
              <div className="bg-neutral-900 border border-white/5 p-12 text-center rounded-sm">
                <Calendar className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-400">No appointments scheduled.</p>
              </div>
            ) : (
              sortedDates.map((date) => {
                const dayApps = groupedAppointments[date];
                const isPast = new Date(date) < new Date(new Date().setHours(0,0,0,0));
                
                return (
                  <div key={date} className={isPast ? "opacity-50" : ""}>
                    <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
                      <Calendar className="w-5 h-5 text-gold-500" />
                      <h2 className="text-xl font-bold text-white">
                        {format(parseISO(date), "EEEE, MMMM do, yyyy")}
                        {isPast && <span className="ml-3 text-xs uppercase bg-neutral-800 text-neutral-400 px-2 py-1 rounded-sm">Past</span>}
                      </h2>
                      <span className="text-neutral-500 text-sm">({dayApps.length} appointments)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dayApps.map((app) => (
                        <div key={app.id} className="bg-neutral-900 border border-white/5 p-5 rounded-sm relative group">
                          {isDeleting === app.id && (
                            <div className="absolute inset-0 bg-neutral-950/80 z-10 flex items-center justify-center rounded-sm">
                              <Loader2 className="w-6 h-6 animate-spin text-gold-500" />
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-gold-500 font-bold text-lg flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {app.time}
                            </span>
                            <div className="flex items-center gap-2">
                              {app.payment_status === 'paid' ? (
                                <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-sm">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Paid
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-sm">
                                  <XCircle className="w-3 h-3" />
                                  Pending
                                </span>
                              )}
                              <button
                                onClick={() => handleDelete(app.id)}
                                className="text-neutral-600 hover:text-red-500 transition-colors bg-neutral-950 p-1.5 rounded-sm"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-neutral-500" />
                              <span className="text-white font-medium">{app.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-neutral-500" />
                              <span className="text-neutral-300">{app.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Scissors className="w-3.5 h-3.5 text-gold-500/70" />
                              <span className="text-neutral-300">{app.service}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'analytics' && stats && (
          <div className="space-y-8">
            <div className="bg-neutral-900 border border-white/5 p-6 rounded-sm">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gold-500" />
                Weekly Overview
              </h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mb-4">Bookings</p>
                  <div className="flex items-end gap-3 h-40">
                    {stats.weeklyData.map((day, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-neutral-800 rounded-t-sm relative" style={{ height: '160px' }}>
                          <div 
                            className="absolute bottom-0 w-full bg-gold-500/80 rounded-t-sm transition-all hover:bg-gold-500"
                            style={{ height: `${(day.bookings / maxWeeklyBookings) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-500">{day.day}</span>
                        <span className="text-sm font-bold text-white">{day.bookings}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mb-4">Revenue (€)</p>
                  <div className="flex items-end gap-3 h-40">
                    {stats.weeklyData.map((day, i) => {
                      const maxRevenue = Math.max(...stats.weeklyData.map(d => d.revenue), 1);
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full bg-neutral-800 rounded-t-sm relative" style={{ height: '160px' }}>
                            <div 
                              className="absolute bottom-0 w-full bg-green-500/80 rounded-t-sm transition-all hover:bg-green-500"
                              style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-neutral-500">{day.day}</span>
                          <span className="text-sm font-bold text-white">€{day.revenue.toFixed(0)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-neutral-900 border border-white/5 p-6 rounded-sm">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-gold-500" />
                  Popular Services
                </h3>
                <div className="space-y-4">
                  {stats.popularServices.map((item, i) => {
                    const maxCount = stats.popularServices[0]?.count || 1;
                    return (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-neutral-500 text-sm w-6">{i + 1}.</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white">{item.service}</span>
                            <span className="text-gold-500 font-semibold">{item.count}</span>
                          </div>
                          <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gold-500 rounded-full"
                              style={{ width: `${(item.count / maxCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-neutral-900 border border-white/5 p-6 rounded-sm">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gold-500" />
                  Peak Hours
                </h3>
                <div className="flex items-end gap-2 h-48">
                  {stats.hourlyDistribution.map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-neutral-800 rounded-t-sm relative" style={{ height: '180px' }}>
                        <div 
                          className="absolute bottom-0 w-full bg-blue-500/80 rounded-t-sm transition-all hover:bg-blue-500"
                          style={{ height: `${(item.count / maxHourlyCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-neutral-500">{item.hour}</span>
                      <span className="text-xs font-bold text-white">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
