import { useEffect, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { studentsApi, feeStructureApi, Student, FeeStructureEntry } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Pencil, IndianRupee, AlertCircle, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const feeColor: Record<string, string> = {
  paid:    "bg-emerald-100 text-emerald-700",
  pending: "bg-red-100 text-red-700",
  partial: "bg-yellow-100 text-yellow-700",
};

const COURSES = ["Engineering", "Diploma"];
const YEARS   = ["1st Year", "2nd Year", "3rd Year"];

export default function FeesPage() {
  const { toast } = useToast();

  // ── All fees state ──────────────────────────────────────────
  const [students, setStudents]     = useState<Student[]>([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ── Pending fees state ──────────────────────────────────────
  const [pending, setPending]           = useState<Student[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);

  // ── Fee structure state ─────────────────────────────────────
  const [structure, setStructure]       = useState<FeeStructureEntry[]>([]);
  const [structureLoading, setStructureLoading] = useState(true);
  const [editEntry, setEditEntry]       = useState<{ course: string; year: string; amount: string } | null>(null);
  const [savingStructure, setSavingStructure] = useState(false);

  // ── Edit fee dialog ─────────────────────────────────────────
  const [editTarget, setEditTarget] = useState<Student | null>(null);
  const [feeForm, setFeeForm]       = useState({ feeAmount: "", feePaid: "", feeStatus: "pending" });
  const [saving, setSaving]         = useState(false);

  // ── Loaders ─────────────────────────────────────────────────
  const loadAll = (p = 1) => {
    setLoading(true);
    studentsApi.getAll({ page: p, limit: 20 })
      .then(res => { setStudents(res.data ?? []); setTotalPages(res.pagination?.totalPages ?? 1); setPage(p); })
      .catch((e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  const loadPending = () => {
    setPendingLoading(true);
    // fetch all, filter pending+partial client side (small dataset)
    studentsApi.getAll({ limit: 200 })
      .then(res => setPending((res.data ?? []).filter(s => s.feeStatus !== "paid")))
      .catch((e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }))
      .finally(() => setPendingLoading(false));
  };

  const loadStructure = () => {
    setStructureLoading(true);
    feeStructureApi.getAll()
      .then(res => setStructure(res.data ?? []))
      .catch((e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }))
      .finally(() => setStructureLoading(false));
  };

  useEffect(() => { loadAll(); loadPending(); loadStructure(); }, []);

  // ── Edit fee ────────────────────────────────────────────────
  const openEdit = (s: Student) => {
    setEditTarget(s);
    setFeeForm({ feeAmount: String(s.feeAmount ?? 0), feePaid: String(s.feePaid ?? 0), feeStatus: s.feeStatus ?? "pending" });
  };

  const saveFee = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await studentsApi.update(editTarget._id, {
        feeAmount: Number(feeForm.feeAmount),
        feePaid:   Number(feeForm.feePaid),
        feeStatus: feeForm.feeStatus as Student["feeStatus"],
      });
      toast({ title: "Updated", description: "Fee record updated." });
      setEditTarget(null);
      loadAll(page); loadPending();
    } catch (e: unknown) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  // ── Save fee structure ──────────────────────────────────────
  const saveStructure = async () => {
    if (!editEntry) return;
    setSavingStructure(true);
    try {
      await feeStructureApi.update(editEntry.course, editEntry.year, Number(editEntry.amount));
      toast({ title: "Saved", description: `Fee for ${editEntry.course} ${editEntry.year} updated.` });
      setEditEntry(null);
      loadStructure();
    } catch (e: unknown) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally { setSavingStructure(false); }
  };

  // ── Summary (all students page) ─────────────────────────────
  const totalFees    = students.reduce((s, st) => s + (st.feeAmount ?? 0), 0);
  const totalPaid    = students.reduce((s, st) => s + (st.feePaid ?? 0), 0);
  const totalPending = totalFees - totalPaid;

  const pendingAmt = pending.reduce((s, st) => s + ((st.feeAmount ?? 0) - (st.feePaid ?? 0)), 0);

  const FeeTable = ({ rows, onEdit }: { rows: Student[]; onEdit: (s: Student) => void }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Room</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total Fee</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Paid</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Due</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(s => (
            <tr key={s._id} className="border-t border-border hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-medium">{s.name}</td>
              <td className="px-4 py-3 font-mono">{s.roomNo || "—"}</td>
              <td className="px-4 py-3">₹{(s.feeAmount ?? 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-emerald-600 font-medium">₹{(s.feePaid ?? 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-red-600 font-medium">₹{((s.feeAmount ?? 0) - (s.feePaid ?? 0)).toLocaleString()}</td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${feeColor[s.feeStatus] ?? feeColor.pending}`}>
                  {s.feeStatus ?? "pending"}
                </span>
              </td>
              <td className="px-4 py-3">
                <Button variant="ghost" size="sm" onClick={() => onEdit(s)} className="h-7 gap-1 text-xs">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No records found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <DashboardLayout title="Fees">
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Fees</TabsTrigger>
          <TabsTrigger value="pending" className="gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Pending Fees
            {pending.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pending.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="structure" className="gap-1.5">
            <Settings2 className="w-3.5 h-3.5" /> Fee Structure
          </TabsTrigger>
        </TabsList>

        {/* ── ALL FEES ── */}
        <TabsContent value="all">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: "Total Fees",  value: `₹${totalFees.toLocaleString()}`,    color: "text-foreground" },
              { label: "Collected",   value: `₹${totalPaid.toLocaleString()}`,     color: "text-emerald-600" },
              { label: "Outstanding", value: `₹${totalPending.toLocaleString()}`,  color: "text-red-600" },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4 shadow-card">
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
              </div>
            ) : <FeeTable rows={students} onEdit={openEdit} />}
            {totalPages > 1 && (
              <div className="p-4 border-t border-border flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => loadAll(page - 1)}>Prev</Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => loadAll(page + 1)}>Next</Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── PENDING FEES ── */}
        <TabsContent value="pending">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-card border border-border rounded-xl p-4 shadow-card">
              <p className="text-xs text-muted-foreground mb-1">Students with Dues</p>
              <p className="text-xl font-bold text-red-600">{pending.length}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 shadow-card">
              <p className="text-xs text-muted-foreground mb-1">Total Outstanding</p>
              <p className="text-xl font-bold text-red-600">₹{pendingAmt.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            {pendingLoading ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
              </div>
            ) : <FeeTable rows={pending} onEdit={openEdit} />}
          </div>
        </TabsContent>

        {/* ── FEE STRUCTURE ── */}
        <TabsContent value="structure">
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Fee Structure</p>
                <p className="text-xs text-muted-foreground mt-0.5">Set default fee amounts per course and year</p>
              </div>
            </div>
            {structureLoading ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Course</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Year</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fee Amount</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COURSES.flatMap(course => YEARS.map(year => {
                      const entry = structure.find(e => e.course === course && e.year === year);
                      return (
                        <tr key={`${course}-${year}`} className="border-t border-border hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{course}</td>
                          <td className="px-4 py-3">{year}</td>
                          <td className="px-4 py-3 font-semibold">
                            {entry ? `₹${entry.amount.toLocaleString()}` : <span className="text-muted-foreground">Not set</span>}
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              variant="ghost" size="sm"
                              className="h-7 gap-1 text-xs"
                              onClick={() => setEditEntry({ course, year, amount: String(entry?.amount ?? 50000) })}
                            >
                              <Pencil className="w-3.5 h-3.5" /> {entry ? "Edit" : "Set"}
                            </Button>
                          </td>
                        </tr>
                      );
                    }))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Fee Dialog */}
      <Dialog open={!!editTarget} onOpenChange={v => !v && setEditTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4" /> Update Fee — {editTarget?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Total Fee Amount (₹)</label>
              <Input type="number" value={feeForm.feeAmount} onChange={e => setFeeForm(f => ({ ...f, feeAmount: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Amount Paid (₹)</label>
              <Input type="number" value={feeForm.feePaid} onChange={e => setFeeForm(f => ({ ...f, feePaid: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Fee Status</label>
              <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={feeForm.feeStatus} onChange={e => setFeeForm(f => ({ ...f, feeStatus: e.target.value }))}>
                {["paid", "pending", "partial"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={saveFee} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" />Saving...</> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Fee Structure Dialog */}
      <Dialog open={!!editEntry} onOpenChange={v => !v && setEditEntry(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="w-4 h-4" /> Set Fee — {editEntry?.course} {editEntry?.year}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Fee Amount (₹)</label>
            <Input
              type="number"
              value={editEntry?.amount ?? ""}
              onChange={e => setEditEntry(f => f ? { ...f, amount: e.target.value } : f)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEntry(null)}>Cancel</Button>
            <Button onClick={saveStructure} disabled={savingStructure}>
              {savingStructure ? <><Loader2 className="w-4 h-4 animate-spin mr-1" />Saving...</> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
