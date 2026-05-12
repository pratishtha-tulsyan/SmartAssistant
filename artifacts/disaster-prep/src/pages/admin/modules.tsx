import { useState } from "react";
import { 
  useListModules, 
  useCreateModule, 
  useUpdateModule, 
  useDeleteModule,
  LearningModuleInputCategory,
  LearningModuleInputContentType,
  LearningModuleUpdateCategory,
  LearningModuleUpdateContentType
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus, Pencil, Trash2, Video, FileText, File } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

const moduleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.nativeEnum(LearningModuleInputCategory),
  contentType: z.nativeEnum(LearningModuleInputContentType),
  contentUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
});

export default function AdminModules() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const { data: modules, isLoading } = useListModules();
  const createModule = useCreateModule();
  const updateModule = useUpdateModule();
  const deleteModule = useDeleteModule();

  const form = useForm<z.infer<typeof moduleSchema>>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "general" as unknown as LearningModuleInputCategory, // Fallback safe
      contentType: "article",
      contentUrl: "",
    },
  });

  const handleEdit = (module: any) => {
    setEditingId(module.id);
    form.reset({
      title: module.title,
      description: module.description,
      category: module.category as LearningModuleInputCategory,
      contentType: module.contentType as LearningModuleInputContentType,
      contentUrl: module.contentUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingId(null);
    form.reset({
      title: "",
      description: "",
      category: "earthquake",
      contentType: "article",
      contentUrl: "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: z.infer<typeof moduleSchema>) => {
    const payload = {
      ...data,
      contentUrl: data.contentUrl === "" ? undefined : data.contentUrl,
    };

    if (editingId) {
      // TypeScript safety cast
      const updateData = {
        ...payload,
        category: payload.category as unknown as LearningModuleUpdateCategory,
        contentType: payload.contentType as unknown as LearningModuleUpdateContentType,
      };
      
      updateModule.mutate({ id: editingId, data: updateData }, {
        onSuccess: () => {
          toast({ title: "Module updated successfully" });
          setIsDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
        },
        onError: () => toast({ title: "Failed to update module", variant: "destructive" })
      });
    } else {
      createModule.mutate({ data: payload }, {
        onSuccess: () => {
          toast({ title: "Module created successfully" });
          setIsDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
        },
        onError: () => toast({ title: "Failed to create module", variant: "destructive" })
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this module? This action cannot be undone.")) {
      deleteModule.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Module deleted successfully" });
          queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
        },
        onError: () => toast({ title: "Failed to delete module", variant: "destructive" })
      });
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
          <h1 className="text-3xl font-bold tracking-tight">Manage Learning Modules</h1>
          <p className="text-muted-foreground">Create and edit educational content.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Create Module
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Module" : "Create New Module"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Update the learning module details." : "Add new educational content to the platform."}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Module Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Earthquake Survival Protocol" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(LearningModuleInputCategory).map((type) => (
                              <SelectItem key={type} value={type}>
                                <span className="capitalize">{type}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(LearningModuleInputContentType).map((type) => (
                              <SelectItem key={type} value={type}>
                                <span className="capitalize">{type}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="contentUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>External Link (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/material.pdf" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide the core content or abstract here..." 
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createModule.isPending || updateModule.isPending}>
                    {editingId ? "Save Changes" : "Create Module"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : modules && modules.length > 0 ? (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((module) => (
                  <TableRow key={module.id}>
                    <TableCell className="font-medium">
                      <div className="truncate max-w-[280px]" title={module.title}>
                        {module.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {module.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground capitalize text-sm">
                        {getContentTypeIcon(module.contentType)}
                        {module.contentType}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {format(new Date(module.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(module)}>
                          <Pencil className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(module.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <BookOpen className="h-10 w-10 opacity-20 mb-3" />
              <p>No learning modules found. Create one to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
