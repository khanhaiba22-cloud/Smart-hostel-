import { useEffect, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { getToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Room {
  id: number;
  room_no: string;
  capacity: number;
  occupied: number;
  floor: string;
  type: string;
  status: string;
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function RoomsPage() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/rooms`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(res => setRooms(res.data ?? []))
      .catch((e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const statusColor: Record<string, string> = {
    available: "bg-emerald-100 text-emerald-700",
    full: "bg-red-100 text-red-700",
    maintenance: "bg-yellow-100 text-yellow-700",
  };

  return (
    <DashboardLayout title="Rooms">
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Room No</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Floor</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Capacity</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Occupied</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(r => (
                  <tr key={r.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold">{r.room_no}</td>
                    <td className="px-4 py-3">{r.floor}</td>
                    <td className="px-4 py-3">{r.type}</td>
                    <td className="px-4 py-3">{r.capacity}</td>
                    <td className="px-4 py-3">{r.occupied}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColor[r.status] ?? statusColor.available}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {rooms.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No rooms found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
