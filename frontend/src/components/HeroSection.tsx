import React from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section
      className="relative min-h-[420px] md:min-h-[500px] flex items-center overflow-hidden"
      style={{
        backgroundImage: `url('/assets/generated/hero-banner.dim_1440x500.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />

      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-primary-foreground text-sm font-medium">🚀 Fast Delivery in 30 mins</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            Fresh Groceries,<br />
            <span className="text-primary">Delivered Fast</span>
          </h1>
          <p className="text-white/80 text-lg mb-8 leading-relaxed">
            Shop from thousands of fresh products — vegetables, fruits, dairy, and more — delivered right to your doorstep.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="gap-2 shadow-lg" asChild>
              <Link to="/products" search={{ category: undefined }}>
                <ShoppingBag className="h-5 w-5" />
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white" asChild>
              <Link to="/products" search={{ category: undefined }}>
                Browse Categories
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
