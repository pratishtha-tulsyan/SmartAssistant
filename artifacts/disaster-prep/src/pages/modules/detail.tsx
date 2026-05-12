import { useParams, Link } from "wouter";
import { useGetModule } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, ExternalLink, Video, FileText, File, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function ModuleDetail() {
  const params = useParams<{ id: string }>();
  const moduleId = parseInt(params.id || "0", 10);
  
  const { data: module, isLoading, isError } = useGetModule(moduleId, {
    query: {
      enabled: !!moduleId && !isNaN(moduleId)
    }
  });

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
      case "video": return <Video className="h-5 w-5" />;
      case "pdf": return <FileText className="h-5 w-5" />;
      case "article": return <File className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-10 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-20 w-full mt-8" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !module) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <BookOpen className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Module Not Found</h2>
        <p className="text-muted-foreground mt-2 mb-6">The learning module you're looking for doesn't exist or has been removed.</p>
        <Link href="/modules">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Modules
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link href="/modules" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Modules
      </Link>

      <Card className="overflow-hidden border-t-4 border-t-primary shadow-md">
        <CardHeader className="bg-muted/30 pb-8 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <Badge variant="outline" className={`px-3 py-1 capitalize text-sm border-0 ${getCategoryColor(module.category)}`}>
              {module.category}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground gap-1.5 font-medium bg-background px-3 py-1 rounded-md border">
              {getContentTypeIcon(module.contentType)}
              <span className="capitalize">{module.contentType}</span>
            </div>
          </div>
          
          <CardTitle className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-foreground">
            {module.title}
          </CardTitle>
          
          <div className="flex items-center text-sm text-muted-foreground gap-2 mt-4 font-medium">
            <Calendar className="h-4 w-4" />
            <span>Published on {format(new Date(module.createdAt), "MMMM d, yyyy")}</span>
          </div>
        </CardHeader>
        
        <CardContent className="pt-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold mb-4">Overview</h3>
            <p className="text-base leading-relaxed whitespace-pre-line text-foreground/90">
              {module.description}
            </p>
          </div>

          {module.contentUrl && (
            <div className="mt-12 bg-primary/5 rounded-xl border border-primary/20 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  {getContentTypeIcon(module.contentType)}
                  Access Course Material
                </h4>
                <p className="text-sm text-muted-foreground">Click the button to access the full {module.contentType} content for this module.</p>
              </div>
              <Button size="lg" className="shrink-0 group" asChild>
                <a href={module.contentUrl} target="_blank" rel="noopener noreferrer">
                  Open Material
                  <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
        <span className="text-sm text-muted-foreground">Ready to test your knowledge?</span>
        <Link href={`/quizzes?category=${module.category}`}>
          <Button variant="outline">
            Take Related Quizzes
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
