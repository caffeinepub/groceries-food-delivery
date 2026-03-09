import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useGetAllPayments, useUpdatePaymentStatus, PaymentStatus, PaymentMethod } from '../../hooks/useQueries';
import { formatCurrency } from '../../utils/formatCurrency';
import { useQueryClient } from '@tanstack/react-query';

const PAYMENT_STATUS_OPTIONS = [
  { value: PaymentStatus.pending, label: 'Pending' },
  { value: PaymentStatus.paid, label: 'Paid' },
  { value: PaymentStatus.failed, label: 'Failed' },
];

function getPaymentStatusClass(status: PaymentStatus) {
  switch (status) {
    case PaymentStatus.paid: return 'bg-success/10 text-success border-success/20';
    case PaymentStatus.pending: return 'bg-warning/10 text-warning border-warning/20';
    case PaymentStatus.failed: return 'bg-destructive/10 text-destructive border-destructive/20';
    default: return '';
  }
}

function getMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case PaymentMethod.cashOnDelivery: return 'Cash on Delivery';
    case PaymentMethod.upi: return 'UPI';
    case PaymentMethod.card: return 'Card';
    default: return 'Unknown';
  }
}

export default function PaymentManagement() {
  const { data: payments = [], isLoading } = useGetAllPayments();
  const updateStatus = useUpdatePaymentStatus();
  const queryClient = useQueryClient();

  const sortedPayments = [...payments].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  const handleStatusChange = async (paymentId: bigint, status: PaymentStatus) => {
    try {
      await updateStatus.mutateAsync({ paymentId, status });
      toast.success('Payment status updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update payment status');
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
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{payments.length} payments</p>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['allPayments'] })}
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Amount (₹)</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No payments yet.
                </TableCell>
              </TableRow>
            ) : (
              sortedPayments.map(payment => {
                const date = new Date(Number(payment.timestamp) / 1_000_000);
                return (
                  <TableRow key={payment.id.toString()}>
                    <TableCell className="font-mono text-sm">#{payment.id.toString()}</TableCell>
                    <TableCell className="font-mono text-sm">#{payment.orderId.toString()}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(Number(payment.amount))}</TableCell>
                    <TableCell className="text-sm">{getMethodLabel(payment.paymentMethod)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPaymentStatusClass(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={payment.status}
                        onValueChange={val => handleStatusChange(payment.id, val as PaymentStatus)}
                        disabled={updateStatus.isPending}
                      >
                        <SelectTrigger className="w-32 h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_STATUS_OPTIONS.map(opt => (
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
