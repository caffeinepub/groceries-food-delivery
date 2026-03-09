import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, Home, Package, ClipboardList, Settings, Heart } from 'lucide-react';
import LoginButton from './LoginButton';
import CartIcon from './CartIcon';
import DemoBanner from './DemoBanner';
import RoleSwitcher from './RoleSwitcher';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';

export default function Layout() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const isAuthenticated = !!identity;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: '/products', search: { category: undefined } });
  };

  const navLinks = [
    { to: '/' as const, label: 'Home', icon: Home },
    { to: '/products' as const, label: 'Products', icon: Package },
    ...(isAuthenticated ? [{ to: '/orders' as const, label: 'My Orders', icon: ClipboardList }] : []),
    ...(isAdmin ? [{ to: '/admin' as const, label: 'Admin', icon: Settings }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DemoBanner />

      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b shadow-nav">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img
                src="/assets/generated/app-logo.dim_200x60.png"
                alt="Quick-Groceries logo"
                className="h-8 w-auto"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="font-display font-bold text-lg text-primary hidden sm:block">
                Quick-Groceries
              </span>
            </Link>

            {/* Search bar (desktop) */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search groceries..."
                  className="pl-9 pr-4 rounded-full bg-muted border-0 focus-visible:ring-primary"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 ml-auto">
              {navLinks.map(link => (
                <Button key={link.to} variant="ghost" size="sm" asChild>
                  <Link to={link.to}>
                    {link.label}
                  </Link>
                </Button>
              ))}
            </nav>

            <div className="flex items-center gap-2 ml-auto md:ml-2">
              <CartIcon />
              <div className="hidden md:block">
                <LoginButton />
              </div>
              {/* Mobile menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex flex-col gap-4 mt-6">
                    <form onSubmit={e => { handleSearch(e); setMobileOpen(false); }} className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search..."
                          className="pl-9"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button type="submit" size="icon" variant="outline">
                        <Search className="h-4 w-4" />
                      </Button>
                    </form>
                    <Separator />
                    <nav className="flex flex-col gap-1">
                      {navLinks.map(link => (
                        <Button
                          key={link.to}
                          variant="ghost"
                          className="justify-start gap-3"
                          asChild
                          onClick={() => setMobileOpen(false)}
                        >
                          <Link to={link.to}>
                            <link.icon className="h-4 w-4" />
                            {link.label}
                          </Link>
                        </Button>
                      ))}
                    </nav>
                    <Separator />
                    <LoginButton />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-auto">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-display font-bold text-xl text-primary">Quick-Groceries</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Fresh groceries delivered to your doorstep. Quality products, fast delivery, best prices.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                <li>
                  <Link to="/products" search={{ category: undefined }} className="hover:text-primary transition-colors">
                    Products
                  </Link>
                </li>
                {isAuthenticated && (
                  <li><Link to="/orders" className="hover:text-primary transition-colors">My Orders</Link></li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Categories</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {['Vegetables', 'Fruits', 'Dairy', 'Bakery', 'Beverages'].map(cat => (
                  <li key={cat}>
                    <Link
                      to="/products"
                      search={{ category: cat }}
                      className="hover:text-primary transition-colors"
                    >
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Separator className="mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Quick-Groceries. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Built with <Heart className="h-4 w-4 text-destructive fill-destructive mx-1" /> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'quick-groceries'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium ml-1"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      <RoleSwitcher />
    </div>
  );
}
