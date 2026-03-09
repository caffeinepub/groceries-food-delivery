import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetMyOrders, useGetMyPayments } from '../hooks/useQueries';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import OrderCard from '../components/OrderCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardList, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import type { Payment } from '../backend';

export default function OrderHistoryPage() {
  const { identity } = useInternetIdentity();

  const {
    data: orders = [],
    isLoading: ordersLoading,
    refetch: refetchOrders,
    isFetching: ordersFetching,
  } = useGetMyOrders();

  const {
    data: payments = [],
    isLoading: paymentsLoading,
    refetch: refetchPayments,
  } = useGetMyPayments();

  const isLoading = ordersLoading || paymentsLoading;
  const isFetching = ordersFetching;

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <AccessDeniedScreen message="Please log in to view your order history." />
      </div>
    );
  }

  const sortedOrders = [...orders].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt)
  );

  // Build a map from orderId -> Payment for quick lookup
  const paymentByOrderId = new Map<string, Payment>();
  for (const payment of payments) {
    paymentByOrderId.set(payment.orderId.toString(), payment);
  }

  const handleRefresh = () => {
    refetchOrders();
    refetchPayments();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} total
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : sortedOrders.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <ClipboardList className="h-14 w-14 mx-auto mb-4 opacity-25" />
          <p className="text-xl font-semibold mb-1">No orders yet</p>
          <p className="text-sm">Your order history will appear here once you place an order.</p>
          <Button asChild className="mt-6">
            <Link to="/products" search={{ category: undefined }}>Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map(order => (
            <OrderCard
              key={order.id.toString()}
              order={order}
              payment={paymentByOrderId.get(order.id.toString())}
            />
          ))}
        </div>
      )}
    </div>
  );
}
