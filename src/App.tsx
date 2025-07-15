import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import Events from "./pages/Events";
import Admin from "./pages/Admin";
import AuthPage from "./components/auth/AuthPage";
import NotFound from "./pages/NotFound";
import CommunityBuilding from "./pages/CommunityBuilding";
import Education from "./pages/Education";
import SocialAction from "./pages/SocialAction";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/events" element={<Events />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/community-building" element={<CommunityBuilding />} />
          <Route path="/education" element={<Education />} />
          <Route path="/social-action" element={<SocialAction />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
