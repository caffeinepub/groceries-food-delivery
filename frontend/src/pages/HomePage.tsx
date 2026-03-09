import React from 'react';
import { Link } from '@tanstack/react-router';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Truck, Leaf, Star, Clock, ChevronRight, Zap } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import ProductCard from '../components/ProductCard';
import { useGetProducts, useGetCategories } from '../hooks/useQueries';

const CATEGORY_EMOJIS: Record<string, string> = {
  Vegetables: '🥦',
  Fruits: '🍎',
  Dairy: '🥛',
  Bakery: '🍞',
  Beverages: '🧃',
  Meat: '🥩',
  Seafood: '🐟',
  Snacks: '🍿',
  Grains: '🌾',
  Spices: '🌶️',
};

const FEATURES = [
  { icon: Truck, title: 'Fast Delivery', desc: 'Delivered in 30 minutes', color: 'text-primary' },
  { icon: Leaf, title: 'Fresh Products', desc: '100% farm fresh', color: 'text-success' },
  { icon: Star, title: 'Best Prices', desc: 'Unbeatable deals daily', color: 'text-accent' },
  { icon: Clock, title: '24/7 Service', desc: 'Order anytime', color: 'text-primary' },
];

export default function HomePage() {
  const { data: products = [], isLoading: productsLoading } = useGetProducts();
  const { data: categories = [] } = useGetCategories();

  const featuredProducts = products.slice(0, 8);

  return (
    <div className="space-y-0">
      <HeroSection />

      {/* Features strip */}
      <section className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map(feature => (
              <div
                key={feature.title}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold">Shop by Category</h2>
              <p className="text-muted-foreground text-sm mt-1">Find exactly what you need</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link to="/products" search={{ category: undefined }}>
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {categories.map(cat => (
              <Link
                key={cat.id.toString()}
                to="/products"
                search={{ category: cat.name }}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 text-center shadow-sm hover:shadow-card"
              >
                <span className="text-3xl">{CATEGORY_EMOJIS[cat.name] || '🛒'}</span>
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Separator />

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-5 w-5 text-accent" />
              <h2 className="font-display text-2xl font-bold">Featured Products</h2>
            </div>
            <p className="text-muted-foreground text-sm">Hand-picked fresh items just for you</p>
          </div>
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link to="/products" search={{ category: undefined }}>
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Leaf className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No products yet</p>
            <p className="text-sm">Visit the Admin panel to add products or seed demo data.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map(product => (
              <ProductCard key={product.id.toString()} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
