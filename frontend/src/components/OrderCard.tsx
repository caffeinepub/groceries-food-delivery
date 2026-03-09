import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, Package, Truck, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import type { Order, Payment } from '../backend';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../backend';

interface OrderCardProps {
  order: Order;
  payment?: Payment;
}

function getStatusConfig(status: OrderStatus) {
  switch (status) {
    case OrderStatus.pending:
      return { label: 'Pending', icon: Clock, className: 'bg-warning/10 text-warning border-warning/20' };
    case OrderStatus.confirmed:
      return { label: 'Confirmed', icon: Package, className: 'bg-primary/10 text-primary border-primary/20' };
    case OrderStatus.delivered:
      return { label: 'Delivered', icon: CheckCircle, className: 'bg-success/10 text-success border-success/20' };
    default:
      return { label: 'Unknown', icon: Clock, className: 'bg-muted text-muted-foreground' };
  }
}

function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case PaymentMethod.cashOnDelivery: return 'Cash on Delivery';
    case PaymentMethod.upi: return 'UPI';
    case PaymentMethod.card: return 'Card';
    default: return 'Unknown';
  }
}

function getPaymentStatusConfig(status: PaymentStatus) {
  switch (status) {
    case PaymentStatus.paid:
      return { label: 'Paid', className: 'bg-success/10 text-success border-success/20' };
    case PaymentStatus.pending:
      return { label: 'Pending', className: 'bg-warning/10 text-warning border-warning/20' };
    case PaymentStatus.failed:
      return { label: 'Failed', className: 'bg-destructive/10 text-destructive border-destructive/20' };
    default:
      return { label: 'Unknown', className: 'bg-muted text-muted-foreground' };
  }
}

export default function OrderCard({ order, payment }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  const date = new Date(Number(order.createdAt) / 1_000_000);
  const formattedDate = date.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  // Infer delivery fee: total - items sum
  const itemsTotal = order.items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const inferredDeliveryFee = Number(order.totalPrice) - itemsTotal;

  return (
    <Card className="overflow-hidden border-border/60 shadow-card">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <StatusIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm">Order #{order.id.toString()}</p>
              <p className="text-xs text-muted-foreground">{formattedDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className={statusConfig.className}>
              {statusConfig.label}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Summary row */}
        <div className="px-4 pb-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
          <span>•</span>
          <span className="font-semibold text-foreground">{formatCurrency(Number(order.totalPrice))}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CreditCard className="h-3 w-3" />
            {getPaymentMethodLabel(order.paymentMethod)}
          </span>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="border-t px-4 py-4 space-y-4 animate-fade-in">
            {/* Delivery address */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                <Truck className="h-3 w-3" /> Delivery Address
              </p>
              <p className="text-sm">{order.deliveryAddress}</p>
            </div>

            <Separator />

            {/* Items */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Items</p>
              <div className="space-y-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Product #{item.productId.toString()} × {item.quantity.toString()}
                    </span>
                    <span className="font-medium">{formatCurrency(Number(item.price) * Number(item.quantity))}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Cost breakdown */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items subtotal</span>
                <span>{formatCurrency(itemsTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery charge</span>
                <span className={inferredDeliveryFee === 0 ? 'text-success font-medium' : ''}>
                  {inferredDeliveryFee === 0 ? 'FREE' : formatCurrency(inferredDeliveryFee)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(Number(order.totalPrice))}</span>
              </div>
            </div>

            {/* Payment info */}
            {payment && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Payment</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="outline" className={getPaymentStatusConfig(payment.status).className}>
                      {getPaymentStatusConfig(payment.status).label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Method</span>
                    <span>{getPaymentMethodLabel(payment.paymentMethod)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
