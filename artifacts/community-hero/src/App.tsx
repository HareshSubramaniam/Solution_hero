import { Navbar } from "./components/layout/Navbar";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Feed from "./pages/Feed";
import Map from "./pages/Map";
import Report from "./pages/Report";
import IssueDetail from "./pages/IssueDetail";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import { CivicBot } from "./components/CivicBot";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.status === 401) return false;
        return failureCount < 2;
      },
    },
  },
});

function BotWrapper() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;
  return <CivicBot />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />
      <Route path="/feed">
        <ProtectedRoute>
          <Feed />
        </ProtectedRoute>
      </Route>
      <Route path="/map">
        <ProtectedRoute>
          <Map />
        </ProtectedRoute>
      </Route>
      <Route path="/report">
        <ProtectedRoute>
          <Report />
        </ProtectedRoute>
      </Route>
      <Route path="/issue/:id">
        <ProtectedRoute>
          <IssueDetail />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/leaderboard">
        <ProtectedRoute>
          <Leaderboard />
        </ProtectedRoute>
      </Route>
      <Route path="/profile/:id">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute requireAdmin>
          <Admin />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <TooltipProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 relative z-0">
                  <Router />
                </main>
                <BotWrapper />
              </div>
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </WouterRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
