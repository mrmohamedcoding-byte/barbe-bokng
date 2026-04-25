"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { 
  LogOut,
  Trash2,
  Calendar,
  Clock,
  Loader2,
  TrendingUp,
  Users,
  BarChart3,
  PieChart,
  CheckCircle2,
  XCircle,
  Ban,
  Filter
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
  notes?: string | null;
}

interface DashboardStats {
  totalBookings: number;
  todayBookings: number;
  popularServices: { service: string; count: number }[];
  hourlyDistribution: { hour: string; count: number }[];
  weeklyData: { day: string; bookings: number }[];
}

type BookingStatus = "pending" | "confirmed" | "cancelled";

export default function AdminDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState<'appointments' | 'analytics'>('appointments');
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"all" | BookingStatus>("all");
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
        setFilterDate(format(new Date(), "yyyy-MM-dd"));
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

    const weekData: { day: string; bookings: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayBookings = data.filter(a => a.date === dateStr);
      weekData.push({
        day: format(date, 'EEE'),
        bookings: dayBookings.length,
      });
    }

    setStats({
      totalBookings: data.length,
      todayBookings,
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

  const handleUpdateStatus = async (id: string, status: BookingStatus) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    setIsUpdatingStatus(id);
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);

    if (error) {
      alert(error.message);
    }

    setIsUpdatingStatus(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center bg-neutral-950">
        <Loader2 className="w-10 h-10 animate-spin text-gold-500" />
      </div>
    );
  }

  const maxWeeklyBookings = Math.max(...(stats?.weeklyData.map(d => d.bookings) || [1]));
  const maxHourlyCount = Math.max(...(stats?.hourlyDistribution.map(d => d.count) || [1]));

  const normalizedAppointments = appointments.map((a) => ({
    ...a,
    status: (a.status as BookingStatus | undefined) ?? "pending",
  }));

  const visibleAppointments = normalizedAppointments.filter((a) => {
    const matchesDate = filterDate ? a.date === filterDate : true;
    const matchesStatus = filterStatus === "all" ? true : a.status === filterStatus;
    return matchesDate && matchesStatus;
  });

  const todaysCount = normalizedAppointments.filter((a) => a.date === format(new Date(), "yyyy-MM-dd")).length;

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
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-blue-400 uppercase tracking-wider">Today</span>
              </div>
              <p className="text-3xl font-bold text-white">{todaysCount}</p>
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
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-white/5 p-4 rounded-sm">
              <div className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
                <div className="flex items-center gap-2 text-neutral-300">
                  <Filter className="w-4 h-4 text-gold-500" />
                  <span className="text-sm font-semibold uppercase tracking-wider">Filters</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full md:w-auto">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-full bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1">
                      Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as "all" | BookingStatus)}
                      className="w-full bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
                    >
                      <option value="all">All</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        setFilterDate("");
                        setFilterStatus("all");
                      }}
                      className="w-full bg-neutral-950 border border-white/10 px-3 py-2 rounded-sm text-neutral-300 hover:text-white hover:border-gold-500/40 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-white/5 rounded-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gold-500" />
                  <div>
                    <p className="text-white font-bold">Bookings</p>
                    <p className="text-neutral-500 text-xs">
                      Showing <span className="text-neutral-300 font-semibold">{visibleAppointments.length}</span> result(s)
                    </p>
                  </div>
                </div>
                {filterDate && (
                  <span className="text-xs uppercase tracking-wider text-neutral-400">
                    {format(parseISO(filterDate), "MMM d, yyyy")}
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[900px] w-full text-sm">
                  <thead className="bg-neutral-950">
                    <tr className="text-neutral-400">
                      <th className="text-left font-semibold uppercase tracking-wider text-xs px-5 py-3">Date</th>
                      <th className="text-left font-semibold uppercase tracking-wider text-xs px-5 py-3">Time</th>
                      <th className="text-left font-semibold uppercase tracking-wider text-xs px-5 py-3">Client</th>
                      <th className="text-left font-semibold uppercase tracking-wider text-xs px-5 py-3">Phone</th>
                      <th className="text-left font-semibold uppercase tracking-wider text-xs px-5 py-3">Service</th>
                      <th className="text-left font-semibold uppercase tracking-wider text-xs px-5 py-3">Status</th>
                      <th className="text-right font-semibold uppercase tracking-wider text-xs px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-10 text-center text-neutral-500">
                          No bookings match your filters.
                        </td>
                      </tr>
                    ) : (
                      visibleAppointments
                        .slice()
                        .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))
                        .map((app) => {
                          const status = app.status ?? "pending";
                          const statusUI =
                            status === "confirmed"
                              ? { icon: CheckCircle2, label: "Confirmed", cls: "text-green-400 bg-green-500/10 border-green-500/20" }
                              : status === "cancelled"
                              ? { icon: Ban, label: "Cancelled", cls: "text-red-400 bg-red-500/10 border-red-500/20" }
                              : { icon: XCircle, label: "Pending", cls: "text-amber-400 bg-amber-500/10 border-amber-500/20" };

                          const StatusIcon = statusUI.icon;

                          return (
                            <tr key={app.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                              <td className="px-5 py-4 text-neutral-300">
                                {format(parseISO(app.date), "MMM d, yyyy")}
                              </td>
                              <td className="px-5 py-4">
                                <span className="inline-flex items-center gap-2 text-gold-500 font-semibold">
                                  <Clock className="w-4 h-4" />
                                  {app.time}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-white font-medium">{app.name}</td>
                              <td className="px-5 py-4 text-neutral-300">{app.phone}</td>
                              <td className="px-5 py-4 text-neutral-300">{app.service}</td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex items-center gap-2 border px-2.5 py-1 rounded-sm text-xs font-semibold ${statusUI.cls}`}>
                                  <StatusIcon className="w-3.5 h-3.5" />
                                  {statusUI.label}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    disabled={isUpdatingStatus === app.id || status === "confirmed"}
                                    onClick={() => handleUpdateStatus(app.id, "confirmed")}
                                    className="bg-neutral-950 border border-white/10 text-neutral-300 hover:text-white hover:border-green-500/40 px-3 py-2 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Mark confirmed"
                                  >
                                    {isUpdatingStatus === app.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="w-4 h-4" />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isUpdatingStatus === app.id || status === "cancelled"}
                                    onClick={() => handleUpdateStatus(app.id, "cancelled")}
                                    className="bg-neutral-950 border border-white/10 text-neutral-300 hover:text-white hover:border-red-500/40 px-3 py-2 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Mark cancelled"
                                  >
                                    {isUpdatingStatus === app.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Ban className="w-4 h-4" />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isDeleting === app.id}
                                    onClick={() => handleDelete(app.id)}
                                    className="bg-neutral-950 border border-white/10 text-neutral-300 hover:text-white hover:border-red-500/40 px-3 py-2 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Delete"
                                  >
                                    {isDeleting === app.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && stats && (
          <div className="space-y-8">
            <div className="bg-neutral-900 border border-white/5 p-6 rounded-sm">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gold-500" />
                Weekly Overview
              </h3>
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
