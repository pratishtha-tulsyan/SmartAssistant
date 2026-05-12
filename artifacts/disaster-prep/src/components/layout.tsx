import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { useGetMe } from "@workspace/api-client-react";
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Trophy,
  BellRing,
  AlertTriangle,
  Phone,
  User,
  LogOut,
  Users,
  Settings,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/modules", label: "Learning Modules", icon: BookOpen },
  { href: "/quizzes", label: "Quizzes", icon: HelpCircle },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/alerts", label: "Alerts", icon: BellRing },
  { href: "/incidents", label: "Incidents", icon: AlertTriangle },
  { href: "/emergency-contacts", label: "Emergency Contacts", icon: Phone },
];

const ADMIN_ITEMS = [
  { href: "/admin/users", label: "Manage Users", icon: Users },
  { href: "/admin/modules", label: "Manage Modules", icon: Settings },
  { href: "/admin/quizzes", label: "Manage Quizzes", icon: Settings },
];

function SidebarContent({ isMobile = false, closeMenu = () => {} }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { data: profile, isLoading } = useGetMe();

  const handleSignOut = () => {
    signOut({ redirectUrl: "/" });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-6">
        <Link href="/" onClick={closeMenu} className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <span>DPRES</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid gap-1 px-4">
          <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Main Menu</p>
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href || location.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {item.label}
              </Link>
            );
          })}

          {isLoading ? (
            <div className="mt-8 px-2 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : profile?.role === "admin" ? (
            <>
              <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mt-8 mb-2">Administration</p>
              {ADMIN_ITEMS.map((item) => {
                const isActive = location === item.href || location.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    {item.label}
                  </Link>
                );
              })}
            </>
          ) : null}
        </nav>
      </div>

      <div className="border-t p-4">
        <Link
          href="/profile"
          onClick={closeMenu}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground mb-1"
        >
          <User className="h-4 w-4" />
          My Profile
        </Link>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const { isLoading, isError } = useGetMe({
    query: {
      enabled: isLoaded && isSignedIn,
    }
  });

  if (!isLoaded || (isSignedIn && isLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <AlertTriangle className="h-8 w-8 animate-pulse text-primary" />
          <p className="text-sm font-medium">Loading DPRES interface...</p>
        </div>
      </div>
    );
  }

  // If there's an error loading the profile (like 404 meaning user not synced yet)
  if (isSignedIn && isError) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-4">
        <div className="max-w-md text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-warning mx-auto" />
          <h2 className="text-xl font-bold">Setting up your account</h2>
          <p className="text-muted-foreground">Your account is being provisioned. Please wait a moment and refresh the page.</p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
        <SidebarContent />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:hidden">
          <div className="flex items-center gap-2 font-bold tracking-tight">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <span>DPRES</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent isMobile />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
