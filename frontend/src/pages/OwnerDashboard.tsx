import { useEffect, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Users, IndianRupee, MessageSquareWarning, DoorOpen, AlertTriangle, ArrowRight, CheckCircle2, Clock, XCircle } from "lucide-react";
import { FeeChart } from "@/components/charts/FeeChart";
import { ComplaintPieChart } from "@/components/charts/ComplaintPieChart";
import { dashboardApi, complaintsApi, studentsApi, OwnerStats, Student, Complaint } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const statusVariant = {
  Pending:      "pending"  as const,
  "In Progress":"progress" as const,
  Resolved:     "resolved" as const,
};

const feeColor: Record<string, string> = {
  paid:    "bg-emerald-100 text-emerald-700",
  pending: "bg-red-100 text-red-700",
  partial: "bg-yellow-100 text-yellow-700",
};

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]                   = useState<OwnerStats | null>(null);
  const [complaintCounts, setComplaintCounts] = useState({ pending: 0, inProgress: 0, resolved: 0 });
  const [pendingStudents, setPendingStudents] = useState<Student[]>([]);
  const [activeComplaints, setActiveComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");

  useEffect(() => {
    Promise.all([
      dashboardApi.getOwnerStats(),
      complaintsApi.getAll({ limit: 100 }),
      studentsApi.getAll({ limit: 200 }),
    ])
      .then(([statsRes, complaintsRes, studentsRes]) => {
        if (statsRes.data) setStats(statsRes.data);

        const complaints = complaintsRes.data ?? [];
        setComplaintCounts({
          pending:    complaints.filter(c => c.status === "Pending").length,
          inProgress: complaints.filter(c => c.status === "In Progress").length,
          resolved:   complaints.filter(c => c.status === "Resolved").length,
        });
        setActiveComplaints(complaints.filter(c => c.status !== "Resolved").slice(0, 5));

        const students = studentsRes.data ?? [];
        setPendingStudents(students.filter(s => s.feeStatus !== "paid").slice(0, 5));
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const feeBreakdown  = stats?.feeBreakdown ?? [];
  const paid          = feeBreakdown.find(f => f._id === "paid");
  const pendingFee    = feeBreakdown.find(f => f._id === "pending");
  const partial       = feeBreakdown.find(f => f._id === "partial");
  const pendingFeeAmt = (pendingFee?.totalAmount ?? 0) + (partial?.totalAmount ?? 0);

  const complaintChartData = [
    { name: "Pending",     value: complaintCounts.pending,    color: "hsl(38, 92%, 50%)" },
    { name: "In Progress", value: complaintCounts.inProgress, color: "hsl(217, 91%, 53%)" },
    { name: "Resolved",    value: complaintCounts.resolved,   color: "hsl(160, 84%, 39%)" },
  ];

  if (loading) return (
    <DashboardLayout title="Owner Dashboard">
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

  if (error) return (
    <DashboardLayout title="Owner Dashboard">
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-destructive">
          <AlertTriangle className="w-8 h-8" />
          <p className="text-sm font-medium">Failed to load: {error}</p>
          <p className="text-xs text-muted-foreground">Make sure the backend is running on port 5000</p>
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Owner Dashboard">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Students"   value={stats?.totalStudents ?? 0}
          description="Enrolled in hostel"
          icon={Users} gradient="from-violet-500 to-purple-600"
          onClick={() => navigate("/students")} delay={0} />
        <StatCard title="Pending Fees"     value={`₹${(pendingFeeAmt/1000).toFixed(1)}K`}
          description={`From ${stats?.pendingFeeStudents ?? 0} students`}
          icon={IndianRupee} gradient="from-orange-400 to-pink-500"
          onClick={() => navigate("/fees")} delay={75} />
        <StatCard title="Active Complaints" value={stats?.activeComplaints ?? 0}
          description="Pending resolution"
          icon={MessageSquareWarning} gradient="from-red-400 to-rose-600"
          onClick={() => navigate("/complaints")} delay={150} />
        <StatCard title="Occupied Rooms"   value={stats?.occupiedRooms ?? 0}
          description={`of ${stats?.totalRooms ?? 0} total rooms`}
          icon={DoorOpen} gradient="from-teal-400 to-emerald-500"
          onClick={() => navigate("/rooms")} delay={225} />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h3 className="text-base font-semibold text-foreground mb-1">Fee Status Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Paid: {paid?.count ?? 0} · Pending: {pendingFee?.count ?? 0} · Partial: {partial?.count ?? 0}
          </p>
          <FeeChart paidCount={paid?.count ?? 0} pendingCount={pendingFee?.count ?? 0} partialCount={partial?.count ?? 0} />
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h3 className="text-base font-semibold text-foreground mb-4">Complaint Status</h3>
          <ComplaintPieChart data={complaintChartData} />
        </div>
      </div>

      {/* ── Bottom Row: Pending Fees + Active Complaints ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Pending Fee Students */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-yellow-600" />
              <h3 className="text-sm font-semibold">Students with Pending Fees</h3>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                {stats?.pendingFeeStudents ?? 0}
              </span>
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate("/fees")}>
              View all <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
          {pendingStudents.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-10 text-emerald-600 text-sm">
              <CheckCircle2 className="w-5 h-5" /> All fees cleared!
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pendingStudents.map(s => (
                <div key={s._id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-yellow-700">
                      {s.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">Room {s.roomNo || "—"} · {s.branch}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-red-600">
                      ₹{((s.feeAmount ?? 0) - (s.feePaid ?? 0)).toLocaleString()}
                    </p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize ${feeColor[s.feeStatus]}`}>
                      {s.feeStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Complaints */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquareWarning className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-semibold">Active Complaints</h3>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                {stats?.activeComplaints ?? 0}
              </span>
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate("/complaints")}>
              View all <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
          {activeComplaints.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-10 text-emerald-600 text-sm">
              <CheckCircle2 className="w-5 h-5" /> No active complaints!
            </div>
          ) : (
            <div className="divide-y divide-border">
              {activeComplaints.map(c => (
                <div key={c._id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    {c.status === "Pending"
                      ? <Clock className="w-4 h-4 text-yellow-600" />
                      : <XCircle className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.title || c.complaint}</p>
                    <p className="text-xs text-muted-foreground">{c.studentName} · Room {c.roomNo}</p>
                  </div>
                  <Badge variant={statusVariant[c.status]} className="shrink-0 text-[10px]">
                    {c.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </DashboardLayout>
  );
}
