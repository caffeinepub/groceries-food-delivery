import React, { useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import { useGetProducts, useGetCategories } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search, Leaf, SlidersHorizontal } from 'lucide-react';
import { useSearch } from '@tanstack/react-router';

export default function ProductsPage() {
  const { data: products = [], isLoading: productsLoading } = useGetProducts();
  const { data: categories = [] } = useGetCategories();

  const search = useSearch({ from: '/products' }) as { category?: string };
  const initialCategory = search?.category ?? 'All';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');

  // Build a map from category name -> id for filtering
  const categoryNameToId = useMemo(() => {
    const map = new Map<string, bigint>();
    for (const cat of categories) {
      map.set(cat.name, cat.id);
    }
    return map;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      let matchesCategory = true;
      if (selectedCategory !== 'All') {
        const catId = categoryNameToId.get(selectedCategory);
        matchesCategory = catId !== undefined && p.categoryId === catId;
      }
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery, categoryNameToId]);

  const allCategories = ['All', ...categories.map(c => c.name)];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold mb-1">Fresh Products</h1>
        <p className="text-muted-foreground">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products…"
            className="pl-9"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="flex flex-wrap gap-1.5">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card border-border hover:bg-secondary hover:border-primary/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products grid */}
      {productsLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Leaf className="h-14 w-14 mx-auto mb-4 opacity-25" />
          <p className="text-xl font-semibold mb-1">No products found</p>
          <p className="text-sm">
            {searchQuery
              ? `No results for "${searchQuery}"`
              : `No products in "${selectedCategory}" category`}
          </p>
          {(searchQuery || selectedCategory !== 'All') && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-4 text-primary hover:underline text-sm font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.map(product => (
            <ProductCard key={product.id.toString()} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
