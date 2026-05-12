import { useState } from "react";
import { useListUsers, useUpdateUserRole, UserRoleUpdateRole } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Shield, User as UserIcon, BookOpen } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function AdminUsers() {
  const { data: users, isLoading } = useListUsers();
  const updateRole = useUpdateUserRole();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleRoleChange = (userId: number, role: UserRoleUpdateRole) => {
    setUpdatingId(userId);
    updateRole.mutate({ id: userId, data: { role } }, {
      onSuccess: () => {
        toast({ title: "User role updated successfully" });
        queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      },
      onError: () => {
        toast({ title: "Failed to update user role", variant: "destructive" });
      },
      onSettled: () => {
        setUpdatingId(null);
      }
    });
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2) : '?';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4 text-destructive" />;
      case 'teacher': return <BookOpen className="h-4 w-4 text-primary" />;
      default: return <UserIcon className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
        <p className="text-muted-foreground">Administer accounts and assign roles within the platform.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>View all registered users and manage their access levels.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-10 w-32" />
                </div>
              ))}
            </div>
          ) : users && users.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="hidden md:table-cell">Joined</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{user.name}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm font-medium capitalize">
                          {getRoleIcon(user.role)}
                          <span className={
                            user.role === 'admin' ? 'text-destructive' : 
                            user.role === 'teacher' ? 'text-primary' : ''
                          }>{user.role}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select 
                          disabled={updatingId === user.id}
                          defaultValue={user.role} 
                          onValueChange={(val) => handleRoleChange(user.id, val as UserRoleUpdateRole)}
                        >
                          <SelectTrigger className="w-[130px] ml-auto h-8 text-xs">
                            <SelectValue placeholder="Change role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <UserIcon className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>No users found in the system.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
