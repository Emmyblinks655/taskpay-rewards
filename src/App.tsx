import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import FreeAccounts from "./pages/FreeAccounts";
import Payout from "./pages/Payout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminSubmissions from "./pages/admin/AdminSubmissions";
import AdminPayouts from "./pages/admin/AdminPayouts";
import AdminAccounts from "./pages/admin/AdminAccounts";
import AdminAds from "./pages/admin/AdminAds";
import NotFound from "./pages/NotFound";
import NotAuthorized from "./pages/NotAuthorized";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/free-accounts" element={<FreeAccounts />} />
            <Route path="/payout" element={<Payout />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/tasks" element={<AdminTasks />} />
            <Route path="/admin/submissions" element={<AdminSubmissions />} />
            <Route path="/admin/payouts" element={<AdminPayouts />} />
            <Route path="/admin/accounts" element={<AdminAccounts />} />
            <Route path="/admin/ads" element={<AdminAds />} />
            <Route path="/not-authorized" element={<NotAuthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
