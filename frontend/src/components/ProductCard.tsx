import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatCurrency';
import type { Product } from '../backend';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const discountedPrice = product.discount
    ? Number(product.price) * (1 - Number(product.discount) / 100)
    : null;

  return (
    <Card className="group overflow-hidden hover:shadow-card-hover transition-all duration-300 border-border/60">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-secondary">
            🛒
          </div>
        )}
        {product.discount && (
          <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground font-bold">
            <Tag className="h-3 w-3 mr-1" />
            {Number(product.discount)}% OFF
          </Badge>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <Badge variant="secondary" className="text-sm font-semibold">Out of Stock</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{product.description}</p>
        )}
        <div className="flex items-center gap-2 mb-3">
          {discountedPrice !== null ? (
            <>
              <span className="font-bold text-primary">{formatCurrency(discountedPrice)}</span>
              <span className="text-xs text-muted-foreground line-through">{formatCurrency(Number(product.price))}</span>
            </>
          ) : (
            <span className="font-bold text-primary">{formatCurrency(Number(product.price))}</span>
          )}
        </div>
        <Button
          className="w-full"
          size="sm"
          disabled={!product.inStock}
          onClick={() => addItem(product)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardContent>
    </Card>
  );
}
