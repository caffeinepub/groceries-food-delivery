import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCart } from '../context/CartContext';
import { useGetDeliverySettings } from '../hooks/useQueries';
import { formatCurrency } from '../utils/formatCurrency';
import { Minus, Plus, Trash2, ShoppingBag, Truck } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface CartPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function CartPanel({ open, onClose }: CartPanelProps) {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const { data: deliverySettings } = useGetDeliverySettings();
  const navigate = useNavigate();

  const deliveryFee = deliverySettings
    ? (deliverySettings.freeDelivery || subtotal >= Number(deliverySettings.freeDeliveryThreshold))
      ? 0
      : Number(deliverySettings.deliveryFee)
    : 0;

  const total = subtotal + deliveryFee;
  const freeDeliveryThreshold = deliverySettings ? Number(deliverySettings.freeDeliveryThreshold) : 0;
  const remaining = freeDeliveryThreshold - subtotal;

  const handleCheckout = () => {
    onClose();
    navigate({ to: '/checkout' });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Your Cart
            {items.length > 0 && (
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">Your cart is empty</p>
              <p className="text-muted-foreground text-sm mt-1">Add some fresh groceries to get started!</p>
            </div>
            <Button onClick={onClose} variant="outline">Continue Shopping</Button>
          </div>
        ) : (
          <>
            {deliverySettings && !deliverySettings.freeDelivery && remaining > 0 && (
              <div className="mx-4 mt-3 px-3 py-2 bg-accent/10 rounded-lg border border-accent/20 text-sm text-accent-foreground flex items-center gap-2">
                <Truck className="h-4 w-4 text-accent shrink-0" />
                <span>Add <strong>{formatCurrency(remaining)}</strong> more for free delivery!</span>
              </div>
            )}
            {deliverySettings && (deliverySettings.freeDelivery || subtotal >= Number(deliverySettings.freeDeliveryThreshold)) && (
              <div className="mx-4 mt-3 px-3 py-2 bg-success/10 rounded-lg border border-success/20 text-sm text-success flex items-center gap-2">
                <Truck className="h-4 w-4 shrink-0" />
                <span>🎉 You've unlocked <strong>free delivery!</strong></span>
              </div>
            )}

            <ScrollArea className="flex-1 px-4 py-2">
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.product.id.toString()} className="flex gap-3 p-3 bg-card rounded-xl border shadow-sm">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded-lg shrink-0 flex items-center justify-center text-2xl">
                        🛒
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product.name}</p>
                      <p className="text-primary font-semibold text-sm">{formatCurrency(Number(item.product.price))}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="px-4 py-4 border-t space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Truck className="h-3 w-3" /> Delivery
                  </span>
                  <span className={deliveryFee === 0 ? 'text-success font-medium' : 'font-medium'}>
                    {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
