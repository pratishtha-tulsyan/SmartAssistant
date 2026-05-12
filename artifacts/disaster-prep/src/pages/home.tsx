import { Link } from "wouter";
import { ShieldAlert, Activity, BookOpen, AlertTriangle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">DPRES</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="ghost" className="font-medium">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="font-medium">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 py-20 md:py-32 max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Activity className="h-4 w-4" />
            <span>Mission-Critical Education</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
            Disaster Preparedness and Response Education System
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive platform for schools and colleges to educate students, teachers, and administrators on life-saving disaster response protocols.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/sign-up">
              <Button size="lg" className="h-12 px-8 text-base group">
                Join the Platform
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                Access Control Center
              </Button>
            </Link>
          </div>
        </section>

        {/* Categories Section */}
        <section className="bg-slate-50 dark:bg-slate-900/50 py-20 px-6 border-y">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Comprehensive Coverage</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Learn protocols for a wide range of natural and man-made disasters.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { name: "Earthquake", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30" },
                { name: "Flood", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30" },
                { name: "Fire", color: "bg-red-100 text-red-700 dark:bg-red-900/30" },
                { name: "Cyclone", color: "bg-slate-200 text-slate-700 dark:bg-slate-800" },
                { name: "Pandemic", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30" },
                { name: "Landslide", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30" },
                { name: "Heatwave", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30" },
                { name: "General Response", color: "bg-primary/10 text-primary" },
              ].map((category) => (
                <div key={category.name} className="bg-card p-6 rounded-xl border shadow-sm flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${category.color}`}>
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <span className="font-semibold">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-lg">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold">Structured Learning</h3>
              <p className="text-muted-foreground leading-relaxed">Access rich educational modules with videos, PDFs, and guides tailored for rapid comprehension.</p>
            </div>
            <div className="space-y-3">
              <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-lg">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold">Active Drills</h3>
              <p className="text-muted-foreground leading-relaxed">Test knowledge with regular quizzes and track readiness across the entire institution via leaderboards.</p>
            </div>
            <div className="space-y-3">
              <div className="h-10 w-10 bg-destructive/10 text-destructive flex items-center justify-center rounded-lg">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold">Incident Reporting</h3>
              <p className="text-muted-foreground leading-relaxed">Report incidents instantly, track real-time emergency alerts, and access local emergency contacts.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 text-slate-400 py-12 text-center text-sm border-t border-slate-900 mt-auto">
        <p>© {new Date().getFullYear()} Disaster Preparedness and Response Education System. All rights reserved.</p>
      </footer>
    </div>
  );
}
