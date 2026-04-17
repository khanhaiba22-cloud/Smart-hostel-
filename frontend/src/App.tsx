import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import OwnerDashboard from "./pages/OwnerDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import WardenDashboard from "./pages/WardenDashboard";
import StudentsPage from "./pages/StudentsPage";
import RoomsPage from "./pages/RoomsPage";
import FeesPage from "./pages/FeesPage";
import ComplaintsPage from "./pages/ComplaintsPage";
import NoticesPage from "./pages/NoticesPage";
import AttendancePage from "./pages/AttendancePage";
import StudentProfile from "./pages/StudentProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/owner"    element={<ProtectedRoute roles={['owner']}><OwnerDashboard /></ProtectedRoute>} />
            <Route path="/rector"   element={<ProtectedRoute roles={['rector']}><WardenDashboard /></ProtectedRoute>} />
            <Route path="/student"  element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/profile"  element={<ProtectedRoute roles={['student']}><StudentProfile /></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute roles={['owner']}><StudentsPage /></ProtectedRoute>} />
            <Route path="/rooms"    element={<ProtectedRoute roles={['owner']}><RoomsPage /></ProtectedRoute>} />
            <Route path="/fees"     element={<ProtectedRoute roles={['owner']}><FeesPage /></ProtectedRoute>} />
            <Route path="/complaints" element={<ProtectedRoute roles={['owner','rector']}><ComplaintsPage /></ProtectedRoute>} />
            <Route path="/notices"  element={<ProtectedRoute roles={['owner','rector']}><NoticesPage /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute roles={['owner','rector']}><AttendancePage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
