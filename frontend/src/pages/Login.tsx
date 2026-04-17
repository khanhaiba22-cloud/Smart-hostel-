import { useState } from "react";
import { Building2, User, Lock, Eye, EyeOff, GraduationCap, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

type Role = "owner" | "rector" | "student";

const roles: { key: Role; label: string; icon: typeof Building2; email: string; password: string; gradient: string; color: string }[] = [
  { key: "owner",   label: "Owner",   icon: Building2,     email: "ambar@gmail.com",        password: "1234",    gradient: "from-violet-500 to-indigo-600", color: "violet" },
  { key: "rector",  label: "Rector",  icon: User,          email: "riya@gmail.com",          password: "1234",    gradient: "from-blue-500 to-cyan-500",     color: "blue" },
  { key: "student", label: "Student", icon: GraduationCap, email: "aarti.sharma@hostel.com", password: "pass123", gradient: "from-emerald-500 to-teal-500",  color: "emerald" },
];

const stats = [
  { value: "100+", label: "Students" },
  { value: "120",  label: "Rooms" },
  { value: "24/7", label: "Support" },
];

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail]               = useState("ambar@gmail.com");
  const [password, setPassword]         = useState("1234");
  const [selectedRole, setSelectedRole] = useState<Role>("owner");
  const [error, setError]               = useState("");
  const { login, isLoading }            = useAuth();

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setError("");
    const r = roles.find(r => r.key === role);
    if (r) { setEmail(r.email); setPassword(r.password); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter your email and password."); return; }
    try { await login(email, password); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Login failed."); }
  };

  const active = roles.find(r => r.key === selectedRole)!;

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ── Left: Branding panel ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[hsl(226,48%,11%)] items-center justify-center p-12">
        {/* Animated blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-blob delay-300" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-blob delay-500" />

        {/* Spinning ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full border border-white/5 animate-spin-slow" />
          <div className="absolute w-[380px] h-[380px] rounded-full border border-white/5 animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "18s" }} />
        </div>

        <div className="relative z-10 text-center max-w-sm">
          {/* Logo */}
          <div className="animate-float mb-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto shadow-2xl glow-primary">
              <Building2 className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-4 animate-fade-up">
            Smart<br />
            <span className="text-gradient">Hostel</span>
          </h1>
          <p className="text-blue-200/60 text-base leading-relaxed animate-fade-up delay-100">
            Modern hostel management — students, rooms, fees & complaints, all in one beautiful dashboard.
          </p>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 gap-3 animate-fade-up delay-200">
            {stats.map((s, i) => (
              <div key={s.label} className={cn("bg-white/5 rounded-2xl p-4 border border-white/8 backdrop-blur-sm", `delay-${(i + 2) * 100}`)}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-blue-200/50 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Role pills */}
          <div className="mt-8 flex items-center justify-center gap-2 animate-fade-up delay-300">
            {roles.map(r => (
              <div key={r.key} className={cn("text-xs px-3 py-1.5 rounded-full font-medium bg-gradient-to-r text-white opacity-70", r.gradient)}>
                {r.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-mesh">
        <div className="w-full max-w-md animate-scale-in">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8 animate-fade-up">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gradient">Smart Hostel</h1>
          </div>

          <div className="bg-card rounded-3xl border border-border shadow-card-hover p-8 space-y-6">
            {/* Header */}
            <div className="animate-fade-up">
              <h2 className="text-2xl font-bold text-foreground">Welcome back 👋</h2>
              <p className="text-sm text-muted-foreground mt-1">Sign in to continue to your dashboard</p>
            </div>

            {/* Role selector */}
            <div className="space-y-2 animate-fade-up delay-75">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Login as</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(role => (
                  <button
                    key={role.key}
                    type="button"
                    onClick={() => handleRoleSelect(role.key)}
                    className={cn(
                      "relative flex flex-col items-center gap-2 p-3.5 rounded-2xl border-2 transition-all duration-200 text-sm font-semibold overflow-hidden",
                      selectedRole === role.key
                        ? "border-transparent text-white shadow-lg scale-[1.02]"
                        : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:scale-[1.01]"
                    )}
                    style={selectedRole === role.key ? {
                      background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                    } : {}}
                  >
                    {selectedRole === role.key && (
                      <div className={cn("absolute inset-0 bg-gradient-to-br", role.gradient)} />
                    )}
                    <div className={cn(
                      "relative z-10 w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                      selectedRole === role.key ? "bg-white/20" : "bg-muted"
                    )}>
                      <role.icon className={cn("w-4 h-4", selectedRole === role.key ? "text-white" : "text-muted-foreground")} />
                    </div>
                    <span className="relative z-10">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Demo hint */}
            <div className="flex items-center gap-2.5 rounded-2xl bg-primary/6 border border-primary/12 px-4 py-3 animate-fade-up delay-100">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs text-muted-foreground">
                Demo credentials auto-filled for <span className="font-semibold text-foreground">{active.label}</span>
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-up delay-150">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Email</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl bg-muted/50 border-border focus:bg-background transition-all"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10 pr-11 h-12 rounded-xl bg-muted/50 border-border focus:bg-background transition-all"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-destructive/8 border border-destructive/20 text-destructive px-4 py-3 text-sm animate-scale-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full h-12 rounded-xl text-sm font-bold text-white transition-all duration-200",
                  "bg-gradient-to-r shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]",
                  "disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100",
                  "flex items-center justify-center gap-2",
                  active.gradient
                )}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In as {active.label}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
