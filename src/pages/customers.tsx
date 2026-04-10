import { useState } from "react";
import { useGetAdminCustomers, getGetAdminCustomersQueryKey } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, ShoppingBag, TrendingUp, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-700",
};

interface CustomerRow {
  userId: string;
  email: string | null;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string | null;
}

function useCustomerOrders(userId: string | null) {
  return useQuery({
    queryKey: ["admin", "customer-orders", userId],
    enabled: !!userId,
    queryFn: async () => {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/customers/${userId}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json() as Promise<{ orders: any[] }>;
    },
  });
}

export default function Customers() {
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null);
  const queryParams = { page, limit: 20 };

  const { data, isLoading } = useGetAdminCustomers(queryParams, {
    query: { queryKey: getGetAdminCustomersQueryKey(queryParams) },
  });

  const { data: historyData, isLoading: historyLoading } = useCustomerOrders(selectedCustomer?.userId ?? null);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Customers</h1>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Last Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : data?.customers.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No customers yet.
                  </TableCell>
                </TableRow>
              )
              : data?.customers.map((customer, idx) => (
                  <TableRow
                    key={customer.userId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedCustomer(customer as CustomerRow)}
                  >
                    <TableCell className="text-muted-foreground text-sm">{(page - 1) * 20 + idx + 1}</TableCell>
                    <TableCell className="font-mono text-sm">{customer.userId.substring(0, 20)}…</TableCell>
                    <TableCell>
                      <span className="font-medium">{customer.totalOrders}</span>
                    </TableCell>
                    <TableCell className="font-semibold text-emerald-700">KES {customer.totalSpent.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {customer.lastOrderAt ? format(new Date(customer.lastOrderAt), "MMM d, yyyy HH:mm") : "—"}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <p className="text-sm text-muted-foreground">Page {page} of {data.totalPages}</p>
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

      {/* Customer Detail Sheet */}
      <Sheet open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Customer Profile</SheetTitle>
            <SheetDescription className="font-mono text-xs break-all">{selectedCustomer?.userId}</SheetDescription>
          </SheetHeader>

          {selectedCustomer && (
            <div className="mt-6 space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <ShoppingBag className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xl font-bold">{selectedCustomer.totalOrders}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-100">
                  <TrendingUp className="h-4 w-4 mx-auto mb-1 text-emerald-600" />
                  <p className="text-xl font-bold text-emerald-700">KES {selectedCustomer.totalSpent.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Spent</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {selectedCustomer.lastOrderAt ? format(new Date(selectedCustomer.lastOrderAt), "MMM d") : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Last order</p>
                </div>
              </div>

              {/* Order history */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Purchase History</p>

                {historyLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : historyData?.orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No orders found.</p>
                ) : (
                  <div className="space-y-2">
                    {historyData?.orders.map((order: any) => (
                      <div key={order.id} className="bg-muted/20 rounded-lg p-3 space-y-1 border border-border/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{order.plan?.name ?? `Plan #${order.planId}`}</p>
                            <p className="text-xs text-muted-foreground font-mono">{order.recipientPhone}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">KES {Number(order.amount).toLocaleString()}</p>
                            <Badge variant="outline" className={`text-xs capitalize ${STATUS_COLORS[order.status] ?? ""}`}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.createdAt), "PPP 'at' p")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
