import { useState } from "react";
import { useGetAdminOrders, getGetAdminOrdersQueryKey, useUpdateOrderStatus, GetAdminOrdersStatus, UpdateOrderStatusBodyStatus, Order } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { format } from "date-fns";
import { MoreHorizontal, ChevronLeft, ChevronRight, Phone, Receipt, User, Clock, AlertCircle, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState<GetAdminOrdersStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryParams = { 
    page, 
    limit: 20, 
    ...(statusFilter !== "all" ? { status: statusFilter } : {}) 
  };

  const { data, isLoading } = useGetAdminOrders(queryParams, {
    query: {
      queryKey: getGetAdminOrdersQueryKey(queryParams)
    }
  });

  const updateStatus = useUpdateOrderStatus({
    mutation: {
      onSuccess: () => {
        toast({ title: "Order status updated" });
        queryClient.invalidateQueries({ queryKey: getGetAdminOrdersQueryKey(queryParams) });
      }
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "failed": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "cancelled": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
      </div>

      <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v as any); setPage(1); }}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data?.orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              data?.orders.map((order) => (
                <TableRow 
                  key={order.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedOrder(order)}
                >
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(order.createdAt), "MMM d, HH:mm")}
                  </TableCell>
                  <TableCell>{order.plan?.name || `Plan ${order.planId}`}</TableCell>
                  <TableCell className="font-mono text-sm">{order.recipientPhone}</TableCell>
                  <TableCell>KES {order.amount}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => updateStatus.mutate({ id: order.id, data: { status: UpdateOrderStatusBodyStatus.paid } })}>
                          Mark as Paid
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus.mutate({ id: order.id, data: { status: UpdateOrderStatusBodyStatus.failed } })}>
                          Mark as Failed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus.mutate({ id: order.id, data: { status: UpdateOrderStatusBodyStatus.cancelled } })}>
                          Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing page {page} of {data.totalPages}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Order #{selectedOrder?.id}</SheetTitle>
            <SheetDescription>
              Created on {selectedOrder && format(new Date(selectedOrder.createdAt), "PPP 'at' p")}
            </SheetDescription>
          </SheetHeader>
          
          {selectedOrder && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                <span className="text-sm font-medium">Status</span>
                <Badge variant="outline" className={`capitalize ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </Badge>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Plan Details</h4>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{selectedOrder.plan?.name || `Plan ${selectedOrder.planId}`}</p>
                      <p className="text-xs text-muted-foreground">{selectedOrder.plan?.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">KES {selectedOrder.amount}</p>
                      <p className="text-xs text-muted-foreground">Amount Paid</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Customer Info</h4>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium font-mono">{selectedOrder.recipientPhone}</p>
                      <p className="text-xs text-muted-foreground">Recipient Number</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium font-mono">{selectedOrder.payerPhone}</p>
                      <p className="text-xs text-muted-foreground">Payer Number</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedOrder.transactionId && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Payment</h4>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-md border text-sm">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{selectedOrder.transactionId}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-medium">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => updateStatus.mutate({ id: selectedOrder.id, data: { status: UpdateOrderStatusBodyStatus.paid } })}
                    disabled={selectedOrder.status === 'paid'}
                  >
                    Mark Paid
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 hover:text-red-700"
                    onClick={() => updateStatus.mutate({ id: selectedOrder.id, data: { status: UpdateOrderStatusBodyStatus.failed } })}
                    disabled={selectedOrder.status === 'failed'}
                  >
                    Mark Failed
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
