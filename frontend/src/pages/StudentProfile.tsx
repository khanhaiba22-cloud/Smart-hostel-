import { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { profileApi, Student } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Loader2, Save, User, Phone, DoorOpen, BookOpen, GraduationCap, Mail, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const BRANCHES = ["Engineering", "Diploma", "Science", "Commerce", "Arts"];
const YEARS    = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export default function StudentProfile() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [student, setStudent]   = useState<Student | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved]       = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    roomNo: "", branch: "", year: "", phone: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await profileApi.get();
      const s = res.data?.student;
      if (s) {
        setStudent(s);
        setForm({ roomNo: s.roomNo || "", branch: s.branch || "", year: String(s.year || ""), phone: s.phone || "" });
      }
    } catch (e: unknown) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await profileApi.update(form);
      if (res.data?.student) setStudent(res.data.student);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      toast({ title: "Profile Updated", description: "Your details have been saved." });
    } catch (e: unknown) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Too large", description: "Photo must be under 5MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const res = await profileApi.uploadPhoto(file);
      if (res.data?.student) setStudent(res.data.student);
      toast({ title: "Photo Updated", description: "Your profile photo has been saved." });
    } catch (e: unknown) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const photoSrc = student?.photoUrl
    ? `http://localhost:5000${student.photoUrl}`
    : null;

  const initials = student?.name
    ? student.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "S";

  if (loading) return (
    <DashboardLayout title="My Profile">
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading profile...
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="My Profile">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">

        {/* Profile card */}
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          </div>

          {/* Avatar + name */}
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-12 mb-4">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl border-4 border-card shadow-lg overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  {photoSrc ? (
                    <img src={photoSrc} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-white">{initials}</span>
                  )}
                </div>
                {/* Upload overlay */}
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  {uploading
                    ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                    : <Camera className="w-6 h-6 text-white" />}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </div>

              <div className="mb-2 flex-1 min-w-0">
                <h2 className="text-xl font-bold text-foreground truncate">{student?.name}</h2>
                <p className="text-sm text-muted-foreground">{student?.branch} · {student?.year}</p>
              </div>

              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="mb-2 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow hover:opacity-90 transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                {uploading ? "Uploading..." : "Change Photo"}
              </button>
            </div>

            {/* Read-only info */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              {[
                { icon: Mail,  label: "Email",  value: student?.email || "—" },
                { icon: User,  label: "Gender", value: "Female" },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-2.5 bg-muted/40 rounded-xl px-3 py-2.5">
                  <f.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{f.label}</p>
                    <p className="text-sm font-semibold truncate">{f.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h3 className="text-base font-bold mb-5 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            Edit Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Room No */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <DoorOpen className="w-3.5 h-3.5" /> Room Number
              </label>
              <Input
                value={form.roomNo}
                onChange={e => setForm(f => ({ ...f, roomNo: e.target.value }))}
                placeholder="e.g. A101"
                className="h-11 rounded-xl"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Phone Number
              </label>
              <Input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="e.g. 9876543210"
                type="tel"
                className="h-11 rounded-xl"
              />
            </div>

            {/* Branch / Department */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Department
              </label>
              <select
                value={form.branch}
                onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select department</option>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Year */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" /> Year
              </label>
              <select
                value={form.year}
                onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all",
                "bg-gradient-to-r from-emerald-400 to-teal-500 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95",
                saving && "opacity-70 cursor-not-allowed"
              )}
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                : saved
                ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
            <p className="text-xs text-muted-foreground">Only room, department, year and phone can be updated.</p>
          </div>
        </div>

        {/* Fee info (read-only) */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h3 className="text-base font-bold mb-4 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">₹</span>
            </div>
            Fee Summary
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Fee",  value: `₹${(student?.feeAmount ?? 0).toLocaleString()}`, color: "text-foreground" },
              { label: "Paid",       value: `₹${(student?.feePaid ?? 0).toLocaleString()}`,   color: "text-emerald-600" },
              { label: "Pending",    value: `₹${((student?.feeAmount ?? 0) - (student?.feePaid ?? 0)).toLocaleString()}`, color: "text-red-500" },
            ].map(s => (
              <div key={s.label} className="bg-muted/40 rounded-xl p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{s.label}</p>
                <p className={cn("text-lg font-bold", s.color)}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className={cn("px-3 py-1 rounded-full text-xs font-bold capitalize",
              student?.feeStatus === "paid" ? "bg-emerald-100 text-emerald-700" :
              student?.feeStatus === "partial" ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-700"
            )}>
              {student?.feeStatus ?? "pending"}
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
