import { useState } from "react";
import { useListAlerts, useCreateAlert, useDeleteAlert, useGetMe, AlertAlertType } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, BellRing, Trash2, Plus, Wind, Flame, Waves, Users } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

const alertSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  alertType: z.nativeEnum(AlertAlertType)
});

export default function Alerts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: profile } = useGetMe();
  const { data: alerts, isLoading } = useListAlerts();
  const createAlert = useCreateAlert();
  const deleteAlert = useDeleteAlert();
  
  const isAdmin = profile?.role === "admin";

  const form = useForm<z.infer<typeof alertSchema>>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      title: "",
      message: "",
      alertType: "general" as AlertAlertType,
    },
  });

  const getAlertIcon = (type: string) => {
    switch(type) {
      case 'weather': return <Wind className="h-5 w-5" />;
      case 'fire': return <Flame className="h-5 w-5" />;
      case 'flood': return <Waves className="h-5 w-5" />;
      case 'evacuation': return <Users className="h-5 w-5" />;
      case 'earthquake': return <AlertTriangle className="h-5 w-5" />;
      default: return <BellRing className="h-5 w-5" />;
    }
  };

  const getAlertStyle = (type: string, isActive: boolean) => {
    if (!isActive) return "border-muted bg-muted/10 opacity-60";
    
    switch(type) {
      case 'evacuation': 
      case 'fire':
      case 'earthquake': 
        return "border-destructive bg-destructive/5 dark:bg-destructive/10";
      case 'weather':
      case 'flood':
        return "border-warning bg-warning/5 dark:bg-warning/10";
      default: 
        return "border-primary bg-primary/5 dark:bg-primary/10";
    }
  };

  const getAlertTextStyle = (type: string, isActive: boolean) => {
    if (!isActive) return "text-muted-foreground";
    
    switch(type) {
      case 'evacuation': 
      case 'fire':
      case 'earthquake': 
        return "text-destructive";
      case 'weather':
      case 'flood':
        return "text-warning dark:text-orange-400";
      default: 
        return "text-primary";
    }
  };

  const onSubmit = (data: z.infer<typeof alertSchema>) => {
    createAlert.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Alert created", description: "The emergency alert has been broadcast." });
        setIsDialogOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to create alert.", variant: "destructive" });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to dismiss this alert?")) {
      deleteAlert.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Alert dismissed" });
          queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-destructive flex items-center gap-2">
            <BellRing className="h-8 w-8" />
            Emergency Alerts
          </h1>
          <p className="text-muted-foreground">Active warnings and emergency broadcasts.</p>
        </div>
        
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="animate-pulse-subtle">
                <Plus className="mr-2 h-4 w-4" />
                Broadcast New Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Broadcast Emergency Alert
                </DialogTitle>
                <DialogDescription>
                  This will immediately notify all users on their dashboards.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="alertType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alert Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(AlertAlertType).map((type) => (
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
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alert Headline</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. SEVERE THUNDERSTORM WARNING" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Detailed Instructions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide clear instructions on what action to take..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" variant="destructive" disabled={createAlert.isPending}>
                      Broadcast Alert
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : alerts && alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 shadow-sm ${getAlertStyle(alert.alertType, alert.isActive)}`}>
              <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full bg-background border shadow-sm ${getAlertTextStyle(alert.alertType, alert.isActive)}`}>
                    {getAlertIcon(alert.alertType)}
                  </div>
                  <div>
                    <CardTitle className={`text-xl font-bold tracking-wide uppercase ${getAlertTextStyle(alert.alertType, alert.isActive)}`}>
                      {alert.title}
                    </CardTitle>
                    <CardDescription className="font-mono text-xs font-semibold uppercase mt-1">
                      {alert.alertType} &bull; {format(new Date(alert.createdAt), "MMM d, yyyy HH:mm")}
                      {!alert.isActive && " (DISMISSED)"}
                    </CardDescription>
                  </div>
                </div>
                
                {isAdmin && alert.isActive && (
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(alert.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-base font-medium leading-relaxed max-w-4xl">
                  {alert.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-card border-dashed">
          <div className="bg-success/10 p-4 rounded-full mb-4">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h3 className="text-xl font-bold text-success">All Clear</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            There are currently no active emergency alerts or warnings.
          </p>
        </div>
      )}
    </div>
  );
}

// Ensure CheckCircle is imported from lucide-react
import { CheckCircle } from "lucide-react";
