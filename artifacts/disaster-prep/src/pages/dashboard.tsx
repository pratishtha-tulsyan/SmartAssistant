import { useGetMe, useGetDashboardStats, useGetStudentStats, useListAlerts } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Users, BookOpen, HelpCircle, Trophy, BellRing, CheckCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function AdminDashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
        <p className="text-muted-foreground">Monitor platform engagement and active emergency situations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalStudents} students, {stats.totalTeachers} teachers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <BellRing className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.activeAlerts}</div>
            <p className="text-xs text-muted-foreground mt-1">Requiring immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.openIncidents}</div>
            <p className="text-xs text-muted-foreground mt-1">Unresolved reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Training Modules</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalModules}</div>
            <p className="text-xs text-muted-foreground mt-1">Available for education</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>Latest reported emergencies and incidents.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentIncidents.length > 0 ? (
              <div className="space-y-4">
                {stats.recentIncidents.map((incident) => (
                  <div key={incident.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{incident.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="capitalize">{incident.incidentType.replace('_', ' ')}</span>
                        <span>&bull;</span>
                        <span>{incident.location}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase
                        ${incident.status === 'resolved' || incident.status === 'closed' ? 'bg-success/10 text-success' : 
                          incident.status === 'investigating' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'}`}>
                        {incident.status}
                      </span>
                      <span className="text-xs text-muted-foreground">{format(new Date(incident.createdAt), "MMM d, HH:mm")}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent incidents reported.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Training Distribution</CardTitle>
            <CardDescription>Modules available by category.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.modulesByCategory.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="capitalize text-sm font-medium">{category.category}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{category.count} modules</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StudentDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStudentStats();
  const { data: alerts, isLoading: alertsLoading } = useListAlerts();

  if (statsLoading || alertsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const activeAlerts = alerts?.filter(a => a.isActive) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
        <p className="text-muted-foreground">Track your disaster preparedness training progress.</p>
      </div>

      {activeAlerts.length > 0 && (
        <div className="space-y-3">
          {activeAlerts.map(alert => (
            <Alert key={alert.id} variant={alert.alertType === 'evacuation' || alert.alertType === 'fire' ? 'destructive' : 'default'} className={alert.alertType === 'weather' || alert.alertType === 'general' ? 'border-primary/50 bg-primary/5' : ''}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="uppercase tracking-wider text-xs font-bold mb-1">{alert.alertType} ALERT</AlertTitle>
              <AlertDescription className="font-medium">
                {alert.title}: {alert.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Modules Read</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.modulesCompleted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.quizzesTaken}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalPoints}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Quiz Results</CardTitle>
          <CardDescription>Your latest training assessments.</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentResults.length > 0 ? (
            <div className="space-y-4">
              {stats.recentResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{result.quizTitle}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(result.completedAt), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      {result.score} / {result.totalQuestions}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold
                      ${result.percentage >= 80 ? 'bg-success/10 text-success' : 
                        result.percentage >= 60 ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>
                      {result.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">You haven't taken any quizzes yet. Head to the Quizzes section to test your knowledge.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const { data: profile, isLoading } = useGetMe();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (profile?.role === "admin" || profile?.role === "teacher") {
    return <AdminDashboard />;
  }

  return <StudentDashboard />;
}
