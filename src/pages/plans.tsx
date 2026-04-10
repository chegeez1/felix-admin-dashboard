import { useState } from "react";
import { useGetAdminPlans, getGetAdminPlansQueryKey, useCreateAdminPlan, useUpdateAdminPlan, useDeleteAdminPlan, CreatePlanBodyCategory, CreatePlanBody } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const planSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  dataSize: z.string().min(1, "Data size is required"),
  validity: z.string().min(1, "Validity is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  category: z.enum(["okoa_jahazi", "gifts", "minutes"]),
  canBuyMultipleTimes: z.boolean().default(true),
});

export default function Plans() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: plans, isLoading } = useGetAdminPlans({
    query: { queryKey: getGetAdminPlansQueryKey() }
  });

  const createPlan = useCreateAdminPlan({
    mutation: {
      onSuccess: () => {
        toast({ title: "Plan created successfully" });
        queryClient.invalidateQueries({ queryKey: getGetAdminPlansQueryKey() });
        setIsDialogOpen(false);
      }
    }
  });

  const updatePlan = useUpdateAdminPlan({
    mutation: {
      onSuccess: () => {
        toast({ title: "Plan updated" });
        queryClient.invalidateQueries({ queryKey: getGetAdminPlansQueryKey() });
      }
    }
  });

  const deletePlan = useDeleteAdminPlan({
    mutation: {
      onSuccess: () => {
        toast({ title: "Plan deleted" });
        queryClient.invalidateQueries({ queryKey: getGetAdminPlansQueryKey() });
      }
    }
  });

  const form = useForm<z.infer<typeof planSchema>>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      description: "",
      dataSize: "",
      validity: "",
      price: 0,
      category: "okoa_jahazi",
      canBuyMultipleTimes: true,
    }
  });

  const onSubmit = (values: z.infer<typeof planSchema>) => {
    createPlan.mutate({ data: values as CreatePlanBody });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Data Plans</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Data Plan</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>
                      <FormControl><Input placeholder="e.g. 5GB valid for 24hrs" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea placeholder="Details about the plan" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dataSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Size</FormLabel>
                        <FormControl><Input placeholder="e.g. 5GB" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="validity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Validity</FormLabel>
                        <FormControl><Input placeholder="e.g. 24 Hrs" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (KES)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="okoa_jahazi">Okoa Jahazi</SelectItem>
                            <SelectItem value="gifts">Gifts</SelectItem>
                            <SelectItem value="minutes">Minutes</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="canBuyMultipleTimes"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Allow multiple purchases</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createPlan.isPending}>
                  {createPlan.isPending ? "Creating..." : "Create Plan"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Size / Validity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-10 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : plans?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No plans configured.
                </TableCell>
              </TableRow>
            ) : (
              plans?.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {plan.category.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {plan.dataSize} / {plan.validity}
                  </TableCell>
                  <TableCell>KES {plan.price}</TableCell>
                  <TableCell>
                    <Switch 
                      checked={plan.isActive}
                      onCheckedChange={(checked) => updatePlan.mutate({ id: plan.id, data: { isActive: checked } })}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this plan?")) {
                          deletePlan.mutate({ id: plan.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
