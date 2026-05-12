import { useState } from "react";
import { useListIncidents, useCreateIncident, useUpdateIncidentStatus, useGetMe, IncidentIncidentType, IncidentStatus } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, MapPin, Clock, Search, Filter, Plus, Info } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

const incidentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Location is required"),
  incidentType: z.nativeEnum(IncidentIncidentType)
});

export default function Incidents() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  
  const { data: profile } = useGetMe();
  const { data: incidents, isLoading } = useListIncidents();
  const createIncident = useCreateIncident();
  const updateIncident = useUpdateIncidentStatus();
  
  const isAdmin = profile?.role === "admin";
  const isTeacher = profile?.role === "teacher";
  const canUpdateStatus = isAdmin || isTeacher;

  const form = useForm<z.infer<typeof incidentSchema>>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      incidentType: "other" as IncidentIncidentType,
    },
  });

  const onSubmit = (data: z.infer<typeof incidentSchema>) => {
    createIncident.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Incident reported", description: "Emergency services have been notified." });
        setIsDialogOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to report incident.", variant: "destructive" });
      }
    });
  };

  const handleStatusUpdate = (id: number, status: string) => {
    updateIncident.mutate({ id, data: { status: status as any } }, {
      onSuccess: () => {
        toast({ title: "Status updated" });
        queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      }
    });
  };

  const filteredIncidents = incidents?.filter(incident => 
    filterType === "all" || incident.incidentType === filterType
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'resolved':
      case 'closed': return 'bg-success/15 text-success border-success/30';
      case 'investigating': return 'bg-primary/15 text-primary border-primary/30';
      case 'pending': return 'bg-warning/15 text-warning border-warning/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incident Reports</h1>
          <p className="text-muted-foreground">Report and track emergency situations on campus.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.values(IncidentIncidentType).map((type) => (
                <SelectItem key={type} value={type}>
                  <span className="capitalize">{type.replace('_', ' ')}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Report Incident
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Report Emergency Incident
                </DialogTitle>
                <DialogDescription>
                  Provide clear, accurate details. False reporting is strictly prohibited.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="incidentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Incident Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(IncidentIncidentType).map((type) => (
                              <SelectItem key={type} value={type}>
                                <span className="capitalize">{type.replace('_', ' ')}</span>
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
                        <FormLabel>Short Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Fire in Science Building" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exact Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Room 302, North Wing" {...field} />
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
                            placeholder="Describe what happened, any injuries, and current status..." 
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
                    <Button type="submit" variant="destructive" disabled={createIncident.isPending}>
                      Submit Report
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredIncidents && filteredIncidents.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredIncidents.map((incident) => (
            <Card key={incident.id} className="flex flex-col">
              <CardHeader className="pb-3 border-b">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className={`capitalize border ${getStatusColor(incident.status)}`}>
                    {incident.status}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md capitalize">
                    {incident.incidentType.replace('_', ' ')}
                  </span>
                </div>
                <CardTitle className="text-xl line-clamp-1">{incident.title}</CardTitle>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-[120px]">{incident.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{format(new Date(incident.createdAt), "MMM d, HH:mm")}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {incident.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                  <Info className="h-3 w-3" />
                  <span>Reported by: <strong>{incident.userName}</strong></span>
                </div>
              </CardContent>
              {canUpdateStatus && (
                <CardFooter className="pt-3 border-t bg-muted/10 gap-2">
                  <span className="text-xs text-muted-foreground font-medium mr-auto">Update Status:</span>
                  <Select 
                    value={incident.status} 
                    onValueChange={(val) => handleStatusUpdate(incident.id, val)}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(IncidentStatus).map((status) => (
                        <SelectItem key={status} value={status} className="text-xs">
                          <span className="capitalize">{status}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-card border-dashed">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">No incidents found</h3>
          <p className="text-muted-foreground max-w-sm mt-1">
            {filterType !== "all" 
              ? `There are no incidents of type ${filterType.replace('_', ' ')} reported.`
              : "There are no reported incidents at this time."}
          </p>
          {filterType !== "all" && (
            <Button variant="outline" className="mt-4" onClick={() => setFilterType("all")}>
              Clear Filter
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
