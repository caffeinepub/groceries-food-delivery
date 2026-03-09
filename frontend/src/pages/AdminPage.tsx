import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, Package, ShoppingCart, Sprout, CheckCircle2, CreditCard, Tag } from 'lucide-react';
import ProductManagement from '../components/admin/ProductManagement';
import OrderManagement from '../components/admin/OrderManagement';
import PaymentManagement from '../components/admin/PaymentManagement';
import OffersManagement from '../components/admin/OffersManagement';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import {
  useIsCallerAdmin,
  useAddProduct,
  useCreateCategory,
  useGetCategories,
} from '../hooks/useQueries';
import { toast } from 'sonner';

// Demo grocery data to seed
const DEMO_CATEGORIES = [
  { name: 'Vegetables', description: 'Fresh farm vegetables' },
  { name: 'Fruits', description: 'Fresh seasonal fruits' },
  { name: 'Dairy', description: 'Milk, cheese, and dairy products' },
  { name: 'Bakery', description: 'Fresh baked goods' },
  { name: 'Beverages', description: 'Drinks and beverages' },
  { name: 'Grains', description: 'Rice, wheat, and pulses' },
];

const DEMO_PRODUCTS = [
  { name: 'Fresh Tomatoes', description: 'Farm fresh red tomatoes', price: 4000n, category: 'Vegetables', imageUrl: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400', stock: true },
  { name: 'Spinach', description: 'Organic baby spinach leaves', price: 3000n, category: 'Vegetables', imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400', stock: true },
  { name: 'Onions', description: 'Fresh red onions', price: 2500n, category: 'Vegetables', imageUrl: 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=400', stock: true },
  { name: 'Potatoes', description: 'Fresh potatoes from farm', price: 3500n, category: 'Vegetables', imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400', stock: true },
  { name: 'Bananas', description: 'Ripe yellow bananas', price: 5000n, category: 'Fruits', imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', stock: true },
  { name: 'Apples', description: 'Crisp red apples', price: 18000n, category: 'Fruits', imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', stock: true },
  { name: 'Mangoes', description: 'Sweet Alphonso mangoes', price: 25000n, category: 'Fruits', imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400', stock: true },
  { name: 'Full Cream Milk', description: 'Fresh full cream milk 1L', price: 6500n, category: 'Dairy', imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400', stock: true },
  { name: 'Paneer', description: 'Fresh homemade paneer 200g', price: 9000n, category: 'Dairy', imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400', stock: true },
  { name: 'Curd', description: 'Thick creamy curd 500g', price: 4500n, category: 'Dairy', imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', stock: true },
  { name: 'Whole Wheat Bread', description: 'Freshly baked whole wheat bread', price: 4500n, category: 'Bakery', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', stock: true },
  { name: 'Butter Croissant', description: 'Flaky buttery croissant', price: 3500n, category: 'Bakery', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', stock: true },
  { name: 'Orange Juice', description: 'Fresh squeezed orange juice 1L', price: 12000n, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', stock: true },
  { name: 'Green Tea', description: 'Premium green tea bags 25 pcs', price: 15000n, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', stock: true },
  { name: 'Basmati Rice', description: 'Premium aged basmati rice 1kg', price: 18000n, category: 'Grains', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', stock: true },
  { name: 'Toor Dal', description: 'Yellow toor dal 500g', price: 9500n, category: 'Grains', imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400', stock: true },
];

export default function AdminPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: categories = [] } = useGetCategories();
  const addProduct = useAddProduct();
  const createCategory = useCreateCategory();
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      // Create categories first
      const categoryMap = new Map<string, bigint>();
      for (const cat of DEMO_CATEGORIES) {
        const existing = categories.find(c => c.name === cat.name);
        if (existing) {
          categoryMap.set(cat.name, existing.id);
        } else {
          const id = await createCategory.mutateAsync({ name: cat.name, description: cat.description });
          categoryMap.set(cat.name, id);
        }
      }

      // Add products
      for (const product of DEMO_PRODUCTS) {
        const categoryId = categoryMap.get(product.category);
        if (!categoryId) continue;
        await addProduct.mutateAsync({
          name: product.name,
          description: product.description,
          price: product.price,
          categoryId,
          imageUrl: product.imageUrl,
          stock: product.stock,
        });
      }

      setSeeded(true);
      toast.success(`Seeded ${DEMO_PRODUCTS.length} grocery products across ${DEMO_CATEGORIES.length} categories!`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Seeding failed';
      toast.error(message);
    } finally {
      setSeeding(false);
    }
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen message="You need admin privileges to access this page." />;
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your grocery store products, orders, payments, and offers
            </p>
          </div>

          {/* Seed Grocery Data Button */}
          <Button
            onClick={handleSeed}
            disabled={seeding || seeded}
            variant="outline"
            className="rounded-xl gap-2 border-primary/30 hover:bg-primary/5"
          >
            {seeding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Seeding Grocery Items...
              </>
            ) : seeded ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Grocery Items Seeded
              </>
            ) : (
              <>
                <Sprout className="w-4 h-4 text-primary" />
                Seed Demo Data
              </>
            )}
          </Button>
        </div>

        {/* Info banner */}
        {!seeded && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-sm text-foreground">
            <p className="font-medium mb-1">🛒 Populate with Sample Grocery Data</p>
            <p className="text-muted-foreground">
              Click <strong>"Seed Demo Data"</strong> to automatically add{' '}
              {DEMO_PRODUCTS.length} popular grocery products across{' '}
              {DEMO_CATEGORIES.length} categories. Prices are in INR (paise).
            </p>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="products">
          <TabsList className="rounded-xl flex-wrap h-auto gap-1">
            <TabsTrigger value="products" className="rounded-lg gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg gap-2">
              <ShoppingCart className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="payments" className="rounded-lg gap-2">
              <CreditCard className="w-4 h-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="offers" className="rounded-lg gap-2">
              <Tag className="w-4 h-4" />
              Offers &amp; Coupons
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <PaymentManagement />
          </TabsContent>

          <TabsContent value="offers" className="mt-6">
            <OffersManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
