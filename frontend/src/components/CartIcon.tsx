import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '../context/CartContext';
import CartPanel from './CartPanel';

export default function CartIcon() {
  const { totalItems } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(true)}
        aria-label={`Cart (${totalItems} items)`}
      >
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center animate-fade-in">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </Button>
      <CartPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
