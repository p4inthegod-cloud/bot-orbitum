import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "./components/DashboardLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminBroadcasts from "./pages/AdminBroadcasts";
import AdminMaterials from "./pages/AdminMaterials";

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (user?.role === "admin") {
    return (
      <DashboardLayout>
        <Switch>
          <Route path="/" component={AdminDashboard} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/broadcasts" component={AdminBroadcasts} />
          <Route path="/admin/materials" component={AdminMaterials} />
          <Route component={NotFound} />
        </Switch>
      </DashboardLayout>
    );
  }

  // Non-admin users see a simple login page
  return (
    <Switch>
      <Route path="/" component={() => (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4 p-8">
            <h1 className="text-2xl font-bold">Orbitum Trading Bot</h1>
            <p className="text-muted-foreground">Панель управления ботом</p>
            {user ? (
              <p className="text-sm text-muted-foreground">У вас нет доступа к панели управления</p>
            ) : (
              <a
                href="/api/oauth/callback"
                className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
              >
                Войти
              </a>
            )}
          </div>
        </div>
      )} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
