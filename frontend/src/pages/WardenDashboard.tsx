import { useEffect, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { UserCheck, UserX, Eye, CheckCircle, AlertTriangle, RefreshCw, Clock, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dashboardApi, complaintsApi, RectorStats, Complaint } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const statusVariant = {
  Pending: "pending" as const,
  "In Progress": "progress" as const,
  Resolved: "resolved" as const,
};

export default function WardenDashboard() {
  const [stats, setStats] = useState<RectorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchData = () => {
    setLoading(true);
    dashboardApi.getWardenStats()
      .then((res) => {
        if (res.data) setStats(res.data);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleResolve = async (complaint: Complaint) => {
    setResolvingId(complaint._id);
    try {
      const newStatus = complaint.status === "Pending" ? "In Progress" : "Resolved";
      await complaintsApi.updateStatus(complaint._id, newStatus);
      toast({ title: "Status Updated", description: `Complaint marked as "${newStatus}"` });
      fetchData();
    } catch (err: unknown) {
      toast({
        title: "Update Failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Rector Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-sm">Loading dashboard data...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Rector Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3 text-destructive">
            <AlertTriangle className="w-8 h-8" />
            <p className="text-sm font-medium">Failed to load: {error}</p>
            <p className="text-xs text-muted-foreground">Make sure the backend is running on port 5000</p>
            <Button variant="outline" size="sm" onClick={fetchData} className="mt-2 gap-2">
              <RefreshCw className="w-4 h-4" /> Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const complaints = stats?.recentComplaints ?? [];

  return (
    <DashboardLayout title="Rector Dashboard">
      {/* Attendance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Present Today"   value={stats?.presentStudents ?? 0}
          description={`Out of ${stats?.totalStudents ?? 0} total`}
          icon={UserCheck} gradient="from-emerald-400 to-teal-500" delay={0} />
        <StatCard title="Absent Today"    value={stats?.absentStudents ?? 0}
          description="Not checked in"
          icon={UserX} gradient="from-red-400 to-rose-500" delay={75} />
        <StatCard title="Late Today"      value={stats?.lateStudents ?? 0}
          description="Came in late"
          icon={Clock} gradient="from-amber-400 to-orange-500" delay={150} />
        <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-5 text-white shadow-lg flex flex-col justify-between animate-fade-up delay-200">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/70 mb-2">Attendance</p>
            <p className="text-sm font-bold">
              {stats?.attendanceMarked
                ? <span>✓ Marked today</span>
                : <span className="text-yellow-200">⚠ Not marked yet</span>}
            </p>
          </div>
          <Button size="sm" className="mt-3 gap-1.5 w-full bg-white/20 hover:bg-white/30 text-white border-0" onClick={() => navigate('/attendance')}>
            <ClipboardList className="w-3.5 h-3.5" />
            {stats?.attendanceMarked ? "View / Edit" : "Mark Now"}
          </Button>
        </div>
      </div>

      {/* Complaint Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 shadow-card">
          <p className="text-xs text-muted-foreground mb-1">Pending Complaints</p>
          <p className="text-2xl font-bold text-status-pending">{stats?.pendingComplaints ?? 0}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-card">
          <p className="text-xs text-muted-foreground mb-1">In Progress</p>
          <p className="text-2xl font-bold text-primary">{stats?.inProgressComplaints ?? 0}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-card col-span-2 sm:col-span-1">
          <p className="text-xs text-muted-foreground mb-1">Total Active</p>
          <p className="text-2xl font-bold text-foreground">
            {(stats?.pendingComplaints ?? 0) + (stats?.inProgressComplaints ?? 0)}
          </p>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden mb-6">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Active Complaints</h3>
          <Button variant="ghost" size="sm" onClick={fetchData} className="gap-1 text-xs">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
        {complaints.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">
            No active complaints 🎉
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Student Name</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Room</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Complaint</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c._id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{c.studentName}</td>
                    <td className="px-5 py-3 text-muted-foreground">{c.roomNo}</td>
                    <td className="px-5 py-3 text-foreground max-w-[200px] truncate">{c.complaint}</td>
                    <td className="px-5 py-3">
                      <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="gap-1 text-xs">
                          <Eye className="w-3.5 h-3.5" /> View
                        </Button>
                        {c.status !== "Resolved" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-xs text-status-resolved"
                            onClick={() => handleResolve(c)}
                            disabled={resolvingId === c._id}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {c.status === "Pending" ? "Start" : "Resolve"}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notices */}
      {(stats?.notices ?? []).length > 0 && (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="text-base font-semibold text-foreground">Recent Notices</h3>
          </div>
          <div className="divide-y divide-border">
            {(stats?.notices ?? []).slice(0, 5).map((n) => (
              <div key={n._id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground text-sm">{n.title}</h4>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                        {n.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{n.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {new Date(n.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
