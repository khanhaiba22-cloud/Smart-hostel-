import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { attendanceApi, AttendanceRecord, AttendanceSummary, AttendanceStatus } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, RefreshCw, Search, CheckCircle2, XCircle, Clock, CalendarDays, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: AttendanceStatus[] = ["Present", "Absent", "Late", "On Leave"];

const statusStyle: Record<AttendanceStatus, string> = {
  Present:    "bg-emerald-100 text-emerald-700 border-emerald-200",
  Absent:     "bg-red-100 text-red-700 border-red-200",
  Late:       "bg-yellow-100 text-yellow-700 border-yellow-200",
  "On Leave": "bg-blue-100 text-blue-700 border-blue-200",
};

const statusIcon: Record<AttendanceStatus, typeof CheckCircle2> = {
  Present:    CheckCircle2,
  Absent:     XCircle,
  Late:       Clock,
  "On Leave": CalendarDays,
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AttendancePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [date, setDate] = useState(todayISO());
  const [students, setStudents] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [dirty, setDirty] = useState(false);

  // local status map: studentId -> status
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({});

  const load = useCallback(async (d: string) => {
    setLoading(true);
    setDirty(false);
    try {
      const res = await attendanceApi.getByDate(d);
      const rows = res.data.students;
      setStudents(rows);
      setSummary(res.data.summary);
      // init status map
      const map: Record<string, AttendanceStatus> = {};
      for (const r of rows) map[String((r as any).id ?? r.studentId)] = r.status;
      setStatusMap(map);
    } catch (e: unknown) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(date); }, [date, load]);

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setStatusMap(m => ({ ...m, [studentId]: status }));
    setDirty(true);
  };

  // Mark all as Present
  const markAll = (status: AttendanceStatus) => {
    const map: Record<string, AttendanceStatus> = {};
    for (const s of students) map[String((s as any).id ?? s.studentId)] = status;
    setStatusMap(map);
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const records = students.map(s => ({
        studentId: (s as any).id ?? s.studentId,
        status: statusMap[String((s as any).id ?? s.studentId)] ?? "Absent",
      }));
      const res = await attendanceApi.saveBulk(date, records);
      setSummary(res.data.summary);
      setDirty(false);
      toast({ title: "Saved", description: `Attendance for ${date} saved successfully.` });
    } catch (e: unknown) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.roomNo?.toLowerCase().includes(search.toLowerCase())
  );

  const isToday = date === todayISO();

  return (
    <DashboardLayout title="Attendance">
      <div className="space-y-4">

        {/* Header controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              value={date}
              max={todayISO()}
              onChange={e => setDate(e.target.value)}
              className="w-40 h-9 text-sm"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name or room..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 w-52 text-sm"
            />
          </div>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={() => load(date)} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
            {isToday && (
              <>
                <Button variant="outline" size="sm" onClick={() => markAll("Present")} className="gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All Present
                </Button>
                <Button variant="outline" size="sm" onClick={() => markAll("Absent")} className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
                  <XCircle className="w-3.5 h-3.5" /> All Absent
                </Button>
              </>
            )}
            {isToday && dirty && (
              <Button size="sm" onClick={save} disabled={saving} className="gap-1.5">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Attendance
              </Button>
            )}
          </div>
        </div>

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Present",  value: summary.present,  color: "text-emerald-600", bg: "bg-emerald-50",  icon: CheckCircle2 },
              { label: "Absent",   value: summary.absent,   color: "text-red-600",     bg: "bg-red-50",      icon: XCircle },
              { label: "Late",     value: summary.late,     color: "text-yellow-600",  bg: "bg-yellow-50",   icon: Clock },
              { label: "On Leave", value: summary.onLeave,  color: "text-blue-600",    bg: "bg-blue-50",     icon: CalendarDays },
            ].map(s => (
              <div key={s.label} className={`rounded-xl border border-border p-4 ${s.bg}`}>
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {summary.total > 0 ? Math.round((s.value / summary.total) * 100) : 0}%
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Not marked banner */}
        {!loading && summary && summary.marked === 0 && isToday && (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700 flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            Attendance not marked yet for today. Mark and save below.
          </div>
        )}

        {/* Student list */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {filtered.length} student{filtered.length !== 1 ? "s" : ""}
              {search && ` matching "${search}"`}
            </span>
            {!isToday && (
              <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                View only — past date
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No students found.</div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(s => {
                const sid = String((s as any).id ?? s.studentId);
                const current = statusMap[sid] ?? "Absent";
                const Icon = statusIcon[current];
                return (
                  <div key={sid} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {s.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Room {s.roomNo || "—"} · {s.branch} · {s.year}
                      </p>
                    </div>

                    {/* Status badge (view mode for past dates) */}
                    {!isToday ? (
                      <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium border", statusStyle[current])}>
                        <Icon className="w-3 h-3 inline mr-1" />{current}
                      </span>
                    ) : (
                      /* Toggle buttons for today */
                      <div className="flex gap-1">
                        {STATUS_OPTIONS.map(opt => {
                          const Ic = statusIcon[opt];
                          return (
                            <button
                              key={opt}
                              onClick={() => setStatus(sid, opt)}
                              className={cn(
                                "text-xs px-2.5 py-1 rounded-full font-medium border transition-all",
                                current === opt
                                  ? statusStyle[opt]
                                  : "bg-background text-muted-foreground border-border hover:border-primary/30"
                              )}
                            >
                              <Ic className="w-3 h-3 inline mr-1" />
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticky save bar */}
        {isToday && dirty && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-foreground text-background rounded-xl px-5 py-3 shadow-lg flex items-center gap-4">
              <span className="text-sm font-medium">Unsaved changes</span>
              <Button size="sm" variant="secondary" onClick={save} disabled={saving} className="gap-1.5">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
