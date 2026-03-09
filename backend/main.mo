import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Migration "migration";

// Register migration in with-clause
(with migration = Migration.run)
actor {
  include MixinStorage();

  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    discount : ?Nat;
    categoryId : Nat;
    imageUrl : Text;
    inStock : Bool;
  };

  type Order = {
    id : Nat;
    userId : Principal;
    items : [OrderItem];
    totalPrice : Nat;
    status : OrderStatus;
    createdAt : Time.Time;
    deliveryAddress : Text;
    paymentMethod : PaymentMethod;
  };

  type OrderStatus = {
    #pending;
    #confirmed;
    #delivered;
  };

  type OrderItem = {
    productId : Nat;
    quantity : Nat;
    price : Nat;
  };

  type Category = {
    id : Nat;
    name : Text;
    description : Text;
  };

  type PromoCode = {
    code : Text;
    discountType : DiscountType;
    discountValue : Nat;
    minOrderValue : Nat;
    usageLimit : Nat;
    timesUsed : Nat;
    expiresAt : Time.Time;
  };

  type DiscountType = {
    #percentage;
    #fixedAmount;
  };

  type DeliverySettings = {
    deliveryFee : Nat;
    freeDeliveryThreshold : Nat;
    freeDelivery : Bool;
  };

  type Offer = {
    id : Nat;
    title : Text;
    description : Text;
    discountPercentage : Nat;
    startDate : Time.Time;
    endDate : Time.Time;
    createdAt : Time.Time;
  };

  type Payment = {
    id : Nat;
    orderId : Nat;
    userId : Principal;
    amount : Nat;
    status : PaymentStatus;
    paymentMethod : PaymentMethod;
    timestamp : Time.Time;
  };

  type PaymentStatus = {
    #pending;
    #paid;
    #failed;
  };

  type PaymentMethod = {
    #cashOnDelivery;
    #upi;
    #card;
  };

  type UserProfile = {
    displayName : Text;
  };

  var nextProductId = 1;
  var nextOrderId = 1;
  var nextCategoryId = 1;
  var nextOfferId = 1;
  var nextPaymentId = 1;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let products = Map.empty<Nat, Product>();
  let categories = Map.empty<Nat, Category>();
  let orders = Map.empty<Nat, Order>();
  let promoCodes = Map.empty<Text, PromoCode>();
  let offers = Map.empty<Nat, Offer>();
  let payments = Map.empty<Nat, Payment>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var deliverySettings : DeliverySettings = {
    deliveryFee = 4000;
    freeDeliveryThreshold = 40000;
    freeDelivery = false;
  };

  // ─── Category Functions ───────────────────────────────────────────────────

  // Admin-only: create category
  public shared ({ caller }) func createCategory(name : Text, description : Text) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can create categories");
    };

    let categoryId = nextCategoryId;
    nextCategoryId += 1;

    let category : Category = {
      id = categoryId;
      name;
      description;
    };

    categories.add(categoryId, category);
    categoryId;
  };

  // Admin-only: update category
  public shared ({ caller }) func updateCategory(id : Nat, name : Text, description : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can update categories");
    };

    let existing = categories.get(id);
    switch (existing) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) {
        let updatedCategory : Category = {
          id;
          name;
          description;
        };
        categories.add(id, updatedCategory);
      };
    };
  };

  // Admin-only: delete category
  public shared ({ caller }) func deleteCategory(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can delete categories");
    };
    switch (categories.get(id)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) { categories.remove(id) };
    };
  };

  // Public: read categories
  public query func getCategories() : async [Category] {
    categories.values().toArray();
  };

  // ─── Product Functions ────────────────────────────────────────────────────

  // Admin-only: create product
  public shared ({ caller }) func addProduct(
    name : Text,
    description : Text,
    price : Nat,
    categoryId : Nat,
    imageUrl : Text,
    stock : Bool,
  ) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can add products");
    };

    let productId = nextProductId;
    nextProductId += 1;

    let product : Product = {
      id = productId;
      name;
      description;
      price;
      discount = null;
      categoryId;
      imageUrl;
      inStock = stock;
    };

    products.add(productId, product);
    productId;
  };

  // Admin-only: update product
  public shared ({ caller }) func updateProduct(
    id : Nat,
    name : Text,
    description : Text,
    price : Nat,
    categoryId : Nat,
    imageUrl : Text,
    inStock : Bool,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can update products");
    };

    let existing = products.get(id);
    switch (existing) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let updatedProduct : Product = {
          product with
          name;
          description;
          price;
          categoryId;
          imageUrl;
          inStock;
        };
        products.add(id, updatedProduct);
      };
    };
  };

  // Admin-only: delete product
  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can delete products");
    };
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) { products.remove(id) };
    };
  };

  // Public: read all products
  public query func getProducts() : async [Product] {
    products.values().toArray();
  };

  // Public: read products by category
  public query func getProductsByCategory(categoryId : Nat) : async [Product] {
    let result = List.empty<Product>();
    let allProducts = products.values().toArray();

    for (product in allProducts.values()) {
      if (product.categoryId == categoryId) {
        result.add(product);
      };
    };
    result.toArray();
  };

  // Public: get single product
  public query func getProduct(id : Nat) : async ?Product {
    products.get(id);
  };

  // Admin-only: set product discount
  public shared ({ caller }) func createProductDiscount(productId : Nat, discountPercentage : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can create discounts");
    };

    let product = products.get(productId);
    switch (product) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) {
        if (discountPercentage > 100 or discountPercentage == 0) {
          Runtime.trap("Invalid discount percentage");
        };
        let discountedProduct = {
          p with discount = ?discountPercentage
        };
        products.add(productId, discountedProduct);
      };
    };
  };

  // ─── Delivery Settings Functions ──────────────────────────────────────────

  // Admin-only: update delivery settings
  public shared ({ caller }) func updateDeliverySettings(
    deliveryFee : Nat,
    freeDeliveryThreshold : Nat,
    freeDelivery : Bool
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can update delivery settings");
    };

    deliverySettings := {
      deliveryFee;
      freeDeliveryThreshold;
      freeDelivery;
    };
  };

  // Public: read delivery settings
  public query func getDeliverySettings() : async DeliverySettings {
    deliverySettings;
  };

  // ─── Order Functions ──────────────────────────────────────────────────────

  // User-only: place an order
  public shared ({ caller }) func placeOrder(
    items : [OrderItem],
    deliveryAddress : Text,
    paymentMethod : PaymentMethod
  ) : async ?Order {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Only authenticated users can place orders");
    };

    let orderId = nextOrderId;
    nextOrderId += 1;

    var totalPrice : Nat = 0;
    for (item in items.values()) {
      totalPrice += item.price * item.quantity;
    };

    let order : Order = {
      id = orderId;
      userId = caller;
      items;
      totalPrice;
      status = #pending;
      createdAt = Time.now();
      deliveryAddress;
      paymentMethod;
    };

    orders.add(orderId, order);
    ?order;
  };

  // User-only: get own orders (caller must match userId, or caller must be admin)
  public query ({ caller }) func getOrdersByUser(userId : Principal) : async [Order] {
    // Only the user themselves or an admin can view a user's orders
    if (not Principal.equal(caller, userId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You can only view your own orders");
    };
    // Additionally, the caller must be at least a user (not a guest) unless they are admin
    if (not AccessControl.isAdmin(accessControlState, caller) and not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Only authenticated users can view orders");
    };

    let result = List.empty<Order>();
    let allOrders = orders.values().toArray();

    for (order in allOrders.values()) {
      if (Principal.equal(order.userId, userId)) {
        result.add(order);
      };
    };
    result.toArray();
  };

  // User-only: get caller's own orders
  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Only authenticated users can view their orders");
    };

    let result = List.empty<Order>();
    let allOrders = orders.values().toArray();

    for (order in allOrders.values()) {
      if (Principal.equal(order.userId, caller)) {
        result.add(order);
      };
    };
    result.toArray();
  };

  // Admin-only: get all orders
  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can view all orders");
    };
    orders.values().toArray();
  };

  // Admin-only: update order status
  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can update order status");
    };

    let existing = orders.get(orderId);
    switch (existing) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = {
          order with status
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  // ─── Promo Code Functions ─────────────────────────────────────────────────

  // Admin-only: create promo code
  public shared ({ caller }) func createPromoCode(
    code : Text,
    discountType : DiscountType,
    discountValue : Nat,
    minOrderValue : Nat,
    usageLimit : Nat,
    expiresInSeconds : Int
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can create promo codes");
    };

    let promoCode : PromoCode = {
      code;
      discountType;
      discountValue;
      minOrderValue;
      usageLimit;
      timesUsed = 0;
      expiresAt = Time.now() + (expiresInSeconds * 1_000_000_000);
    };

    promoCodes.add(code, promoCode);
  };

  // Admin-only: delete promo code
  public shared ({ caller }) func deletePromoCode(code : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can delete promo codes");
    };
    switch (promoCodes.get(code)) {
      case (null) { Runtime.trap("Promo code not found") };
      case (?_) { promoCodes.remove(code) };
    };
  };

  // Admin-only: list all promo codes
  public query ({ caller }) func getAllPromoCodes() : async [PromoCode] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can list all promo codes");
    };
    promoCodes.values().toArray();
  };

  // User-only: validate and apply a promo code to an order total
  // Returns the discounted total or traps with an error message
  public shared ({ caller }) func applyPromoCode(code : Text, orderTotal : Nat) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Only authenticated users can apply promo codes");
    };

    let maybePromo = promoCodes.get(code);
    switch (maybePromo) {
      case (null) { Runtime.trap("Promo code not found") };
      case (?promo) {
        if (promo.timesUsed >= promo.usageLimit) {
          Runtime.trap("Promo code usage limit reached");
        };
        if (Time.now() > promo.expiresAt) {
          Runtime.trap("Promo code has expired");
        };
        if (orderTotal < promo.minOrderValue) {
          Runtime.trap("Order total does not meet minimum order value for this promo code");
        };

        // Update usage count
        let updatedPromo = { promo with timesUsed = promo.timesUsed + 1 };
        promoCodes.add(code, updatedPromo);

        // Calculate discounted total
        switch (promo.discountType) {
          case (#percentage) {
            let discount = (orderTotal * promo.discountValue) / 100;
            if (discount >= orderTotal) { 0 } else { orderTotal - discount };
          };
          case (#fixedAmount) {
            if (promo.discountValue >= orderTotal) { 0 } else { orderTotal - promo.discountValue };
          };
        };
      };
    };
  };

  // ─── Promotional Offers Functions ─────────────────────────────────────────

  // Admin-only: create offer
  public shared ({ caller }) func createOffer(
    title : Text,
    description : Text,
    discountPercentage : Nat,
    startDate : Time.Time,
    endDate : Time.Time
  ) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can create offers");
    };

    let offerId = nextOfferId;
    nextOfferId += 1;

    let offer : Offer = {
      id = offerId;
      title;
      description;
      discountPercentage;
      startDate;
      endDate;
      createdAt = Time.now();
    };

    offers.add(offerId, offer);
    offerId;
  };

  // Admin-only: delete offer
  public shared ({ caller }) func deleteOffer(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can delete offers");
    };
    switch (offers.get(id)) {
      case (null) { Runtime.trap("Offer not found") };
      case (?_) { offers.remove(id) };
    };
  };

  // Public: list all offers
  public query func getOffers() : async [Offer] {
    offers.values().toArray();
  };

  // ─── Payment Functions ────────────────────────────────────────────────────

  // User-only: create a payment record
  public shared ({ caller }) func createPayment(
    orderId : Nat,
    amount : Nat,
    paymentMethod : PaymentMethod
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Only authenticated users can create payments");
    };

    // Verify the order belongs to the caller
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (not Principal.equal(order.userId, caller)) {
          Runtime.trap("Unauthorized: You can only create payments for your own orders");
        };
      };
    };

    let paymentId = nextPaymentId;
    nextPaymentId += 1;

    let payment : Payment = {
      id = paymentId;
      orderId;
      userId = caller;
      amount;
      status = #pending;
      paymentMethod;
      timestamp = Time.now();
    };

    payments.add(paymentId, payment);
    paymentId;
  };

  // Admin-only: update payment status
  public shared ({ caller }) func updatePaymentStatus(paymentId : Nat, status : PaymentStatus) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can update payment status");
    };

    let existing = payments.get(paymentId);
    switch (existing) {
      case (null) { Runtime.trap("Payment not found") };
      case (?payment) {
        let updatedPayment = {
          payment with status
        };
        payments.add(paymentId, updatedPayment);
      };
    };
  };

  // Admin-only: get all payments
  public query ({ caller }) func getAllPayments() : async [Payment] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can view all payments");
    };
    payments.values().toArray();
  };

  // User-only: get caller's own payments
  public query ({ caller }) func getMyPayments() : async [Payment] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Only authenticated users can view their payments");
    };

    let result = List.empty<Payment>();
    for (payment in payments.values()) {
      if (Principal.equal(payment.userId, caller)) {
        result.add(payment);
      };
    };
    result.toArray();
  };

  // ─── User Profile Functions ───────────────────────────────────────────────

  // User-only: get caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Only authenticated users can get their profile");
    };
    userProfiles.get(caller);
  };

  // User-only: save caller's own profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Only authenticated users can save their profile");
    };
    userProfiles.add(caller, profile);
  };

  // Caller must be the user themselves or an admin
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not Principal.equal(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You can only view your own profile");
    };
    userProfiles.get(user);
  };

  // User-only: upsert caller's own profile (alias for saveCallerUserProfile)
  public shared ({ caller }) func upsertUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Only authenticated users can save their profile");
    };
    userProfiles.add(caller, profile);
  };
};
