import { useState } from "react";
import { useGetAdminOrders, getGetAdminOrdersQueryKey, useUpdateOrderStatus, GetAdminOrdersStatus, UpdateOrderStatusBodyStatus, Order } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { format } from "date-fns";
import { MoreHorizontal, ChevronLeft, ChevronRight, Phone, Receipt, User, CheckCircle2, XCircle, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

type StatusFilter = GetAdminOrdersStatus | "all";

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-700",
};

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryParams = {
    page,
    limit: 20,
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
  };

  const { data, isLoading } = useGetAdminOrders(queryParams, {
    query: { queryKey: getGetAdminOrdersQueryKey(queryParams) },
  });

  const updateStatus = useUpdateOrderStatus({
    mutation: {
      onSuccess: (_, variables) => {
        toast({ title: `Order marked as ${variables.data.status}` });
        queryClient.invalidateQueries({ queryKey: getGetAdminOrdersQueryKey(queryParams) });
        if (selectedOrder) {
          setSelectedOrder(prev => prev ? { ...prev, status: variables.data.status } : prev);
        }
      },
      onError: () => {
        toast({ title: "Failed to update order", variant: "destructive" });
      },
    },
  });

  function handleStatus(orderId: number, status: string) {
    updateStatus.mutate({ id: orderId, data: { status: status as UpdateOrderStatusBodyStatus } });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Orders</h1>

      <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v as StatusFilter); setPage(1); }}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
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
              <TableHead>Payer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : data?.orders.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              )
              : data?.orders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(order.createdAt), "MMM d, HH:mm")}
                    </TableCell>
                    <TableCell>{order.plan?.name || `Plan ${order.planId}`}</TableCell>
                    <TableCell className="font-mono text-sm">{order.recipientPhone}</TableCell>
                    <TableCell className="font-mono text-sm">{order.payerPhone}</TableCell>
                    <TableCell>KES {order.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${STATUS_COLORS[order.status] ?? ""}`}>
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
                          <DropdownMenuItem
                            onClick={() => handleStatus(order.id, "delivered")}
                            disabled={order.status === "delivered"}
                            className="text-green-700"
                          >
                            <Truck className="h-4 w-4 mr-2" /> Mark as Delivered
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatus(order.id, "paid")}
                            disabled={order.status === "paid"}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Paid
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleStatus(order.id, "failed")}
                            disabled={order.status === "failed"}
                            className="text-red-600"
                          >
                            <XCircle className="h-4 w-4 mr-2" /> Mark as Failed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatus(order.id, "cancelled")}
                            disabled={order.status === "cancelled"}
                            className="text-muted-foreground"
                          >
                            Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <p className="text-sm text-muted-foreground">
              Page {page} of {data.totalPages} · {data.total} orders
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Order Detail Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Order #{selectedOrder?.id}</SheetTitle>
            <SheetDescription>
              {selectedOrder && format(new Date(selectedOrder.createdAt), "PPP 'at' p")}
            </SheetDescription>
          </SheetHeader>

          {selectedOrder && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                <span className="text-sm font-medium">Status</span>
                <Badge variant="outline" className={`capitalize ${STATUS_COLORS[selectedOrder.status] ?? ""}`}>
                  {selectedOrder.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan</p>
                <div className="bg-muted/20 rounded-lg p-3 space-y-1">
                  <p className="font-medium">{selectedOrder.plan?.name || `Plan ${selectedOrder.planId}`}</p>
                  {selectedOrder.plan && (
                    <p className="text-sm text-muted-foreground">{selectedOrder.plan.dataSize} · {selectedOrder.plan.validity}</p>
                  )}
                  <p className="text-sm font-semibold text-emerald-700">KES {selectedOrder.amount}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-mono font-medium">{selectedOrder.recipientPhone}</p>
                      <p className="text-xs text-muted-foreground">Recipient</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-mono font-medium">{selectedOrder.payerPhone}</p>
                      <p className="text-xs text-muted-foreground">Payer (M-Pesa)</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedOrder.transactionId && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transaction</p>
                  <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg text-sm font-mono">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    {selectedOrder.transactionId}
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-4 border-t">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</p>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleStatus(selectedOrder.id, "delivered")}
                    disabled={selectedOrder.status === "delivered" || updateStatus.isPending}
                  >
                    <Truck className="h-4 w-4 mr-2" /> Mark as Delivered
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleStatus(selectedOrder.id, "paid")}
                      disabled={selectedOrder.status === "paid" || updateStatus.isPending}
                    >
                      Mark Paid
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleStatus(selectedOrder.id, "failed")}
                      disabled={selectedOrder.status === "failed" || updateStatus.isPending}
                    >
                      Mark Failed
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
