import { useGetLeaderboard } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Award } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useGetLeaderboard();

  const getRankIcon = (index: number) => {
    switch(index) {
      case 0: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1: return <Medal className="h-6 w-6 text-slate-400" />;
      case 2: return <Medal className="h-6 w-6 text-amber-700" />;
      default: return <span className="font-bold text-muted-foreground w-6 text-center inline-block">{index + 1}</span>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">See how you rank in disaster preparedness knowledge.</p>
      </div>

      <Card className="border-t-4 border-t-primary shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Award className="h-6 w-6 text-primary" />
            Top Performers
          </CardTitle>
          <CardDescription>
            Rankings based on total score across all completed quizzes.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : leaderboard && leaderboard.length > 0 ? (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[100px] text-center font-bold">Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Total Score</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Quizzes</TableHead>
                  <TableHead className="text-right">Avg %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry, idx) => (
                  <TableRow key={entry.userId} className={idx < 3 ? "bg-primary/5 hover:bg-primary/10 transition-colors font-medium" : ""}>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center">
                        {getRankIcon(idx)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className={idx < 3 ? "h-10 w-10 border-2 border-primary/20" : "h-8 w-8"}>
                          <AvatarFallback className={idx === 0 ? "bg-yellow-500 text-white" : idx === 1 ? "bg-slate-400 text-white" : idx === 2 ? "bg-amber-700 text-white" : "bg-primary/10 text-primary"}>
                            {getInitials(entry.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-base">{entry.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary text-lg">
                      {entry.totalScore.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell text-muted-foreground">
                      {entry.quizzesCompleted}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
                        ${entry.averagePercentage >= 80 ? 'bg-success/15 text-success' : 
                          entry.averagePercentage >= 60 ? 'bg-warning/15 text-warning' : 'bg-destructive/15 text-destructive'}`}>
                        {entry.averagePercentage.toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Trophy className="h-12 w-12 opacity-20 mb-4" />
              <p>No quiz results yet. Be the first to take a quiz and claim the top spot!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
