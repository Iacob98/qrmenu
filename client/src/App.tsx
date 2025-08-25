import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { AuthGuard } from "@/components/auth/auth-guard";
import Landing from "@/pages/landing";
import Register from "@/pages/auth/register";
import Login from "@/pages/auth/login";
import Dashboard from "@/pages/dashboard";
import MenuManagement from "@/pages/dashboard/menu";
import AIGeneration from "@/pages/dashboard/ai";
import Settings from "@/pages/dashboard/settings";
import Design from "@/pages/dashboard/design";
import QRPage from "@/pages/dashboard/qr";
import Feedback from "@/pages/dashboard/feedback";
import TelegramTest from "@/pages/dashboard/telegram-test";
import PublicMenu from "@/pages/public-menu/[restaurantId]";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard">
        <AuthGuard>
          <Dashboard />
        </AuthGuard>
      </Route>
      <Route path="/dashboard/menu">
        <AuthGuard>
          <MenuManagement />
        </AuthGuard>
      </Route>
      <Route path="/dashboard/ai">
        <AuthGuard>
          <AIGeneration />
        </AuthGuard>
      </Route>
      <Route path="/dashboard/settings">
        <AuthGuard>
          <Settings />
        </AuthGuard>
      </Route>
      <Route path="/dashboard/design">
        <AuthGuard>
          <Design />
        </AuthGuard>
      </Route>
      <Route path="/dashboard/qr">
        <AuthGuard>
          <QRPage />
        </AuthGuard>
      </Route>
      <Route path="/dashboard/feedback">
        <AuthGuard>
          <Feedback />
        </AuthGuard>
      </Route>
      <Route path="/dashboard/telegram-test">
        <AuthGuard>
          <TelegramTest />
        </AuthGuard>
      </Route>
      <Route path="/menu/:slug" component={PublicMenu} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
