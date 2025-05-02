
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Main Layout and Pages
import Sidebar from "./components/Sidebar";
import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import FinancialDetails from "./pages/FinancialDetails";
import ProtectedRoute from "./components/ProtectedRoute";

// Create ProfilePage and SettingsPage components
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

// Main Layout with Sidebar
const MainLayout = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-64 p-6">
        <div className="container mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes with sidebar layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/expense-tracker" element={<Navigate to="/" replace />} />
                <Route path="/investment" element={<Navigate to="/" replace />} />
                <Route path="/tax" element={<Navigate to="/" replace />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              
              {/* Full-width protected routes (no sidebar) */}
              <Route path="/financial-details" element={<FinancialDetails />} />
            </Route>
            
            {/* Redirect root to landing page for non-authenticated users */}
            <Route path="/" element={<Navigate to="/landing" replace />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
