import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  Product,
  Order,
  OrderItem,
  Category,
  Payment,
  DeliverySettings,
  Offer,
  PromoCode,
  UserProfile,
} from '../backend';
import { OrderStatus, PaymentMethod, PaymentStatus, DiscountType, UserRole } from '../backend';

export { OrderStatus, PaymentMethod, PaymentStatus, DiscountType, UserRole };

// ─── Products ────────────────────────────────────────────────────────────────

export function useGetProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProduct(id: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Product | null>({
    queryKey: ['product', id.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProduct(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProductsByCategory(categoryId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ['products', 'category', categoryId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProductsByCategory(categoryId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      price: bigint;
      categoryId: bigint;
      imageUrl: string;
      stock: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProduct(data.name, data.description, data.price, data.categoryId, data.imageUrl, data.stock);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      description: string;
      price: bigint;
      categoryId: bigint;
      imageUrl: string;
      inStock: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProduct(data.id, data.name, data.description, data.price, data.categoryId, data.imageUrl, data.inStock);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useCreateProductDiscount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { productId: bigint; discountPercentage: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProductDiscount(data.productId, data.discountPercentage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function useGetCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCategory(data.name, data.description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: bigint; name: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCategory(data.id, data.name, data.description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export function useGetMyOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ['myOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      items: OrderItem[];
      deliveryAddress: string;
      paymentMethod: PaymentMethod;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeOrder(data.items, data.deliveryAddress, data.paymentMethod);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { orderId: bigint; status: OrderStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrderStatus(data.orderId, data.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
    },
  });
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export function useGetMyPayments() {
  const { actor, isFetching } = useActor();
  return useQuery<Payment[]>({
    queryKey: ['myPayments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllPayments() {
  const { actor, isFetching } = useActor();
  return useQuery<Payment[]>({
    queryKey: ['allPayments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { orderId: bigint; amount: bigint; paymentMethod: PaymentMethod }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPayment(data.orderId, data.amount, data.paymentMethod);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPayments'] });
      queryClient.invalidateQueries({ queryKey: ['allPayments'] });
    },
  });
}

export function useUpdatePaymentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { paymentId: bigint; status: PaymentStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePaymentStatus(data.paymentId, data.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPayments'] });
      queryClient.invalidateQueries({ queryKey: ['myPayments'] });
    },
  });
}

// ─── Delivery Settings ────────────────────────────────────────────────────────

export function useGetDeliverySettings() {
  const { actor, isFetching } = useActor();
  return useQuery<DeliverySettings>({
    queryKey: ['deliverySettings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDeliverySettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateDeliverySettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { deliveryFee: bigint; freeDeliveryThreshold: bigint; freeDelivery: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateDeliverySettings(data.deliveryFee, data.freeDeliveryThreshold, data.freeDelivery);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliverySettings'] });
    },
  });
}

// ─── Offers ───────────────────────────────────────────────────────────────────

export function useGetOffers() {
  const { actor, isFetching } = useActor();
  return useQuery<Offer[]>({
    queryKey: ['offers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOffers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateOffer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      discountPercentage: bigint;
      startDate: bigint;
      endDate: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOffer(data.title, data.description, data.discountPercentage, data.startDate, data.endDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}

export function useDeleteOffer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteOffer(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}

// ─── Promo Codes ──────────────────────────────────────────────────────────────

export function useGetAllPromoCodes() {
  const { actor, isFetching } = useActor();
  return useQuery<PromoCode[]>({
    queryKey: ['allPromoCodes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPromoCodes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePromoCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      code: string;
      discountType: DiscountType;
      discountValue: bigint;
      minOrderValue: bigint;
      usageLimit: bigint;
      expiresInSeconds: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPromoCode(
        data.code,
        data.discountType,
        data.discountValue,
        data.minOrderValue,
        data.usageLimit,
        data.expiresInSeconds
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPromoCodes'] });
    },
  });
}

export function useDeletePromoCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePromoCode(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPromoCodes'] });
    },
  });
}

export function useApplyPromoCode() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: { code: string; orderTotal: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.applyPromoCode(data.code, data.orderTotal);
    },
  });
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Role Management ──────────────────────────────────────────────────────────

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignCallerUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { user: any; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(data.user, data.role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    },
  });
}
