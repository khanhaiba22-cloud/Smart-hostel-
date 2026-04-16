import { useEffect, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { noticesApi, Notice } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function NoticesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", type: "General" });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    noticesApi.getAll(50)
      .then(res => setNotices(res.data?.notices ?? []))
      .catch((e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.title || !form.description)
      return toast({ title: "Required", description: "Title and description are required.", variant: "destructive" });
    setSubmitting(true);
    try {
      await noticesApi.create({ ...form, postedBy: user?.name });
      toast({ title: "Posted!", description: "Notice has been posted." });
      setShowForm(false);
      setForm({ title: "", description: "", type: "General" });
      load();
    } catch (e: unknown) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await noticesApi.delete(id);
      toast({ title: "Deleted" });
      load();
    } catch (e: unknown) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="Notices">
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{notices.length} notices</span>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" /> Post Notice
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No notices posted yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {notices.map(n => (
              <div key={n._id} className="p-4 hover:bg-muted/30 transition-colors flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{n.title}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{n.type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{n.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(n.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {n.postedBy && ` · ${n.postedBy}`}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => remove(n._id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Post a Notice</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Notice title..." />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
              <select
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              >
                {["General", "Announcement", "Food Menu", "Maintenance"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description *</label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} placeholder="Notice details..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={submit} disabled={submitting}>{submitting ? "Posting..." : "Post Notice"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
