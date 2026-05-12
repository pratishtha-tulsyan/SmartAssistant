import { useGetMe, useUpdateMe, useListQuizResults } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, CheckCircle, Clock, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { queryClient } from "@/lib/queryClient";

export default function Profile() {
  const { data: profile, isLoading: isProfileLoading } = useGetMe();
  const { data: results, isLoading: isResultsLoading } = useListQuizResults();
  const updateMe = useUpdateMe();
  
  const [name, setName] = useState("");
  
  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile]);

  const handleUpdateProfile = () => {
    if (!name.trim()) return;
    
    updateMe.mutate({ data: { name } }, {
      onSuccess: () => {
        toast({ title: "Profile updated successfully" });
        queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      },
      onError: () => {
        toast({ title: "Update failed", variant: "destructive" });
      }
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (isProfileLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-32" />
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4 border-4 border-muted">
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <div className="flex items-center text-muted-foreground mt-1 gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{profile.email}</span>
              </div>
              <Badge variant="secondary" className="mt-4 capitalize flex items-center gap-1 font-medium px-3 py-1">
                {profile.role === 'admin' ? <Shield className="h-3 w-3 text-destructive" /> : 
                 profile.role === 'teacher' ? <CheckCircle className="h-3 w-3 text-primary" /> :
                 <User className="h-3 w-3" />}
                {profile.role}
              </Badge>
              <p className="text-xs text-muted-foreground mt-6 pt-4 border-t w-full">
                Member since {format(new Date(profile.createdAt), "MMMM yyyy")}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" value={profile.email} disabled />
                <p className="text-xs text-muted-foreground">Email addresses are managed through your identity provider.</p>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button 
                onClick={handleUpdateProfile} 
                disabled={updateMe.isPending || name === profile.name || !name.trim()}
              >
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Training History</CardTitle>
              <CardDescription>Your recently completed quizzes and scores.</CardDescription>
            </CardHeader>
            <CardContent>
              {isResultsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : results && results.length > 0 ? (
                <div className="space-y-4">
                  {results.slice(0, 5).map((result) => (
                    <div key={result.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-sm sm:text-base">{result.quizTitle}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{format(new Date(result.completedAt), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium whitespace-nowrap">
                          {result.score} / {result.totalQuestions}
                        </span>
                        <div className={`px-2 py-1 rounded text-xs font-bold w-12 text-center
                          ${result.percentage >= 80 ? 'bg-success/15 text-success' : 
                            result.percentage >= 60 ? 'bg-warning/15 text-warning' : 'bg-destructive/15 text-destructive'}`}>
                          {result.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                  {results.length > 5 && (
                    <p className="text-xs text-center text-muted-foreground pt-2">
                      Showing 5 most recent results out of {results.length} total.
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Trophy className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                  <p className="text-sm text-muted-foreground">You haven't completed any quizzes yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
