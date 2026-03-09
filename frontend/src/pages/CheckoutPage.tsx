import React, { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import {
  MapPin, ShoppingBag, ArrowLeft, Loader2, CreditCard, Smartphone, Banknote,
  Tag, Truck, CheckCircle, Gift,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart } from '../context/CartContext';
import {
  usePlaceOrder,
  useCreatePayment,
  useGetDeliverySettings,
  useGetOffers,
  useApplyPromoCode,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/formatCurrency';
import { PaymentMethod } from '../backend';
import type { Offer } from '../backend';

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: PaymentMethod.cashOnDelivery,
    label: 'Cash on Delivery',
    description: 'Pay when your order arrives',
    icon: <Banknote className="w-5 h-5" />,
  },
  {
    value: PaymentMethod.upi,
    label: 'UPI',
    description: 'Pay via UPI (GPay, PhonePe, Paytm)',
    icon: <Smartphone className="w-5 h-5" />,
  },
  {
    value: PaymentMethod.card,
    label: 'Card',
    description: 'Credit or Debit card',
    icon: <CreditCard className="w-5 h-5" />,
  },
];

function getActiveOffers(offers: Offer[]): Offer[] {
  const nowNs = BigInt(Date.now()) * 1_000_000n;
  return offers.filter(o => o.startDate <= nowNs && o.endDate >= nowNs);
}

function calculateOfferDiscount(offer: Offer, subtotalPaise: number): number {
  return Math.round((subtotalPaise * Number(offer.discountPercentage)) / 100);
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const placeOrder = usePlaceOrder();
  const createPayment = useCreatePayment();
  const applyPromoCode = useApplyPromoCode();

  const { data: deliverySettings } = useGetDeliverySettings();
  const { data: allOffers = [] } = useGetOffers();

  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const isAuthenticated = !!identity;
  const isSubmitting = placeOrder.isPending || createPayment.isPending;

  // subtotal is in paise (from CartContext)
  const deliveryFeePaise = deliverySettings
    ? (deliverySettings.freeDelivery || subtotal >= Number(deliverySettings.freeDeliveryThreshold))
      ? 0
      : Number(deliverySettings.deliveryFee)
    : 4000; // default ₹40

  const isFreeDelivery = deliveryFeePaise === 0;

  // Get active offers and best discount
  const activeOffers = getActiveOffers(allOffers);
  let bestOffer: Offer | null = null;
  let offerDiscount = 0;
  for (const offer of activeOffers) {
    const disc = calculateOfferDiscount(offer, subtotal);
    if (disc > offerDiscount) {
      offerDiscount = disc;
      bestOffer = offer;
    }
  }

  // Final total in paise
  const finalTotalPaise = Math.max(0, subtotal + deliveryFeePaise - offerDiscount - promoDiscount);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoError('');
    setIsValidatingPromo(true);
    try {
      // applyPromoCode returns the discounted total (orderTotal - discount)
      const discountedTotal = await applyPromoCode.mutateAsync({
        code: promoInput.trim().toUpperCase(),
        orderTotal: BigInt(subtotal),
      });
      const discount = subtotal - Number(discountedTotal);
      if (discount <= 0) {
        setPromoError('This promo code does not apply to your order');
        return;
      }
      setPromoDiscount(discount);
      setAppliedPromoCode(promoInput.trim().toUpperCase());
      toast.success(`Promo code applied! You save ${formatCurrency(discount)}`);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Invalid promo code';
      // Clean up ICP error message
      const clean = raw.replace(/.*Reject text:\s*/i, '').replace(/\(.*\)$/, '').trim();
      setPromoError(clean || 'Invalid or expired promo code');
      setPromoDiscount(0);
      setAppliedPromoCode('');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoDiscount(0);
    setAppliedPromoCode('');
    setPromoInput('');
    setPromoError('');
  };

  const handlePlaceOrder = async () => {
    if (!name.trim() || !address.trim()) {
      toast.error('Please fill in your name and delivery address');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!isAuthenticated) {
      toast.error('Please log in to place an order');
      return;
    }
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    const deliveryAddress = [name, phone, address].filter(Boolean).join(', ');

    // Build OrderItem array matching backend interface
    const orderItems = items.map(item => ({
      productId: item.product.id,
      quantity: BigInt(item.quantity),
      price: item.product.price,
    }));

    const itemsSnapshot = items.map(i => ({
      name: i.product.name,
      quantity: i.quantity,
      price: Number(i.product.price),
    }));

    try {
      const order = await placeOrder.mutateAsync({
        items: orderItems,
        deliveryAddress,
        paymentMethod: selectedPaymentMethod,
      });

      if (!order) {
        toast.error('Failed to place order. Please try again.');
        return;
      }

      // Create payment record
      await createPayment.mutateAsync({
        orderId: order.id,
        amount: BigInt(finalTotalPaise),
        paymentMethod: selectedPaymentMethod,
      });

      clearCart();

      navigate({
        to: '/order-success',
        search: {
          orderId: order.id.toString(),
          total: finalTotalPaise.toString(),
          subtotal: subtotal.toString(),
          deliveryCharge: deliveryFeePaise.toString(),
          offerDiscount: offerDiscount.toString(),
          promoDiscount: promoDiscount.toString(),
          promoCode: appliedPromoCode,
          address: deliveryAddress,
          items: JSON.stringify(itemsSnapshot),
          paymentMethod: selectedPaymentMethod,
          paymentStatus: 'pending',
        },
      });
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Failed to place order';
      const clean = raw.replace(/.*Reject text:\s*/i, '').replace(/\(.*\)$/, '').trim();
      toast.error(clean || 'Failed to place order');
    }
  };

  if (items.length === 0 && !placeOrder.isSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <ShoppingBag className="w-16 h-16 text-muted-foreground/30" />
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground">Add some items before checking out.</p>
        <Button asChild>
          <Link to="/products" search={{ category: undefined }}>Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" asChild className="mb-6 -ml-2">
          <Link to="/products" search={{ category: undefined }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
        </Button>

        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Delivery + Payment + Promo */}
          <div className="space-y-6">
            {/* Delivery Details */}
            <div className="bg-card rounded-2xl shadow-card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Delivery Details
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="House no., Street, City, State, PIN"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card rounded-2xl shadow-card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Method *
              </h2>
              <div className="space-y-3">
                {PAYMENT_OPTIONS.map(option => {
                  const isSelected = selectedPaymentMethod === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(option.value)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40 hover:bg-muted/30'
                      }`}
                    >
                      <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {option.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${isSelected ? 'text-primary' : ''}`}>
                          {option.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                      </div>
                      <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-primary' : 'border-muted-foreground/40'
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Promo Code */}
            <div className="bg-card rounded-2xl shadow-card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                Promo / Gift Code
              </h2>
              {appliedPromoCode ? (
                <div className="flex items-center justify-between bg-success/10 border border-success/20 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm font-semibold text-success">{appliedPromoCode}</span>
                    <span className="text-xs text-success/80">— {formatCurrency(promoDiscount)} off</span>
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    className="text-muted-foreground hover:text-foreground text-xs underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="Enter promo code"
                      className="font-mono uppercase"
                      onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyPromo}
                      disabled={isValidatingPromo || !promoInput.trim() || !isAuthenticated}
                    >
                      {isValidatingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                  {promoError && (
                    <p className="text-destructive text-xs">{promoError}</p>
                  )}
                  {!isAuthenticated && (
                    <p className="text-muted-foreground text-xs">Log in to apply promo codes</p>
                  )}
                </div>
              )}
            </div>

            {/* Active Offers */}
            {activeOffers.length > 0 && (
              <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-accent" />
                  Active Offers
                </h3>
                <div className="space-y-2">
                  {activeOffers.map(offer => (
                    <div key={offer.id.toString()} className="flex items-center justify-between text-sm">
                      <span className="text-foreground font-medium">{offer.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {Number(offer.discountPercentage)}% OFF
                      </Badge>
                    </div>
                  ))}
                </div>
                {bestOffer && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Best offer "{bestOffer.title}" automatically applied: saves {formatCurrency(offerDiscount)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl shadow-card p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.product.id.toString()} className="flex items-center gap-3">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted shrink-0 flex items-center justify-center text-xl">
                        🛒
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(Number(item.product.price))} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-semibold shrink-0">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="mb-4" />

              {/* Pricing breakdown */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5" /> Delivery
                  </span>
                  {isFreeDelivery ? (
                    <span className="text-success font-medium flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> FREE
                    </span>
                  ) : (
                    <span>{formatCurrency(deliveryFeePaise)}</span>
                  )}
                </div>
                {offerDiscount > 0 && bestOffer && (
                  <div className="flex justify-between">
                    <span className="text-accent flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" /> {bestOffer.title}
                    </span>
                    <span className="text-accent font-medium">−{formatCurrency(offerDiscount)}</span>
                  </div>
                )}
                {promoDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-success flex items-center gap-1">
                      <Gift className="h-3.5 w-3.5" /> Promo: {appliedPromoCode}
                    </span>
                    <span className="text-success font-medium">−{formatCurrency(promoDiscount)}</span>
                  </div>
                )}
                {deliverySettings && !isFreeDelivery && subtotal < Number(deliverySettings.freeDeliveryThreshold) && (
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                    Add {formatCurrency(Number(deliverySettings.freeDeliveryThreshold) - subtotal)} more for FREE delivery
                  </p>
                )}
              </div>

              <Separator className="mb-4" />

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-base">Total</span>
                <span className="font-bold text-xl text-primary">{formatCurrency(finalTotalPaise)}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isSubmitting || !isAuthenticated}
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Placing Order...</>
                ) : !isAuthenticated ? (
                  'Login to Place Order'
                ) : (
                  'Place Order'
                )}
              </Button>

              {!isAuthenticated && (
                <p className="text-center text-xs text-muted-foreground mt-3">
                  Please log in to complete your purchase
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
