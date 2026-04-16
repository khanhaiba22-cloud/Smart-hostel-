import { useEffect, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { complaintsApi, Complaint } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, CheckCircle } from "lucide-react";

const statusVariant = {
  Pending: "pending" as const,
  "In Progress": "progress" as const,
  Resolved: "resolved" as const,
};

export default function ComplaintsPage() {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    complaintsApi.getAll({ limit: 100 })
      .then(res => setComplaints(res.data ?? []))
      .catch((e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdvance = async (c: Complaint) => {
    setResolvingId(c._id);
    try {
      const next = c.status === "Pending" ? "In Progress" : "Resolved";
      await complaintsApi.updateStatus(c._id, next);
      toast({ title: "Updated", description: `Marked as "${next}"` });
      load();
    } catch (e: unknown) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <DashboardLayout title="Complaints">
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{complaints.length} total complaints</span>
          <Button variant="outline" size="sm" onClick={load} className="gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Room</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Complaint</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c._id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{c.studentName}</td>
                    <td className="px-4 py-3 font-mono">{c.roomNo}</td>
                    <td className="px-4 py-3">{(c as any).title || "—"}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground">{c.complaint}</td>
                    <td className="px-4 py-3"><Badge variant={statusVariant[c.status]}>{c.status}</Badge></td>
                    <td className="px-4 py-3">
                      {c.status !== "Resolved" && (
                        <Button
                          variant="ghost" size="sm"
                          className="gap-1 text-xs text-emerald-600"
                          disabled={resolvingId === c._id}
                          onClick={() => handleAdvance(c)}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {c.status === "Pending" ? "Start" : "Resolve"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {complaints.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No complaints found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
