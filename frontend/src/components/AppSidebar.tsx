import {
  LayoutDashboard, Users, DoorOpen, IndianRupee,
  MessageSquareWarning, Megaphone, LogOut, ClipboardList, Sparkles, UserCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const ownerNav = [
  { title: "Dashboard",  url: "/owner",      icon: LayoutDashboard },
  { title: "Students",   url: "/students",   icon: Users },
  { title: "Rooms",      url: "/rooms",      icon: DoorOpen },
  { title: "Fees",       url: "/fees",       icon: IndianRupee },
  { title: "Complaints", url: "/complaints", icon: MessageSquareWarning },
  { title: "Notices",    url: "/notices",    icon: Megaphone },
];
const rectNav = [
  { title: "Dashboard",  url: "/rector",     icon: LayoutDashboard },
  { title: "Attendance", url: "/attendance", icon: ClipboardList },
  { title: "Complaints", url: "/complaints", icon: MessageSquareWarning },
  { title: "Notices",    url: "/notices",    icon: Megaphone },
];
const studentNav = [
  { title: "Dashboard", url: "/student", icon: LayoutDashboard },
  { title: "My Profile", url: "/profile", icon: UserCircle },
];

const roleConfig = {
  owner:   { label: "Owner Panel",   gradient: "from-violet-500 via-purple-500 to-fuchsia-500", dot: "bg-violet-400" },
  rector:  { label: "Rector Panel",  gradient: "from-blue-500 via-cyan-500 to-teal-400",        dot: "bg-cyan-400" },
  student: { label: "Student Panel", gradient: "from-emerald-400 via-teal-500 to-cyan-500",     dot: "bg-emerald-400" },
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();

  const role     = (user?.role ?? "student") as keyof typeof roleConfig;
  const navItems = role === "owner" ? ownerNav : role === "rector" ? rectNav : studentNav;
  const config   = roleConfig[role];
  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="flex flex-col h-full bg-[hsl(var(--sidebar-background))] relative overflow-hidden">

        {/* Decorative blobs */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none animate-blob" />
        <div className="absolute -bottom-16 -right-8 w-40 h-40 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none animate-blob delay-300" />

        {/* Header */}
        <SidebarHeader className="relative z-10 p-4 border-b border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center gap-3">
            <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-lg", config.gradient)}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0 animate-fade-in">
                <p className="font-bold text-sm text-white">Smart Hostel</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", config.dot)} />
                  <p className="text-[11px] text-[hsl(var(--sidebar-foreground))] truncate">{config.label}</p>
                </div>
              </div>
            )}
          </div>
        </SidebarHeader>

        {/* Nav */}
        <SidebarContent className="relative z-10 flex-1 py-4 px-2.5 overflow-y-auto">
          <SidebarGroup>
            {!collapsed && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--sidebar-foreground))/40] px-2 mb-3">Menu</p>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {navItems.map((item, i) => {
                  const active = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <button
                        onClick={() => navigate(item.url)}
                        title={collapsed ? item.title : undefined}
                        style={{ animationDelay: `${i * 60}ms` }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 animate-slide-left",
                          active
                            ? "nav-active text-white"
                            : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-white"
                        )}
                      >
                        <item.icon className={cn("w-4 h-4 shrink-0 transition-all duration-200", active && "scale-110 drop-shadow-sm")} />
                        {!collapsed && <span>{item.title}</span>}
                        {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
                      </button>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="relative z-10 p-3 border-t border-[hsl(var(--sidebar-border))]">
          {!collapsed && user && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 mb-2 rounded-xl bg-[hsl(var(--sidebar-accent))] border border-white/5">
              <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold shadow", config.gradient)}>
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-[hsl(var(--sidebar-foreground))] truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            title={collapsed ? "Logout" : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
