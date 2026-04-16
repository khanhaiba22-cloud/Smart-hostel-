import { Bell, ChevronDown, LogOut, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const roleGradient: Record<string, string> = {
  owner:   "from-violet-500 via-purple-500 to-fuchsia-500",
  rector:  "from-blue-500 via-cyan-500 to-teal-400",
  student: "from-emerald-400 via-teal-500 to-cyan-500",
};

export function TopNavbar({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";
  const gradient = roleGradient[user?.role ?? "student"];

  return (
    <header className="h-14 border-b border-border bg-white/80 backdrop-blur-xl flex items-center justify-between px-5 shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all" />
        <div className="h-4 w-px bg-border" />
        <h1 className="text-sm font-bold text-foreground tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Bell */}
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full pulse-dot" />
        </button>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2.5 h-9 rounded-xl hover:bg-muted transition-all">
              <div className={cn("w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-[11px] font-bold shadow-sm", gradient)}>
                {initials}
              </div>
              <span className="text-sm font-semibold text-foreground hidden sm:inline max-w-[100px] truncate">{user?.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-card-hover border-border p-1.5">
            <DropdownMenuLabel className="pb-2 px-2">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold shadow", gradient)}>
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-xl gap-2 cursor-pointer">
              <User className="w-4 h-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-xl text-red-500 focus:text-red-500 focus:bg-red-50 cursor-pointer gap-2" onClick={logout}>
              <LogOut className="w-4 h-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
