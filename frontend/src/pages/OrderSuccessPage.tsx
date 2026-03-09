import React from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { CheckCircle, Package, MapPin, ArrowRight, CreditCard, Truck, Tag, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '../utils/formatCurrency';

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cashOnDelivery: 'Cash on Delivery',
  upi: 'UPI',
  card: 'Card',
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
};

export default function OrderSuccessPage() {
  const search = useSearch({ from: '/order-success' });

  const s = search as Record<string, string>;
  const orderId = s.orderId ?? '';
  const total = parseFloat(s.total ?? '0');
  const subtotal = parseFloat(s.subtotal ?? '0');
  const deliveryCharge = parseFloat(s.deliveryCharge ?? '0');
  const offerDiscount = parseFloat(s.offerDiscount ?? '0');
  const promoDiscount = parseFloat(s.promoDiscount ?? '0');
  const promoCode = s.promoCode ?? '';
  const address = s.address ?? '';
  const itemsRaw = s.items ?? '[]';
  const paymentMethod = s.paymentMethod ?? '';
  const paymentStatus = s.paymentStatus ?? '';

  const isFreeDelivery = deliveryCharge === 0 && subtotal > 0;
  const hasBreakdown = subtotal > 0;

  let parsedItems: { name: string; quantity: number; price: number }[] = [];
  try {
    parsedItems = JSON.parse(itemsRaw);
  } catch {
    parsedItems = [];
  }

  const paymentStatusClass =
    PAYMENT_STATUS_STYLES[paymentStatus] ||
    'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Success Icon */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Order Placed Successfully!</h1>
          <p className="text-muted-foreground mt-2">
            Thank you for your order. We'll deliver it fresh to your doorstep.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-card rounded-2xl shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Order #{orderId}</span>
            </div>
            <span className="text-lg font-bold text-primary">{formatCurrency(total)}</span>
          </div>

          {address && (
            <>
              <Separator />
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{address}</p>
              </div>
            </>
          )}

          {parsedItems.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Items Ordered</p>
                {parsedItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Cost Breakdown */}
          {hasBreakdown && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Cost Breakdown</p>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    Delivery
                  </span>
                  {isFreeDelivery ? (
                    <span className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      FREE
                    </span>
                  ) : (
                    <span className="font-medium">{formatCurrency(deliveryCharge)}</span>
                  )}
                </div>

                {offerDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      Offer Discount
                    </span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      −{formatCurrency(offerDiscount)}
                    </span>
                  </div>
                )}

                {promoDiscount > 0 && promoCode && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5" />
                      Promo: {promoCode}
                    </span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      −{formatCurrency(promoDiscount)}
                    </span>
                  </div>
                )}

                <Separator className="mt-1" />
                <div className="flex justify-between text-sm font-bold">
                  <span>Total Paid</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
            </>
          )}

          {/* Payment Info */}
          {(paymentMethod || paymentStatus) && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Payment Information
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium text-foreground">
                    {PAYMENT_METHOD_LABELS[paymentMethod] || paymentMethod}
                  </span>
                </div>
                {paymentStatus && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Payment Status</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${paymentStatusClass}`}>
                      {PAYMENT_STATUS_LABELS[paymentStatus] || paymentStatus}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Estimated Delivery */}
        <div className="bg-primary/5 rounded-2xl p-4 text-center">
          <p className="text-sm font-medium text-foreground">🚚 Estimated Delivery</p>
          <p className="text-sm text-muted-foreground mt-1">Within 2–4 hours for local orders</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="outline" className="flex-1 rounded-xl">
            <Link to="/orders">View My Orders</Link>
          </Button>
          <Button asChild className="flex-1 rounded-xl">
            <Link to="/products" search={{ category: undefined }}>
              Continue Shopping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
