import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGetAllOrders, useUpdateOrderStatus, OrderStatus } from '../../hooks/useQueries';
import { formatCurrency } from '../../utils/formatCurrency';

const STATUS_OPTIONS = [
  { value: OrderStatus.pending, label: 'Pending' },
  { value: OrderStatus.confirmed, label: 'Confirmed' },
  { value: OrderStatus.delivered, label: 'Delivered' },
];

function getStatusBadgeClass(status: OrderStatus) {
  switch (status) {
    case OrderStatus.pending: return 'bg-warning/10 text-warning border-warning/20';
    case OrderStatus.confirmed: return 'bg-primary/10 text-primary border-primary/20';
    case OrderStatus.delivered: return 'bg-success/10 text-success border-success/20';
    default: return '';
  }
}

export default function OrderManagement() {
  const { data: orders = [], isLoading } = useGetAllOrders();
  const updateStatus = useUpdateOrderStatus();

  const sortedOrders = [...orders].sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

  const handleStatusChange = async (orderId: bigint, status: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ orderId, status });
      toast.success('Order status updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">{orders.length} orders</p>
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total (₹)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Update Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No orders yet.
                </TableCell>
              </TableRow>
            ) : (
              sortedOrders.map(order => {
                const date = new Date(Number(order.createdAt) / 1_000_000);
                return (
                  <TableRow key={order.id.toString()}>
                    <TableCell className="font-mono text-sm">#{order.id.toString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell>{order.items.length}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(Number(order.totalPrice))}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeClass(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={val => handleStatusChange(order.id, val as OrderStatus)}
                        disabled={updateStatus.isPending}
                      >
                        <SelectTrigger className="w-36 h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
