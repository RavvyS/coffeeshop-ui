// Replace the existing src/App.tsx with this updated version

import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoader } from "@/components/LoadingStates";
import { appConfig } from "@/utils/performance";

// Lazy load pages for better performance
import { lazy } from "react";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Menu = lazy(() => import("./pages/Menu"));

// Lazy load heavy components
const AnalyticsDashboard = lazy(() => import("./components/AnalyticsDashboard").then(module => ({
  default: module.AnalyticsDashboard
})));

// Configure React Query with optimizations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 300000, // 5 minutes
      gcTime: 900000, // 15 minutes (formerly cacheTime)
      retry: appConfig.performance.retryAttempts,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: appConfig.performance.retryDelay,
    },
  },
});

// Loading fallback component
const SuspenseFallback = () => (
  <PageLoader message="Loading application..." />
);

// Route-specific loading messages
const getLoadingMessage = (path: string) => {
  switch (path) {
    case '/menu':
      return "Loading delicious menu...";
    case '/analytics':
      return "Loading analytics dashboard...";
    default:
      return "Loading...";
  }
};

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          
          <BrowserRouter>
            <Suspense fallback={<SuspenseFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route 
                  path="/menu" 
                  element={
                    <Suspense fallback={<PageLoader message="Loading delicious menu..." />}>
                      <Menu />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/analytics" 
                  element={
                    <Suspense fallback={<PageLoader message="Loading analytics dashboard..." />}>
                      <AnalyticsDashboard />
                    </Suspense>
                  } 
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;