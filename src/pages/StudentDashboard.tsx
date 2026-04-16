import { useEffect, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { studentsApi, complaintsApi, noticesApi, Student, Complaint, Notice } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DoorOpen, IndianRupee, MessageSquareWarning, Megaphone, Plus, Clock, Loader2, CheckCircle2 } from "lucide-react";

const statusColor: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Resolved: "bg-emerald-100 text-emerald-700",
};
const feeColor: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-red-100 text-red-700",
  partial: "bg-yellow-100 text-yellow-700",
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", complaint: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      // Load notices
      const noticesRes = await noticesApi.getAll(10);
      setNotices(noticesRes.data?.notices ?? []);

      // Find this student by email
      const studentsRes = await studentsApi.getAll({ limit: 200 });
      const found = studentsRes.data?.find(s => s.email === user?.email);

      if (found) {
        setStudent(found);
        // Load all complaints and filter by student id
        const cRes = await complaintsApi.getAll({ limit: 100 });
        const mine = cRes.data?.filter(c =>
          String(c.studentId ?? (c as any).student_id) === String(found.id ?? found._id)
        ) ?? [];
        setComplaints(mine);
      }
    } catch (e: unknown) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submitComplaint = async () => {
    if (!form.complaint.trim()) {
      return toast({ title: "Required", description: "Please describe your complaint.", variant: "destructive" });
    }
    if (!student) return;
    setSubmitting(true);
    try {
      await complaintsApi.create({
        studentName: student.name,
        roomNo: student.roomNo,
        title: form.title || "General Complaint",
        complaint: form.complaint,
        studentId: student.id,
      });
      toast({ title: "Submitted!", description: "Your complaint has been submitted successfully." });
      setShowForm(false);
      setForm({ title: "", complaint: "" });
      load();
    } catch (e: unknown) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Dashboard">
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading your dashboard...
        </div>
      </DashboardLayout>
    );
  }

  const pendingFee = (student?.feeAmount ?? 0) - (student?.feePaid ?? 0);

  return (
    <DashboardLayout title="My Dashboard">
      <div className="space-y-6">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-5">
          <h2 className="text-xl font-bold text-foreground">Welcome back, {student?.name ?? user?.name} 👋</h2>
          <p className="text-sm text-muted-foreground mt-1">Girls Hostel · Smart Hostel Management System</p>
        </div>

        {/* Info Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Room Details */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <DoorOpen className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-semibold">Room Details</span>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Room No</span><span className="font-mono font-semibold">{student?.roomNo || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Branch</span><span>{student?.branch || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Year</span><span>{student?.year || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Admission</span><span>{student?.admissionYear || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{student?.phone || "—"}</span></div>
            </div>
          </div>

          {/* Fee Status */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="font-semibold">Fee Status</span>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Total Fee</span><span className="font-semibold">₹{(student?.feeAmount ?? 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span className="text-emerald-600 font-semibold">₹{(student?.feePaid ?? 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Pending</span><span className="text-red-600 font-semibold">₹{pendingFee.toLocaleString()}</span></div>
              <div className="flex justify-between items-center pt-1 border-t border-border">
                <span className="text-muted-foreground">Status</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${feeColor[student?.feeStatus ?? "pending"]}`}>
                  {student?.feeStatus ?? "pending"}
                </span>
              </div>
            </div>
          </div>

          {/* Complaint Summary */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <MessageSquareWarning className="w-4 h-4 text-orange-600" />
                </div>
                <span className="font-semibold">My Complaints</span>
              </div>
              <Button size="sm" onClick={() => setShowForm(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> New
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { label: "Pending", icon: Clock, color: "text-yellow-600", status: "Pending" },
                { label: "In Progress", icon: Loader2, color: "text-blue-600", status: "In Progress" },
                { label: "Resolved", icon: CheckCircle2, color: "text-emerald-600", status: "Resolved" },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                    <span className="text-muted-foreground">{s.label}</span>
                  </div>
                  <span className="font-semibold">{complaints.filter(c => c.status === s.status).length}</span>
                </div>
              ))}
              {complaints.length === 0 && (
                <p className="text-xs text-muted-foreground text-center pt-2">No complaints raised yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Complaint History */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-sm">Complaint History</h3>
              <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Raise Complaint
              </Button>
            </div>
            {complaints.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <MessageSquareWarning className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No complaints raised yet.</p>
                <Button size="sm" variant="link" onClick={() => setShowForm(true)}>Raise your first complaint</Button>
              </div>
            ) : (
              <div className="divide-y divide-border max-h-72 overflow-y-auto">
                {complaints.map(c => (
                  <div key={c._id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{(c as any).title || "General Complaint"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.complaint}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColor[c.status]}`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notice Board */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Notice Board</h3>
              <span className="ml-auto text-xs text-muted-foreground">{notices.length} notices</span>
            </div>
            {notices.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notices posted yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border max-h-72 overflow-y-auto">
                {notices.map(n => (
                  <div key={n._id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(n.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          {n.postedBy && ` · ${n.postedBy}`}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 shrink-0">{n.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Raise Complaint Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Raise a Complaint</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
              <Input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Water Leakage, Fan Not Working..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description *</label>
              <Textarea
                value={form.complaint}
                onChange={e => setForm(f => ({ ...f, complaint: e.target.value }))}
                placeholder="Describe your complaint in detail..."
                rows={4}
              />
            </div>
            {student && (
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                Submitting as: <span className="font-medium text-foreground">{student.name}</span> · Room <span className="font-mono font-medium">{student.roomNo}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={submitComplaint} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Complaint"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
