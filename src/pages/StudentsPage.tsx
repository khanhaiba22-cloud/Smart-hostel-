import { useEffect, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { studentsApi, Student } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Loader2, Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";

const feeColor: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-red-100 text-red-700",
  partial: "bg-yellow-100 text-yellow-700",
};

const EMPTY_FORM = { name: "", email: "", roomNo: "", branch: "", year: "", phone: "", gender: "Female", password: "pass123" };

export default function StudentsPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Dialog state
  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = (p = 1, s = search) => {
    setLoading(true);
    studentsApi.getAll({ page: p, limit: 20, search: s || undefined })
      .then(res => {
        setStudents(res.data ?? []);
        setTotalPages(res.pagination?.totalPages ?? 1);
        setTotal(res.pagination?.total ?? 0);
        setPage(p);
      })
      .catch((e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditStudent(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEdit = (s: Student) => {
    setEditStudent(s);
    setForm({
      name: s.name ?? "",
      email: s.email ?? "",
      roomNo: s.roomNo ?? "",
      branch: s.branch ?? "",
      year: String(s.year ?? ""),
      phone: s.phone ?? "",
      gender: s.gender ?? "Female",
      password: "",
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name || !form.email || !form.branch || !form.year)
      return toast({ title: "Required", description: "Name, email, branch and year are required.", variant: "destructive" });
    setSaving(true);
    try {
      const payload: Partial<Student> & { password?: string } = {
        name: form.name, email: form.email, roomNo: form.roomNo,
        branch: form.branch, year: form.year, phone: form.phone,
        gender: form.gender as Student["gender"],
        ...(form.password ? { password: form.password } : {}),
      };
      if (editStudent) {
        await studentsApi.update(editStudent._id, payload);
        toast({ title: "Updated", description: `${form.name} updated successfully.` });
      } else {
        await studentsApi.create({ ...payload, password: form.password || "pass123" });
        toast({ title: "Added", description: `${form.name} added successfully.` });
      }
      setShowForm(false);
      load(page);
    } catch (e: unknown) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await studentsApi.delete(deleteTarget._id);
      toast({ title: "Deleted", description: `${deleteTarget.name} removed.` });
      setDeleteTarget(null);
      load(page);
    } catch (e: unknown) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
      <Input
        type={type}
        placeholder={placeholder || label}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <DashboardLayout title="Students">
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && load(1, search)}
            />
          </div>
          <Button variant="outline" onClick={() => load(1, search)}>Search</Button>
          <span className="text-xs text-muted-foreground ml-auto hidden sm:inline">{total} students</span>
          <Button onClick={openAdd} className="gap-1.5">
            <Plus className="w-4 h-4" /> Add Student
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
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Room</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Branch</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Year</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fee Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.email || "—"}</td>
                    <td className="px-4 py-3 font-mono">{s.roomNo || "—"}</td>
                    <td className="px-4 py-3">{s.branch}</td>
                    <td className="px-4 py-3">{s.year || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${feeColor[s.feeStatus] ?? feeColor.pending}`}>
                        {s.feeStatus ?? "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(s)} className="h-7 w-7 p-0">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(s)} className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => load(page - 1)}>Prev</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => load(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editStudent ? "Edit Student" : "Add Student"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            {field("name", "Full Name *")}
            {field("email", "Email *", "email")}
            {field("roomNo", "Room No", "text", "e.g. A-101")}
            {field("branch", "Branch *", "text", "e.g. Computer Science")}
            {field("year", "Year *", "text", "e.g. 2nd Year")}
            {field("phone", "Phone", "tel")}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Gender</label>
              <select
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                value={form.gender}
                onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
              >
                {["Female", "Male", "Other"].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            {field("password", editStudent ? "New Password (leave blank to keep)" : "Password *", "password", "password")}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Saving...</> : (editStudent ? "Save Changes" : "Add Student")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" /> Delete Student
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete <span className="font-semibold text-foreground">{deleteTarget?.name}</span>? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Deleting...</> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
