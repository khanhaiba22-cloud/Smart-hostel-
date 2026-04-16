import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  gradient: string;       // e.g. "from-violet-500 to-purple-600"
  iconBg?: string;
  onClick?: () => void;
  delay?: number;
}

export function StatCard({ title, value, description, icon: Icon, gradient, iconBg, onClick, delay = 0 }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
      className={cn(
        "relative rounded-2xl overflow-hidden animate-fade-up",
        "bg-gradient-to-br text-white shadow-lg transition-all duration-300",
        gradient,
        onClick && "cursor-pointer hover:-translate-y-1.5 hover:shadow-xl active:scale-[0.98]"
      )}
    >
      {/* Decorative circle */}
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full bg-white/8" />

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm", iconBg)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/70 text-right leading-tight">{title}</p>
        </div>
        <p className="text-3xl font-extrabold text-white leading-none">{value}</p>
        {description && <p className="text-xs text-white/70 mt-1.5 font-medium">{description}</p>}
      </div>
    </div>
  );
}
