import { useState } from "react";
import { Link } from "wouter";
import { useListModules, LearningModuleCategory } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, AlertTriangle, ArrowRight, Video, FileText, File } from "lucide-react";
import { format } from "date-fns";

export default function ModulesList() {
  const [category, setCategory] = useState<string>("all");
  
  const { data: modules, isLoading } = useListModules(
    category !== "all" ? { category } : undefined
  );

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

  const getContentTypeIcon = (type: string) => {
    switch(type) {
      case "video": return <Video className="h-4 w-4" />;
      case "pdf": return <FileText className="h-4 w-4" />;
      case "article": return <File className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learning Modules</h1>
          <p className="text-muted-foreground">Master disaster preparedness protocols and guidelines.</p>
        </div>
        
        <div className="w-full sm:w-64">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.values(LearningModuleCategory).map((cat) => (
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
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : modules && modules.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Card key={module.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className={`capitalize border-0 ${getCategoryColor(module.category)}`}>
                    {module.category}
                  </Badge>
                  <div className="text-muted-foreground" title={`Content Type: ${module.contentType}`}>
                    {getContentTypeIcon(module.contentType)}
                  </div>
                </div>
                <CardTitle className="line-clamp-2">{module.title}</CardTitle>
                <CardDescription className="text-xs">
                  Added on {format(new Date(module.createdAt), "MMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {module.description}
                </p>
              </CardContent>
              <CardFooter className="pt-3 border-t bg-muted/20">
                <Link href={`/modules/${module.id}`} className="w-full">
                  <Button variant="secondary" className="w-full group">
                    Study Module
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-card border-dashed">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">No modules found</h3>
          <p className="text-muted-foreground max-w-sm mt-1">
            {category !== "all" 
              ? `There are currently no training modules in the ${category} category.`
              : "No training modules have been created yet."}
          </p>
          {category !== "all" && (
            <Button variant="outline" className="mt-4" onClick={() => setCategory("all")}>
              Clear Filter
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
