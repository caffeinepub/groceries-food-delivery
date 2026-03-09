import React from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import ProfileSetupModal from './components/ProfileSetupModal';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import AdminPage from './pages/AdminPage';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';

// ─── Root layout ──────────────────────────────────────────────────────────────

function RootLayout() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      <Layout />
      <ProfileSetupModal open={showProfileSetup} onComplete={() => {}} />
    </>
  );
}

// ─── Routes ───────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  component: ProductsPage,
  validateSearch: (search: Record<string, unknown>) => ({
    category: typeof search.category === 'string' ? search.category : undefined,
  }),
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: CheckoutPage,
});

const orderSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order-success',
  component: OrderSuccessPage,
  validateSearch: (search: Record<string, unknown>) => ({
    orderId: typeof search.orderId === 'string' ? search.orderId : undefined,
    total: typeof search.total === 'string' ? search.total : undefined,
    subtotal: typeof search.subtotal === 'string' ? search.subtotal : undefined,
    deliveryCharge: typeof search.deliveryCharge === 'string' ? search.deliveryCharge : undefined,
    offerDiscount: typeof search.offerDiscount === 'string' ? search.offerDiscount : undefined,
    promoDiscount: typeof search.promoDiscount === 'string' ? search.promoDiscount : undefined,
    promoCode: typeof search.promoCode === 'string' ? search.promoCode : undefined,
    address: typeof search.address === 'string' ? search.address : undefined,
    items: typeof search.items === 'string' ? search.items : undefined,
    paymentMethod: typeof search.paymentMethod === 'string' ? search.paymentMethod : undefined,
    paymentStatus: typeof search.paymentStatus === 'string' ? search.paymentStatus : undefined,
  }),
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  component: OrderHistoryPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  productsRoute,
  checkoutRoute,
  orderSuccessRoute,
  ordersRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <CartProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </CartProvider>
    </ThemeProvider>
  );
}
