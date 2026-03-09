import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Category {
    id: bigint;
    name: string;
    description: string;
}
export type Time = bigint;
export interface PromoCode {
    discountValue: bigint;
    expiresAt: Time;
    code: string;
    discountType: DiscountType;
    minOrderValue: bigint;
    usageLimit: bigint;
    timesUsed: bigint;
}
export interface OrderItem {
    productId: bigint;
    quantity: bigint;
    price: bigint;
}
export interface Payment {
    id: bigint;
    status: PaymentStatus;
    paymentMethod: PaymentMethod;
    userId: Principal;
    orderId: bigint;
    timestamp: Time;
    amount: bigint;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    deliveryAddress: string;
    paymentMethod: PaymentMethod;
    userId: Principal;
    createdAt: Time;
    items: Array<OrderItem>;
    totalPrice: bigint;
}
export interface DeliverySettings {
    deliveryFee: bigint;
    freeDelivery: boolean;
    freeDeliveryThreshold: bigint;
}
export interface Offer {
    id: bigint;
    title: string;
    endDate: Time;
    createdAt: Time;
    description: string;
    discountPercentage: bigint;
    startDate: Time;
}
export interface Product {
    id: bigint;
    categoryId: bigint;
    inStock: boolean;
    name: string;
    description: string;
    imageUrl: string;
    discount?: bigint;
    price: bigint;
}
export interface UserProfile {
    displayName: string;
}
export enum DiscountType {
    percentage = "percentage",
    fixedAmount = "fixedAmount"
}
export enum OrderStatus {
    pending = "pending",
    delivered = "delivered",
    confirmed = "confirmed"
}
export enum PaymentMethod {
    upi = "upi",
    cashOnDelivery = "cashOnDelivery",
    card = "card"
}
export enum PaymentStatus {
    pending = "pending",
    paid = "paid",
    failed = "failed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(name: string, description: string, price: bigint, categoryId: bigint, imageUrl: string, stock: boolean): Promise<bigint>;
    applyPromoCode(code: string, orderTotal: bigint): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCategory(name: string, description: string): Promise<bigint>;
    createOffer(title: string, description: string, discountPercentage: bigint, startDate: Time, endDate: Time): Promise<bigint>;
    createPayment(orderId: bigint, amount: bigint, paymentMethod: PaymentMethod): Promise<bigint>;
    createProductDiscount(productId: bigint, discountPercentage: bigint): Promise<void>;
    createPromoCode(code: string, discountType: DiscountType, discountValue: bigint, minOrderValue: bigint, usageLimit: bigint, expiresInSeconds: bigint): Promise<void>;
    deleteCategory(id: bigint): Promise<void>;
    deleteOffer(id: bigint): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    deletePromoCode(code: string): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getAllPayments(): Promise<Array<Payment>>;
    getAllPromoCodes(): Promise<Array<PromoCode>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(): Promise<Array<Category>>;
    getDeliverySettings(): Promise<DeliverySettings>;
    getMyOrders(): Promise<Array<Order>>;
    getMyPayments(): Promise<Array<Payment>>;
    getOffers(): Promise<Array<Offer>>;
    getOrdersByUser(userId: Principal): Promise<Array<Order>>;
    getProduct(id: bigint): Promise<Product | null>;
    getProducts(): Promise<Array<Product>>;
    getProductsByCategory(categoryId: bigint): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(items: Array<OrderItem>, deliveryAddress: string, paymentMethod: PaymentMethod): Promise<Order | null>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCategory(id: bigint, name: string, description: string): Promise<void>;
    updateDeliverySettings(deliveryFee: bigint, freeDeliveryThreshold: bigint, freeDelivery: boolean): Promise<void>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
    updatePaymentStatus(paymentId: bigint, status: PaymentStatus): Promise<void>;
    updateProduct(id: bigint, name: string, description: string, price: bigint, categoryId: bigint, imageUrl: string, inStock: boolean): Promise<void>;
    upsertUserProfile(profile: UserProfile): Promise<void>;
}
