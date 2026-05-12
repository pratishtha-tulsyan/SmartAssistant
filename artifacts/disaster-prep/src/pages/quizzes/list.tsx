import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListQuizzes, QuizCategory } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpCircle, ArrowRight, PlayCircle, Layers } from "lucide-react";
import { format } from "date-fns";

export default function QuizzesList() {
  const [searchParams] = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get("category") || "all";
  const [category, setCategory] = useState<string>(initialCategory);
  const [, setLocation] = useLocation();
  
  const { data: quizzes, isLoading } = useListQuizzes(
    category !== "all" ? { category } : undefined
  );

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    if (val === "all") {
      setLocation("/quizzes");
    } else {
      setLocation(`/quizzes?category=${val}`);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "earthquake": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "flood": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "fire": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "cyclone": return "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
      case "pandemic": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "landslide": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "heatwave": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default: return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assessment Quizzes</h1>
          <p className="text-muted-foreground">Test your knowledge on disaster response protocols.</p>
        </div>
        
        <div className="w-full sm:w-64">
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.values(QuizCategory).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  <span className="capitalize">{cat}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="flex-1">
                <Skeleton className="h-16 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : quizzes && quizzes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="flex flex-col overflow-hidden hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className={`capitalize border-0 ${getCategoryColor(quiz.category)}`}>
                    {quiz.category}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1 font-mono">
                    <Layers className="h-3 w-3" />
                    {quiz.questionCount} Qs
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2">{quiz.title}</CardTitle>
                <CardDescription className="text-xs">
                  Created {format(new Date(quiz.createdAt), "MMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {quiz.description}
                </p>
              </CardContent>
              <CardFooter className="pt-3 border-t">
                <Link href={`/quizzes/${quiz.id}`} className="w-full">
                  <Button className="w-full group">
                    <PlayCircle className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    Start Quiz
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-card border-dashed">
          <HelpCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">No quizzes found</h3>
          <p className="text-muted-foreground max-w-sm mt-1">
            {category !== "all" 
              ? `There are currently no quizzes in the ${category} category.`
              : "No quizzes have been created yet."}
          </p>
          {category !== "all" && (
            <Button variant="outline" className="mt-4" onClick={() => handleCategoryChange("all")}>
              Clear Filter
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
