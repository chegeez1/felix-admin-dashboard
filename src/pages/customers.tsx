import { useState } from "react";
import { useGetAdminCustomers, getGetAdminCustomersQueryKey, type AdminCustomer } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  ChevronLeft, ChevronRight, Mail, Phone, Star,
  ShoppingBag, TrendingUp, Clock, CheckCircle2, Truck,
  XCircle, AlertCircle, Loader2, User2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/* ─── types ─────────────────────────────────────────── */
type CustomerRow = AdminCustomer;

interface ProfilePhone { id: number; phoneNumber: string; label: string; isPrimary: boolean; createdAt: string }
interface ProfilePlan  { id: number; name: string; dataSize: string; validity: string; price: number; category: string }
interface ProfileOrder {
  id: number;
  planId: number;
  recipientPhone: string;
  payerPhone: string;
  amount: number;
  status: string;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
  plan: ProfilePlan | null;
}

interface CustomerProfile {
  userId: string;
  email: string | null;
  phones: ProfilePhone[];
  orders: ProfileOrder[];
  stats: {
    totalOrders: number;
    totalSpent: number;
    statusBreakdown: Record<string, number>;
  };
}

/* ─── constants ──────────────────────────────────────── */
const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: <Truck className="h-3 w-3" /> },
  paid:      { label: "Paid",      color: "bg-blue-100 text-blue-800 border-blue-200",          icon: <CheckCircle2 className="h-3 w-3" /> },
  pending:   { label: "Pending",   color: "bg-yellow-100 text-yellow-800 border-yellow-200",    icon: <Clock className="h-3 w-3" /> },
  failed:    { label: "Failed",    color: "bg-red-100 text-red-800 border-red-200",             icon: <XCircle className="h-3 w-3" /> },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-600 border-gray-200",          icon: <AlertCircle className="h-3 w-3" /> },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, color: "bg-gray-100 text-gray-600", icon: null };
  return (
    <Badge variant="outline" className={`gap-1 capitalize text-xs font-medium border ${meta.color}`}>
      {meta.icon}{meta.label}
    </Badge>
  );
}

/* ─── hooks ──────────────────────────────────────────── */
function useCustomerProfile(userId: string | null) {
  return useQuery<CustomerProfile>({
    queryKey: ["admin", "customer-profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/customers/${userId}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch customer profile");
      return res.json();
    },
  });
}

/* ─── stat pill ──────────────────────────────────────── */
function StatPill({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl p-3 border text-center gap-0.5 ${highlight ? "bg-emerald-50 border-emerald-200" : "bg-muted/30 border-border"}`}>
      <div className={`mb-1 ${highlight ? "text-emerald-600" : "text-muted-foreground"}`}>{icon}</div>
      <p className={`text-lg font-bold leading-tight ${highlight ? "text-emerald-700" : ""}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground leading-none">{label}</p>
    </div>
  );
}

/* ─── profile sheet ──────────────────────────────────── */
function CustomerProfileSheet({ customer, onClose }: { customer: CustomerRow | null; onClose: () => void }) {
  const { data: profile, isLoading, isError } = useCustomerProfile(customer?.userId ?? null);

  return (
    <Sheet open={!!customer} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col p-0 gap-0 overflow-hidden">
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <User2 className="h-5 w-5 text-muted-foreground" />
            Customer Profile
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
              </div>
              <Skeleton className="h-4 w-32" />
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
            </div>
          )}

          {isError && (
            <p className="text-sm text-red-600 text-center py-8">Failed to load profile. Try again.</p>
          )}

          {profile && !isLoading && (
            <>
              {/* Identity */}
              <div className="space-y-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Identity</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium truncate">{profile.email ?? "Not available"}</p>
                    </div>
                  </div>

                  {profile.phones.length === 0 ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20 text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      <p className="text-sm">No verified phone numbers</p>
                    </div>
                  ) : (
                    profile.phones.map(phone => (
                      <div key={phone.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-mono font-medium">{phone.phoneNumber}</p>
                            {phone.isPrimary && (
                              <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-100 border border-amber-200 rounded-full px-1.5 py-0.5">
                                <Star className="h-2.5 w-2.5" /> Primary
                              </span>
                            )}
                          </div>
                          {phone.label && <p className="text-xs text-muted-foreground">{phone.label}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Separator />

              {/* Stats */}
              <div className="space-y-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Summary</p>
                <div className="grid grid-cols-3 gap-3">
                  <StatPill icon={<ShoppingBag className="h-4 w-4" />} label="Total Orders" value={profile.stats.totalOrders} />
                  <StatPill icon={<TrendingUp className="h-4 w-4" />} label="Total Spent" value={`KES ${profile.stats.totalSpent.toLocaleString()}`} highlight />
                  <StatPill icon={<Truck className="h-4 w-4" />} label="Delivered" value={profile.stats.statusBreakdown["delivered"] ?? 0} />
                </div>
                {/* Status breakdown */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(profile.stats.statusBreakdown).map(([status, count]) => (
                    <div key={status} className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_META[status]?.color ?? "bg-gray-100 text-gray-600"}`}>
                      {STATUS_META[status]?.icon}
                      {count} {STATUS_META[status]?.label ?? status}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Order history */}
              <div className="space-y-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Purchase History ({profile.orders.length})
                </p>

                {profile.orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No orders yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {profile.orders.map((order) => (
                      <Card key={order.id} className="shadow-none border">
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate">{order.plan?.name ?? `Plan #${order.planId}`}</p>
                              <p className="text-xs text-muted-foreground">{order.plan?.dataSize} · {order.plan?.validity}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold">KES {Number(order.amount).toLocaleString()}</p>
                              <StatusBadge status={order.status} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span className="font-mono">{order.recipientPhone}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(order.createdAt), "MMM d, yyyy HH:mm")}
                            </span>
                            {order.plan?.category && (
                              <span className="capitalize col-span-2 text-[11px]">Category: {order.plan.category}</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ─── main page ──────────────────────────────────────── */
export default function Customers() {
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null);
  const queryParams = { page, limit: 20 };

  const { data, isLoading } = useGetAdminCustomers(queryParams, {
    query: { queryKey: getGetAdminCustomersQueryKey(queryParams) },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        {data && <p className="text-sm text-muted-foreground">{data.total} total customers</p>}
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-10">#</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-center">Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Last Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : data?.customers.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <User2 className="h-8 w-8" />
                      <p className="text-sm">No customers yet</p>
                    </div>
                  </TableCell>
                </TableRow>
              )
              : data?.customers.map((customer, idx) => (
                  <TableRow
                    key={customer.userId}
                    className="cursor-pointer hover:bg-primary/5 transition-colors"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <TableCell className="text-muted-foreground text-sm font-mono">
                      {(page - 1) * 20 + idx + 1}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-muted-foreground font-mono">
                          {customer.userId.substring(0, 18)}…
                        </p>
                        <p className="text-xs text-muted-foreground/70">Click to view full profile</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-sm font-bold">
                        {customer.totalOrders}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-emerald-700">KES {customer.totalSpent.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {customer.lastOrderAt
                        ? format(new Date(customer.lastOrderAt), "MMM d, yyyy · HH:mm")
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t bg-muted/10">
            <p className="text-sm text-muted-foreground">
              Page {page} of {data.totalPages}
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

      <CustomerProfileSheet
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
}
