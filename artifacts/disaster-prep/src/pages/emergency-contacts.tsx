import { useState } from "react";
import { useListEmergencyContacts, useCreateEmergencyContact, useGetMe, EmergencyContactContactType } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, Shield, Flame, Activity, UtilityPole, Building, Search, Plus, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

const contactSchema = z.object({
  department: z.string().min(2, "Department name must be at least 2 characters"),
  contactNumber: z.string().min(5, "Contact number must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  contactType: z.nativeEnum(EmergencyContactContactType)
});

export default function EmergencyContacts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cityFilter, setCityFilter] = useState("");
  const [debouncedCity, setDebouncedCity] = useState("");
  
  const { data: profile } = useGetMe();
  const { data: contacts, isLoading } = useListEmergencyContacts(
    debouncedCity ? { city: debouncedCity } : undefined
  );
  
  const createContact = useCreateEmergencyContact();
  const isAdmin = profile?.role === "admin";

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      department: "",
      contactNumber: "",
      city: "",
      contactType: "other" as EmergencyContactContactType,
    },
  });

  // Simple debounce for search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCityFilter(e.target.value);
    const timeoutId = setTimeout(() => setDebouncedCity(e.target.value), 500);
    return () => clearTimeout(timeoutId);
  };

  const getContactIcon = (type: string) => {
    switch(type) {
      case 'police': return <Shield className="h-5 w-5 text-blue-500" />;
      case 'fire': return <Flame className="h-5 w-5 text-red-500" />;
      case 'medical': return <Activity className="h-5 w-5 text-green-500" />;
      case 'disaster_management': return <Building className="h-5 w-5 text-orange-500" />;
      case 'utility': return <UtilityPole className="h-5 w-5 text-yellow-600" />;
      default: return <Phone className="h-5 w-5 text-slate-500" />;
    }
  };

  const onSubmit = (data: z.infer<typeof contactSchema>) => {
    createContact.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Contact added", description: "The emergency contact has been saved." });
        setIsDialogOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: ["/api/emergency-contacts"] });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to add contact.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Emergency Contacts</h1>
          <p className="text-muted-foreground">Quick access to essential emergency services.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search"
              placeholder="Search by city..." 
              className="pl-8" 
              value={cityFilter}
              onChange={handleSearch}
            />
          </div>

          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Emergency Contact</DialogTitle>
                  <DialogDescription>
                    Add a new emergency service number to the directory.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="contactType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select service type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(EmergencyContactContactType).map((type) => (
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
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Central Fire Station" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 911 or +1 234 567 8900" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City / Region</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. San Francisco" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter className="pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={createContact.isPending}>Save Contact</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : contacts && contacts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <Card key={contact.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="bg-background p-2 rounded-full border shadow-sm">
                      {getContactIcon(contact.contactType)}
                    </div>
                    <div>
                      <CardTitle className="text-base line-clamp-1">{contact.department}</CardTitle>
                      <CardDescription className="text-xs capitalize font-medium flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {contact.city}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 pb-4">
                <div className="bg-primary/5 rounded-lg p-3 flex items-center justify-between">
                  <span className="font-mono text-lg font-bold tracking-wider">{contact.contactNumber}</span>
                  <Button variant="outline" size="sm" className="h-8" asChild>
                    <a href={`tel:${contact.contactNumber}`}>Call</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-card border-dashed">
          <Phone className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">No contacts found</h3>
          <p className="text-muted-foreground max-w-sm mt-1">
            {debouncedCity 
              ? `No emergency contacts found for "${debouncedCity}".`
              : "The emergency contact directory is currently empty."}
          </p>
          {debouncedCity && (
            <Button variant="outline" className="mt-4" onClick={() => { setCityFilter(""); setDebouncedCity(""); }}>
              Clear Search
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
