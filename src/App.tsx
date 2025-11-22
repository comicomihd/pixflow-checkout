import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Checkouts from "./pages/Checkouts";
import CheckoutEditor from "./pages/CheckoutEditor";
import Sales from "./pages/Sales";
import Checkout from "./pages/Checkout";
import Upsell from "./pages/Upsell";
import Downsell from "./pages/Downsell";
import ThankYou from "./pages/ThankYou";
import Presells from "./pages/Presells";
import Delivery from "./pages/Delivery";
import Webhooks from "./pages/Webhooks";
import ErrorLogs from "./pages/ErrorLogs";
import Analytics from "./pages/Analytics";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ErrorBoundary>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/c/:slug" element={<Checkout />} />
          <Route path="/upsell" element={<Upsell />} />
          <Route path="/downsell" element={<Downsell />} />
          <Route path="/obrigado" element={<ThankYou />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkouts"
            element={
              <ProtectedRoute>
                <Checkouts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkouts/:id/edit"
            element={
              <ProtectedRoute>
                <CheckoutEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <Sales />
              </ProtectedRoute>
            }
          />
          <Route
            path="/presells"
            element={
              <ProtectedRoute>
                <Presells />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery"
            element={
              <ProtectedRoute>
                <Delivery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/webhooks"
            element={
              <ProtectedRoute>
                <Webhooks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/error-logs"
            element={
              <ProtectedRoute>
                <ErrorLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ErrorBoundary>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
