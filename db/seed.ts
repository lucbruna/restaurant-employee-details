import bcrypt from 'bcryptjs';

import { db, sqlite } from './index';
import * as schema from './schema';

const OUTLET_ID = 'outlet-1';
const CASHIER_ID = 'user-3';
const PRIMARY_WAITER_ID = 'user-4';
const SECONDARY_WAITER_ID = 'user-6';

type OrderLineSpec = {
  itemId: string;
  quantity: number;
  modifierIds?: string[];
  itemNote?: string;
  unitPrice?: number;
};

type OrderSeedSpec = {
  id: string;
  orderNumber: string;
  serviceDate: string;
  time: string;
  orderType: 'dine_in' | 'takeaway' | 'delivery' | 'online';
  status: 'active' | 'paid';
  tableId?: string | null;
  customerId?: string | null;
  paxCount?: number;
  waiterId?: string;
  discountAmount?: number;
  paymentMethod?: 'cash' | 'card' | 'upi' | 'wallet' | 'complimentary';
  paymentReference?: string | null;
  transactionId?: string | null;
  kotStatus?: 'pending' | 'preparing' | 'ready' | 'served';
  specialInstructions?: string | null;
  items: OrderLineSpec[];
};

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function atIst(serviceDate: string, time: string) {
  return new Date(`${serviceDate}T${time}:00+05:30`).toISOString();
}

function shiftMinutes(isoString: string, minutes: number) {
  return new Date(new Date(isoString).getTime() + minutes * 60 * 1000).toISOString();
}

async function seed() {
  console.log('Seeding database...');

  const tables = [
    schema.auditLogs, schema.dayEndReports, schema.reservations, schema.onlineOrders, schema.onlineOrderSources,
    schema.staffAttendance, schema.purchaseOrderItems, schema.purchaseOrders, schema.suppliers, schema.itemInventoryMap,
    schema.inventoryTransactions, schema.inventoryItems, schema.paymentSplits, schema.payments, schema.paymentAttempts, schema.kotItems, schema.kots,
    schema.orderItemModifiers, schema.orderItems, schema.orders, schema.loyaltyTransactions, schema.customers,
    schema.coupons, schema.discounts, schema.taxCategories, schema.menuItemVariants, schema.modifiers, schema.itemModifierGroups,
    schema.modifierGroups, schema.menuItems, schema.menuCategories, schema.tables, schema.tableSections, schema.users,
    schema.roles, schema.outlets,
  ];

  sqlite.pragma('foreign_keys = OFF');
  try {
    for (const table of tables) {
      await db.delete(table);
    }
  } finally {
    sqlite.pragma('foreign_keys = ON');
  }

  const [outlet] = await db.insert(schema.outlets).values({
    id: OUTLET_ID,
    name: 'Spice Garden Restaurant',
    address: 'Plot 42, Dharampeth, Nagpur, Maharashtra 440010',
    city: 'Nagpur',
    state: 'Maharashtra',
    gstin: '27AABCS1429B1ZB',
    fssaiNumber: '11224000000123',
    phone: '+91 98765 43210',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    settings: {
      brandTone: 'Modern Indian dining',
      openingHours: '11:00 AM - 11:30 PM',
      serviceModes: ['dine_in', 'takeaway', 'delivery', 'online'],
      payments: {
        defaultProvider: 'manual',
        providers: {
          manual: {
            enabled: true,
            mode: 'sandbox',
            displayName: 'Manual POS Settlement',
            supportedMethods: ['cash', 'card', 'upi', 'wallet', 'complimentary'],
          },
          stripe: {
            enabled: false,
            mode: 'sandbox',
            displayName: 'Stripe',
            supportedMethods: ['card', 'wallet'],
            publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null,
          },
          razorpay: {
            enabled: false,
            mode: 'sandbox',
            displayName: 'Razorpay',
            supportedMethods: ['card', 'upi', 'wallet'],
            keyId: process.env.RAZORPAY_KEY_ID ?? null,
          },
        },
      },
    },
  }).returning();

  const rolesData = [
    { id: 'role-owner', name: 'owner', permissions: ['all'] },
    { id: 'role-manager', name: 'manager', permissions: ['manage_menu', 'manage_staff', 'view_reports', 'pos_access', 'manage_inventory'] },
    { id: 'role-cashier', name: 'cashier', permissions: ['pos_access', 'process_payments', 'view_orders'] },
    { id: 'role-waiter', name: 'waiter', permissions: ['pos_access', 'create_orders', 'view_tables'] },
    { id: 'role-kitchen', name: 'kitchen', permissions: ['kitchen_display', 'view_orders'] },
  ];
  await db.insert(schema.roles).values(rolesData);

  const hashPassword = (value: string) => bcrypt.hashSync(value, 10);
  const hashPin = (value: string) => bcrypt.hashSync(value, 10);

  const usersData = [
    { id: 'user-1', name: 'Admin', email: 'admin@admin.com', passwordHash: hashPassword('admin'), pinHash: hashPin('1111'), roleId: 'role-owner', outletId: outlet.id },
    { id: 'user-2', name: 'Priya Deshmukh', email: 'manager@spicegarden.com', passwordHash: hashPassword('Mgr@123'), pinHash: hashPin('2222'), roleId: 'role-manager', outletId: outlet.id, avatarUrl: '/avatars/priya.png' },
    { id: 'user-3', name: 'Amit Patil', email: 'cashier@spicegarden.com', passwordHash: hashPassword('Cash@123'), pinHash: hashPin('3333'), roleId: 'role-cashier', outletId: outlet.id, avatarUrl: '/avatars/amit.png' },
    { id: 'user-4', name: 'Suresh Kumar', email: 'waiter1@spicegarden.com', passwordHash: hashPassword('Wait@123'), pinHash: hashPin('4444'), roleId: 'role-waiter', outletId: outlet.id },
    { id: 'user-5', name: 'Mohan Yadav', email: 'kitchen@spicegarden.com', passwordHash: hashPassword('Kitch@123'), pinHash: hashPin('5555'), roleId: 'role-kitchen', outletId: outlet.id },
    { id: 'user-6', name: 'Kavya Singh', email: 'waiter2@spicegarden.com', passwordHash: hashPassword('Wait@456'), pinHash: hashPin('6666'), roleId: 'role-waiter', outletId: outlet.id },
  ];
  await db.insert(schema.users).values(usersData);

  const taxCategoriesData = [
    { id: 'tax-food', outletId: outlet.id, name: 'Food GST 5%', cgstRate: 2.5, sgstRate: 2.5, igstRate: 0, isServiceCharge: false },
    { id: 'tax-bev', outletId: outlet.id, name: 'Beverage GST 18%', cgstRate: 9, sgstRate: 9, igstRate: 0, isServiceCharge: false },
    { id: 'tax-svc', outletId: outlet.id, name: 'Service Charge 5%', cgstRate: 0, sgstRate: 0, igstRate: 0, isServiceCharge: true },
  ];
  await db.insert(schema.taxCategories).values(taxCategoriesData);

  const discountsData = [
    { id: 'discount-lunch', outletId: outlet.id, name: 'Lunch Special', type: 'percent', value: 10, minOrderAmount: 600, maxDiscountAmount: 150, isActive: true, validFrom: '2026-03-01', validUntil: '2026-04-30' },
    { id: 'discount-loyalty', outletId: outlet.id, name: 'Loyalty Flat Off', type: 'flat', value: 75, minOrderAmount: 500, maxDiscountAmount: 75, isActive: true, validFrom: '2026-03-01', validUntil: '2026-04-30' },
  ];
  await db.insert(schema.discounts).values(discountsData);

  await db.insert(schema.coupons).values([
    { id: 'coupon-lunch-10', outletId: outlet.id, code: 'LUNCH10', discountId: 'discount-lunch', usageLimit: 200, usedCount: 18, isActive: true },
    { id: 'coupon-loyal-75', outletId: outlet.id, code: 'LOYAL75', discountId: 'discount-loyalty', usageLimit: 150, usedCount: 34, isActive: true },
  ]);

  const categoriesData = [
    { id: 'cat-starters', outletId: outlet.id, name: 'Starters', emoji: '🥗', displayOrder: 1, isActive: true },
    { id: 'cat-mains', outletId: outlet.id, name: 'Main Course', emoji: '🍛', displayOrder: 2, isActive: true },
    { id: 'cat-rice', outletId: outlet.id, name: 'Rice & Biryani', emoji: '🍚', displayOrder: 3, isActive: true },
    { id: 'cat-breads', outletId: outlet.id, name: 'Breads', emoji: '🫓', displayOrder: 4, isActive: true },
    { id: 'cat-beverages', outletId: outlet.id, name: 'Beverages', emoji: '🥤', displayOrder: 5, isActive: true },
    { id: 'cat-desserts', outletId: outlet.id, name: 'Desserts', emoji: '🍮', displayOrder: 6, isActive: true },
    { id: 'cat-combos', outletId: outlet.id, name: 'Combos', emoji: '🍱', displayOrder: 7, isActive: true },
  ];
  await db.insert(schema.menuCategories).values(categoriesData);

  const menuArtwork = {
    starters: '/menu/generic-starters.svg',
    mains: '/menu/generic-mains.svg',
    rice: '/menu/generic-rice.svg',
    breads: '/menu/generic-breads.svg',
    beverages: '/menu/generic-beverages.svg',
    desserts: '/menu/generic-desserts.svg',
    combos: '/menu/generic-combos.svg',
  } as const;

  const menuItemsData = [
    { id: 'item-1', categoryId: 'cat-starters', outletId: outlet.id, name: 'Paneer Tikka', description: 'Char-grilled cottage cheese with mint chutney.', shortCode: 'PTK', imageUrl: menuArtwork.starters, basePrice: 220, foodType: 'veg', taxCategoryId: 'tax-food', isActive: true, isBestseller: true, isChefsSpecial: false, spiceLevel: 2, prepTimeMinutes: 18, displayOrder: 1, tags: ['grilled', 'starter'] },
    { id: 'item-2', categoryId: 'cat-starters', outletId: outlet.id, name: 'Chicken Tikka', description: 'Juicy tikka skewers finished in the tandoor.', shortCode: 'CTK', imageUrl: menuArtwork.starters, basePrice: 280, foodType: 'non_veg', taxCategoryId: 'tax-food', isActive: true, isBestseller: true, isChefsSpecial: false, spiceLevel: 3, prepTimeMinutes: 20, displayOrder: 2, tags: ['tandoor', 'starter'] },
    { id: 'item-3', categoryId: 'cat-starters', outletId: outlet.id, name: 'Crispy Corn Chaat', description: 'Sweet corn tossed with chaat masala and herbs.', shortCode: 'CCC', imageUrl: menuArtwork.starters, basePrice: 180, foodType: 'veg', taxCategoryId: 'tax-food', isActive: true, isBestseller: false, isChefsSpecial: true, spiceLevel: 1, prepTimeMinutes: 12, displayOrder: 3, tags: ['chaat', 'snack'] },
    { id: 'item-4', categoryId: 'cat-mains', outletId: outlet.id, name: 'Butter Chicken', description: 'Classic creamy tomato curry with smoky chicken.', shortCode: 'BCH', imageUrl: menuArtwork.mains, basePrice: 320, foodType: 'non_veg', taxCategoryId: 'tax-food', isActive: true, isBestseller: true, isChefsSpecial: false, spiceLevel: 2, prepTimeMinutes: 20, displayOrder: 1, tags: ['curry', 'signature'] },
    { id: 'item-5', categoryId: 'cat-mains', outletId: outlet.id, name: 'Dal Makhani', description: 'Slow cooked black lentils with cream and butter.', shortCode: 'DMK', imageUrl: menuArtwork.mains, basePrice: 240, foodType: 'veg', taxCategoryId: 'tax-food', isActive: true, isBestseller: true, isChefsSpecial: false, spiceLevel: 1, prepTimeMinutes: 16, displayOrder: 2, tags: ['dal', 'comfort'] },
    { id: 'item-6', categoryId: 'cat-mains', outletId: outlet.id, name: 'Kadhai Paneer', description: 'Paneer and peppers in a bold kadhai masala.', shortCode: 'KDP', imageUrl: menuArtwork.mains, basePrice: 290, foodType: 'veg', taxCategoryId: 'tax-food', isActive: true, isBestseller: false, isChefsSpecial: true, spiceLevel: 3, prepTimeMinutes: 18, displayOrder: 3, tags: ['paneer', 'spicy'] },
    { id: 'item-7', categoryId: 'cat-rice', outletId: outlet.id, name: 'Chicken Biryani', description: 'Long grain dum biryani with salan and raita.', shortCode: 'CBY', imageUrl: menuArtwork.rice, basePrice: 350, foodType: 'non_veg', taxCategoryId: 'tax-food', isActive: true, isBestseller: true, isChefsSpecial: false, spiceLevel: 3, prepTimeMinutes: 24, displayOrder: 1, tags: ['biryani', 'rice'] },
    { id: 'item-8', categoryId: 'cat-rice', outletId: outlet.id, name: 'Veg Pulao', description: 'Fragrant basmati with seasonal vegetables.', shortCode: 'VPL', imageUrl: menuArtwork.rice, basePrice: 220, foodType: 'veg', taxCategoryId: 'tax-food', isActive: true, isBestseller: false, isChefsSpecial: false, spiceLevel: 1, prepTimeMinutes: 16, displayOrder: 2, tags: ['rice', 'veg'] },
    { id: 'item-9', categoryId: 'cat-breads', outletId: outlet.id, name: 'Garlic Naan', description: 'Tandoor naan brushed with garlic butter.', shortCode: 'GN', imageUrl: menuArtwork.breads, basePrice: 60, foodType: 'veg', taxCategoryId: 'tax-food', isActive: true, isBestseller: true, isChefsSpecial: false, spiceLevel: 0, prepTimeMinutes: 8, displayOrder: 1, tags: ['bread', 'naan'] },
    { id: 'item-10', categoryId: 'cat-breads', outletId: outlet.id, name: 'Butter Naan', description: 'Soft naan finished with white butter.', shortCode: 'BN', imageUrl: menuArtwork.breads, basePrice: 50, foodType: 'veg', taxCategoryId: 'tax-food', isActive: true, isBestseller: true, isChefsSpecial: false, spiceLevel: 0, prepTimeMinutes: 8, displayOrder: 2, tags: ['bread', 'naan'] },
    { id: 'item-11', categoryId: 'cat-breads', outletId: outlet.id, name: 'Tandoori Roti', description: 'Whole wheat roti from the tandoor.', shortCode: 'TRT', imageUrl: menuArtwork.breads, basePrice: 35, foodType: 'veg', taxCategoryId: 'tax-food', isActive: true, isBestseller: false, isChefsSpecial: false, spiceLevel: 0, prepTimeMinutes: 7, displayOrder: 3, tags: ['bread', 'roti'] },
    { id: 'item-12', categoryId: 'cat-beverages', outletId: outlet.id, name: 'Sweet Lassi', description: 'Thick yogurt lassi finished with saffron.', shortCode: 'LAS', imageUrl: menuArtwork.beverages, basePrice: 80, foodType: 'veg', taxCategoryId: 'tax-bev', isActive: true, isBestseller: true, isChefsSpecial: false, spiceLevel: 0, prepTimeMinutes: 5, displayOrder: 1, tags: ['drink', 'lassi'] },
    { id: 'item-13', categoryId: 'cat-beverages', outletId: outlet.id, name: 'Masala Chaas', description: 'Spiced buttermilk with roasted cumin.', shortCode: 'CHA', imageUrl: menuArtwork.beverages, basePrice: 65, foodType: 'veg', taxCategoryId: 'tax-bev', isActive: true, isBestseller: false, isChefsSpecial: false, spiceLevel: 0, prepTimeMinutes: 4, displayOrder: 2, tags: ['drink', 'chaas'] },
    { id: 'item-14', categoryId: 'cat-desserts', outletId: outlet.id, name: 'Gulab Jamun', description: 'Warm gulab jamun with rose syrup.', shortCode: 'GJ', imageUrl: menuArtwork.desserts, basePrice: 90, foodType: 'veg', taxCategoryId: 'tax-food', isActive: true, isBestseller: true, isChefsSpecial: false, spiceLevel: 0, prepTimeMinutes: 4, displayOrder: 1, tags: ['dessert', 'sweet'] },
    { id: 'item-15', categoryId: 'cat-desserts', outletId: outlet.id, name: 'Sizzling Brownie', description: 'Brownie on hot plate with vanilla ice cream.', shortCode: 'SBR', imageUrl: menuArtwork.desserts, basePrice: 180, foodType: 'veg', taxCategoryId: 'tax-food', isActive: true, isBestseller: false, isChefsSpecial: true, spiceLevel: 0, prepTimeMinutes: 6, displayOrder: 2, tags: ['dessert', 'signature'] },
    { id: 'item-16', categoryId: 'cat-combos', outletId: outlet.id, name: 'Family Feast Combo', description: 'Butter chicken, dal, biryani, naan and desserts for four.', shortCode: 'FFC', imageUrl: menuArtwork.combos, basePrice: 899, foodType: 'non_veg', taxCategoryId: 'tax-food', isActive: true, isBestseller: true, isChefsSpecial: true, spiceLevel: 2, prepTimeMinutes: 30, displayOrder: 1, tags: ['combo', 'family'] },
  ];
  await db.insert(schema.menuItems).values(menuItemsData);

  const modifierGroupsData = [
    { id: 'group-spice', outletId: outlet.id, name: 'Spice Preference', selectionType: 'single', minSelections: 0, maxSelections: 1, isRequired: false, displayOrder: 1 },
    { id: 'group-naan', outletId: outlet.id, name: 'Naan Add-ons', selectionType: 'multiple', minSelections: 0, maxSelections: 2, isRequired: false, displayOrder: 2 },
    { id: 'group-biryani', outletId: outlet.id, name: 'Biryani Sides', selectionType: 'multiple', minSelections: 0, maxSelections: 2, isRequired: false, displayOrder: 3 },
    { id: 'group-drink-size', outletId: outlet.id, name: 'Drink Size', selectionType: 'single', minSelections: 1, maxSelections: 1, isRequired: true, displayOrder: 4 },
  ];
  await db.insert(schema.modifierGroups).values(modifierGroupsData);

  const modifiersData = [
    { id: 'mod-spice-mild', groupId: 'group-spice', name: 'Mild', priceDelta: 0, isDefault: true, isActive: true, displayOrder: 1 },
    { id: 'mod-spice-medium', groupId: 'group-spice', name: 'Medium', priceDelta: 0, isDefault: false, isActive: true, displayOrder: 2 },
    { id: 'mod-spice-hot', groupId: 'group-spice', name: 'Hot', priceDelta: 10, isDefault: false, isActive: true, displayOrder: 3 },
    { id: 'mod-naan-butter', groupId: 'group-naan', name: 'Extra Butter', priceDelta: 12, isDefault: false, isActive: true, displayOrder: 1 },
    { id: 'mod-naan-cheese', groupId: 'group-naan', name: 'Cheese Stuffing', priceDelta: 35, isDefault: false, isActive: true, displayOrder: 2 },
    { id: 'mod-biryani-raita', groupId: 'group-biryani', name: 'Extra Raita', priceDelta: 25, isDefault: false, isActive: true, displayOrder: 1 },
    { id: 'mod-biryani-salan', groupId: 'group-biryani', name: 'Extra Salan', priceDelta: 20, isDefault: false, isActive: true, displayOrder: 2 },
    { id: 'mod-size-regular', groupId: 'group-drink-size', name: 'Regular', priceDelta: 0, isDefault: true, isActive: true, displayOrder: 1 },
    { id: 'mod-size-large', groupId: 'group-drink-size', name: 'Large', priceDelta: 25, isDefault: false, isActive: true, displayOrder: 2 },
  ];
  await db.insert(schema.modifiers).values(modifiersData);

  await db.insert(schema.itemModifierGroups).values([
    { itemId: 'item-1', groupId: 'group-spice', displayOrder: 1 },
    { itemId: 'item-2', groupId: 'group-spice', displayOrder: 1 },
    { itemId: 'item-4', groupId: 'group-spice', displayOrder: 1 },
    { itemId: 'item-6', groupId: 'group-spice', displayOrder: 1 },
    { itemId: 'item-7', groupId: 'group-biryani', displayOrder: 1 },
    { itemId: 'item-9', groupId: 'group-naan', displayOrder: 1 },
    { itemId: 'item-10', groupId: 'group-naan', displayOrder: 1 },
    { itemId: 'item-12', groupId: 'group-drink-size', displayOrder: 1 },
    { itemId: 'item-13', groupId: 'group-drink-size', displayOrder: 1 },
  ]);

  await db.insert(schema.menuItemVariants).values([
    { id: 'variant-biryani-half', itemId: 'item-7', name: 'Half', price: 220, isActive: true },
    { id: 'variant-biryani-full', itemId: 'item-7', name: 'Full', price: 350, isActive: true },
    { id: 'variant-lassi-regular', itemId: 'item-12', name: 'Regular', price: 80, isActive: true },
    { id: 'variant-lassi-large', itemId: 'item-12', name: 'Large', price: 105, isActive: true },
  ]);

  const sectionsData = [
    { id: 'sec-gf', outletId: outlet.id, name: 'Ground Floor', floorNumber: 0, displayOrder: 1 },
    { id: 'sec-ff', outletId: outlet.id, name: 'First Floor', floorNumber: 1, displayOrder: 2 },
    { id: 'sec-out', outletId: outlet.id, name: 'Outdoor Patio', floorNumber: 0, displayOrder: 3 },
  ];
  await db.insert(schema.tableSections).values(sectionsData);

  const tablesData = [
    { id: 't1', sectionId: 'sec-gf', outletId: outlet.id, name: 'T1', capacity: 2, shape: 'square', status: 'available', positionX: 40, positionY: 40, width: 96, height: 96 },
    { id: 't2', sectionId: 'sec-gf', outletId: outlet.id, name: 'T2', capacity: 2, shape: 'square', status: 'available', positionX: 160, positionY: 40, width: 96, height: 96 },
    { id: 't3', sectionId: 'sec-gf', outletId: outlet.id, name: 'T3', capacity: 4, shape: 'rectangle', status: 'occupied', positionX: 40, positionY: 160, width: 120, height: 96 },
    { id: 't4', sectionId: 'sec-gf', outletId: outlet.id, name: 'T4', capacity: 4, shape: 'rectangle', status: 'occupied', positionX: 190, positionY: 160, width: 120, height: 96 },
    { id: 't5', sectionId: 'sec-gf', outletId: outlet.id, name: 'T5', capacity: 6, shape: 'circle', status: 'available', positionX: 340, positionY: 100, width: 120, height: 120 },
    { id: 't6', sectionId: 'sec-ff', outletId: outlet.id, name: 'T6', capacity: 4, shape: 'rectangle', status: 'reserved', positionX: 80, positionY: 60, width: 120, height: 96 },
    { id: 't7', sectionId: 'sec-ff', outletId: outlet.id, name: 'T7', capacity: 6, shape: 'rectangle', status: 'available', positionX: 240, positionY: 60, width: 140, height: 96 },
    { id: 't8', sectionId: 'sec-out', outletId: outlet.id, name: 'P1', capacity: 2, shape: 'circle', status: 'available', positionX: 70, positionY: 70, width: 96, height: 96 },
    { id: 't9', sectionId: 'sec-out', outletId: outlet.id, name: 'P2', capacity: 4, shape: 'circle', status: 'available', positionX: 200, positionY: 70, width: 110, height: 110 },
  ];
  await db.insert(schema.tables).values(tablesData);

  const suppliersData = [
    { id: 'supplier-dairy', outletId: outlet.id, name: 'FreshMoo Dairy', contactPerson: 'Asha Kale', phone: '+91 98220 10001', email: 'orders@freshmoo.in', address: 'Wardha Road, Nagpur', gstin: '27AAFFD1111G1ZK', isActive: true },
    { id: 'supplier-poultry', outletId: outlet.id, name: 'Sunrise Poultry Traders', contactPerson: 'Irfan Shaikh', phone: '+91 98220 10002', email: 'sales@sunrisepoultry.in', address: 'Besa, Nagpur', gstin: '27AAAFS2222M1ZB', isActive: true },
    { id: 'supplier-pantry', outletId: outlet.id, name: 'Market Basket Foods', contactPerson: 'Neeraj Gupta', phone: '+91 98220 10003', email: 'hello@marketbasket.in', address: 'Itwari, Nagpur', gstin: '27AAAFM3333Q1ZT', isActive: true },
  ];
  await db.insert(schema.suppliers).values(suppliersData);

  const inventoryItemsData = [
    { id: 'inv-paneer', outletId: outlet.id, name: 'Paneer', unit: 'kg', currentStock: 4.5, minThreshold: 6, costPerUnit: 310, supplierId: 'supplier-dairy', isActive: true },
    { id: 'inv-chicken', outletId: outlet.id, name: 'Boneless Chicken', unit: 'kg', currentStock: 11, minThreshold: 7, costPerUnit: 240, supplierId: 'supplier-poultry', isActive: true },
    { id: 'inv-rice', outletId: outlet.id, name: 'Basmati Rice', unit: 'kg', currentStock: 26, minThreshold: 15, costPerUnit: 72, supplierId: 'supplier-pantry', isActive: true },
    { id: 'inv-flour', outletId: outlet.id, name: 'Refined Flour', unit: 'kg', currentStock: 18, minThreshold: 10, costPerUnit: 48, supplierId: 'supplier-pantry', isActive: true },
    { id: 'inv-curd', outletId: outlet.id, name: 'Curd', unit: 'kg', currentStock: 3.2, minThreshold: 5, costPerUnit: 90, supplierId: 'supplier-dairy', isActive: true },
    { id: 'inv-cream', outletId: outlet.id, name: 'Fresh Cream', unit: 'L', currentStock: 7, minThreshold: 4, costPerUnit: 185, supplierId: 'supplier-dairy', isActive: true },
    { id: 'inv-spice-mix', outletId: outlet.id, name: 'Signature Spice Mix', unit: 'kg', currentStock: 2.4, minThreshold: 1.5, costPerUnit: 520, supplierId: 'supplier-pantry', isActive: true },
    { id: 'inv-soft-drinks', outletId: outlet.id, name: 'Beverage Bottles', unit: 'piece', currentStock: 36, minThreshold: 24, costPerUnit: 28, supplierId: 'supplier-pantry', isActive: true },
    { id: 'inv-dessert-mix', outletId: outlet.id, name: 'Dessert Premix', unit: 'kg', currentStock: 5, minThreshold: 3, costPerUnit: 210, supplierId: 'supplier-pantry', isActive: true },
    { id: 'inv-charcoal', outletId: outlet.id, name: 'Tandoor Charcoal', unit: 'kg', currentStock: 30, minThreshold: 12, costPerUnit: 35, supplierId: 'supplier-pantry', isActive: true },
  ];
  await db.insert(schema.inventoryItems).values(inventoryItemsData);

  await db.insert(schema.itemInventoryMap).values([
    { id: 'map-paneer-tikka', menuItemId: 'item-1', inventoryItemId: 'inv-paneer', quantityPerServing: 0.18 },
    { id: 'map-chicken-tikka', menuItemId: 'item-2', inventoryItemId: 'inv-chicken', quantityPerServing: 0.22 },
    { id: 'map-butter-chicken', menuItemId: 'item-4', inventoryItemId: 'inv-chicken', quantityPerServing: 0.28 },
    { id: 'map-dal', menuItemId: 'item-5', inventoryItemId: 'inv-cream', quantityPerServing: 0.05 },
    { id: 'map-kadhai-paneer', menuItemId: 'item-6', inventoryItemId: 'inv-paneer', quantityPerServing: 0.2 },
    { id: 'map-biryani', menuItemId: 'item-7', inventoryItemId: 'inv-rice', quantityPerServing: 0.25 },
    { id: 'map-naan', menuItemId: 'item-9', inventoryItemId: 'inv-flour', quantityPerServing: 0.08 },
    { id: 'map-lassi', menuItemId: 'item-12', inventoryItemId: 'inv-curd', quantityPerServing: 0.18 },
  ]);

  const inventoryTransactionsData = [
    { id: 'txn-paneer-open', itemId: 'inv-paneer', type: 'opening', quantityDelta: 6, quantityAfter: 6, unitCost: 300, referenceId: null, reason: 'Opening stock', createdBy: 'user-2', createdAt: atIst('2026-03-16', '09:00') },
    { id: 'txn-paneer-purchase', itemId: 'inv-paneer', type: 'purchase', quantityDelta: 4, quantityAfter: 10, unitCost: 310, referenceId: 'po-002', reason: 'Fresh delivery', createdBy: 'user-2', createdAt: atIst('2026-03-21', '11:30') },
    { id: 'txn-paneer-consume', itemId: 'inv-paneer', type: 'consumption', quantityDelta: -5.5, quantityAfter: 4.5, unitCost: 310, referenceId: 'service-week', reason: 'Week service usage', createdBy: 'user-5', createdAt: atIst('2026-03-22', '21:30') },
    { id: 'txn-chicken-open', itemId: 'inv-chicken', type: 'opening', quantityDelta: 12, quantityAfter: 12, unitCost: 235, referenceId: null, reason: 'Opening stock', createdBy: 'user-2', createdAt: atIst('2026-03-16', '09:00') },
    { id: 'txn-chicken-purchase', itemId: 'inv-chicken', type: 'purchase', quantityDelta: 8, quantityAfter: 20, unitCost: 240, referenceId: 'po-001', reason: 'Poultry delivery', createdBy: 'user-2', createdAt: atIst('2026-03-20', '10:00') },
    { id: 'txn-chicken-consume', itemId: 'inv-chicken', type: 'consumption', quantityDelta: -9, quantityAfter: 11, unitCost: 240, referenceId: 'service-week', reason: 'Week service usage', createdBy: 'user-5', createdAt: atIst('2026-03-22', '21:30') },
    { id: 'txn-rice-open', itemId: 'inv-rice', type: 'opening', quantityDelta: 22, quantityAfter: 22, unitCost: 70, referenceId: null, reason: 'Opening stock', createdBy: 'user-2', createdAt: atIst('2026-03-16', '09:00') },
    { id: 'txn-rice-purchase', itemId: 'inv-rice', type: 'purchase', quantityDelta: 12, quantityAfter: 34, unitCost: 72, referenceId: 'po-003', reason: 'Bulk pantry refill', createdBy: 'user-2', createdAt: atIst('2026-03-18', '11:00') },
    { id: 'txn-rice-consume', itemId: 'inv-rice', type: 'consumption', quantityDelta: -8, quantityAfter: 26, unitCost: 72, referenceId: 'service-week', reason: 'Week service usage', createdBy: 'user-5', createdAt: atIst('2026-03-22', '21:30') },
    { id: 'txn-curd-open', itemId: 'inv-curd', type: 'opening', quantityDelta: 5, quantityAfter: 5, unitCost: 88, referenceId: null, reason: 'Opening stock', createdBy: 'user-2', createdAt: atIst('2026-03-16', '09:00') },
    { id: 'txn-curd-purchase', itemId: 'inv-curd', type: 'purchase', quantityDelta: 3, quantityAfter: 8, unitCost: 90, referenceId: 'po-002', reason: 'Dairy refill', createdBy: 'user-2', createdAt: atIst('2026-03-21', '11:45') },
    { id: 'txn-curd-consume', itemId: 'inv-curd', type: 'consumption', quantityDelta: -4.8, quantityAfter: 3.2, unitCost: 90, referenceId: 'service-week', reason: 'Week service usage', createdBy: 'user-5', createdAt: atIst('2026-03-22', '21:30') },
  ];
  await db.insert(schema.inventoryTransactions).values(inventoryTransactionsData);

  await db.insert(schema.purchaseOrders).values([
    { id: 'po-001', outletId: outlet.id, supplierId: 'supplier-poultry', poNumber: 'PO-240321-01', status: 'received', totalAmount: 1920, notes: 'Weekend poultry replenishment', createdAt: atIst('2026-03-20', '08:30'), receivedAt: atIst('2026-03-20', '10:15') },
    { id: 'po-002', outletId: outlet.id, supplierId: 'supplier-dairy', poNumber: 'PO-250321-02', status: 'received', totalAmount: 1510, notes: 'Paneer and curd delivery', createdAt: atIst('2026-03-21', '09:15'), receivedAt: atIst('2026-03-21', '11:45') },
    { id: 'po-003', outletId: outlet.id, supplierId: 'supplier-pantry', poNumber: 'PO-230321-03', status: 'partial', totalAmount: 864, notes: 'Rice and pantry top-up', createdAt: atIst('2026-03-18', '08:45'), receivedAt: atIst('2026-03-18', '11:15') },
  ]);

  await db.insert(schema.purchaseOrderItems).values([
    { id: 'poi-001', poId: 'po-001', inventoryItemId: 'inv-chicken', orderedQty: 8, receivedQty: 8, unitCost: 240, total: 1920 },
    { id: 'poi-002', poId: 'po-002', inventoryItemId: 'inv-paneer', orderedQty: 4, receivedQty: 4, unitCost: 310, total: 1240 },
    { id: 'poi-003', poId: 'po-002', inventoryItemId: 'inv-curd', orderedQty: 3, receivedQty: 3, unitCost: 90, total: 270 },
    { id: 'poi-004', poId: 'po-003', inventoryItemId: 'inv-rice', orderedQty: 12, receivedQty: 12, unitCost: 72, total: 864 },
  ]);

  const customersData = [
    { id: 'cust-1', outletId: outlet.id, name: 'Rajesh Mehta', phone: '+91 9876500011', email: 'rajesh.mehta@example.com', gstin: '27AAAFR1111G1ZU', dob: '1987-04-11', anniversary: '2015-12-09', loyaltyPoints: 58, totalVisits: 14, totalSpend: 9840, notes: 'Prefers corner seating and mild spice.', createdAt: atIst('2026-03-02', '12:15') },
    { id: 'cust-2', outletId: outlet.id, name: 'Neha Kulkarni', phone: '+91 9876500012', email: 'neha.kulkarni@example.com', gstin: null, dob: '1991-07-19', anniversary: null, loyaltyPoints: 32, totalVisits: 8, totalSpend: 5160, notes: 'Often orders delivery on Fridays.', createdAt: atIst('2026-03-08', '18:10') },
    { id: 'cust-3', outletId: outlet.id, name: 'Arjun Verma', phone: '+91 9876500013', email: 'arjun.verma@example.com', gstin: null, dob: '1989-09-03', anniversary: '2020-01-18', loyaltyPoints: 21, totalVisits: 6, totalSpend: 3520, notes: 'Loves biryani and chaas.', createdAt: atIst('2026-03-11', '13:40') },
    { id: 'cust-4', outletId: outlet.id, name: 'Kriti Shah', phone: '+91 9876500014', email: 'kriti.shah@example.com', gstin: null, dob: '1994-02-26', anniversary: null, loyaltyPoints: 9, totalVisits: 3, totalSpend: 1180, notes: 'First office lunch visit this month.', createdAt: atIst('2026-03-21', '11:05') },
    { id: 'cust-5', outletId: outlet.id, name: 'Vikram Joshi', phone: '+91 9876500015', email: 'vikram.joshi@example.com', gstin: '27AAAFV5151D1ZA', dob: '1985-06-14', anniversary: '2012-02-20', loyaltyPoints: 47, totalVisits: 11, totalSpend: 7420, notes: 'Orders combo meals for family.', createdAt: atIst('2026-03-06', '20:05') },
    { id: 'cust-6', outletId: outlet.id, name: 'Sara Khan', phone: '+91 9876500016', email: 'sara.khan@example.com', gstin: null, dob: '1996-10-22', anniversary: null, loyaltyPoints: 15, totalVisits: 4, totalSpend: 1960, notes: 'Usually orders online desserts.', createdAt: atIst('2026-03-18', '16:25') },
    { id: 'cust-7', outletId: outlet.id, name: 'Rohan Bhatia', phone: '+91 9876500017', email: 'rohan.bhatia@example.com', gstin: null, dob: '1990-01-08', anniversary: null, loyaltyPoints: 12, totalVisits: 4, totalSpend: 2640, notes: 'Card payment, prefers upstairs section.', createdAt: atIst('2026-03-22', '10:15') },
    { id: 'cust-8', outletId: outlet.id, name: 'Meera Nair', phone: '+91 9876500018', email: 'meera.nair@example.com', gstin: null, dob: '1993-03-31', anniversary: null, loyaltyPoints: 6, totalVisits: 2, totalSpend: 860, notes: 'New guest from weekend brunch campaign.', createdAt: atIst('2026-03-22', '12:00') },
  ];
  await db.insert(schema.customers).values(customersData);

  const menuItemMap = new Map(menuItemsData.map((item) => [item.id, item]));
  const modifierMap = new Map(modifiersData.map((modifier) => [modifier.id, modifier]));

  const ordersData: Array<typeof schema.orders.$inferInsert> = [];
  const orderItemsData: Array<typeof schema.orderItems.$inferInsert> = [];
  const orderItemModifiersData: Array<typeof schema.orderItemModifiers.$inferInsert> = [];
  const kotsData: Array<typeof schema.kots.$inferInsert> = [];
  const kotItemsData: Array<typeof schema.kotItems.$inferInsert> = [];
  const paymentAttemptsData: Array<typeof schema.paymentAttempts.$inferInsert> = [];
  const paymentsData: Array<typeof schema.payments.$inferInsert> = [];
  const paymentSplitsData: Array<typeof schema.paymentSplits.$inferInsert> = [];
  const loyaltyTransactionsData: Array<typeof schema.loyaltyTransactions.$inferInsert> = [];
  const orderMetrics: Array<{ serviceDate: string; status: string; totalAmount: number; paymentMethod?: string; items: Array<{ name: string; quantity: number; revenue: number }> }> = [];

  const ordersSeed: OrderSeedSpec[] = [
    { id: 'order-2201', orderNumber: 'SG-2201', serviceDate: '2026-03-22', time: '12:15', orderType: 'dine_in', status: 'paid', tableId: 't1', customerId: 'cust-1', paxCount: 2, waiterId: PRIMARY_WAITER_ID, paymentMethod: 'card', paymentReference: 'HDFC', transactionId: 'TXN2201', kotStatus: 'served', items: [{ itemId: 'item-1', quantity: 1, modifierIds: ['mod-spice-medium'] }, { itemId: 'item-4', quantity: 1, modifierIds: ['mod-spice-hot'] }, { itemId: 'item-10', quantity: 2 }, { itemId: 'item-12', quantity: 1, modifierIds: ['mod-size-regular'] }] },
    { id: 'order-2202', orderNumber: 'SG-2202', serviceDate: '2026-03-22', time: '13:05', orderType: 'delivery', status: 'paid', tableId: null, customerId: 'cust-2', paxCount: 2, waiterId: PRIMARY_WAITER_ID, paymentMethod: 'cash', kotStatus: 'served', specialInstructions: 'Deliver without onions.', items: [{ itemId: 'item-7', quantity: 1, modifierIds: ['mod-biryani-raita'] }, { itemId: 'item-13', quantity: 2, modifierIds: ['mod-size-regular'] }] },
    { id: 'order-2203', orderNumber: 'SG-2203', serviceDate: '2026-03-22', time: '14:40', orderType: 'dine_in', status: 'paid', tableId: 't2', customerId: 'cust-3', paxCount: 3, waiterId: SECONDARY_WAITER_ID, discountAmount: 40, paymentMethod: 'cash', kotStatus: 'served', items: [{ itemId: 'item-5', quantity: 1 }, { itemId: 'item-9', quantity: 3, modifierIds: ['mod-naan-butter'] }, { itemId: 'item-14', quantity: 2 }] },
    { id: 'order-2204', orderNumber: 'SG-2204', serviceDate: '2026-03-22', time: '16:15', orderType: 'dine_in', status: 'active', tableId: 't3', customerId: 'cust-4', paxCount: 2, waiterId: PRIMARY_WAITER_ID, kotStatus: 'preparing', specialInstructions: 'One curry less spicy.', items: [{ itemId: 'item-2', quantity: 1, modifierIds: ['mod-spice-hot'] }, { itemId: 'item-6', quantity: 1, modifierIds: ['mod-spice-medium'] }, { itemId: 'item-10', quantity: 2 }] },
    { id: 'order-2205', orderNumber: 'SG-2205', serviceDate: '2026-03-22', time: '16:50', orderType: 'takeaway', status: 'active', tableId: null, customerId: null, paxCount: 1, waiterId: SECONDARY_WAITER_ID, kotStatus: 'pending', items: [{ itemId: 'item-8', quantity: 1 }, { itemId: 'item-12', quantity: 1, modifierIds: ['mod-size-large'] }] },
    { id: 'order-2206', orderNumber: 'SG-2206', serviceDate: '2026-03-22', time: '18:20', orderType: 'dine_in', status: 'paid', tableId: 't5', customerId: 'cust-5', paxCount: 4, waiterId: PRIMARY_WAITER_ID, paymentMethod: 'upi', paymentReference: 'PhonePe', transactionId: 'UPI2206', kotStatus: 'served', items: [{ itemId: 'item-7', quantity: 2, modifierIds: ['mod-biryani-raita'] }, { itemId: 'item-3', quantity: 1 }, { itemId: 'item-13', quantity: 2 }] },
    { id: 'order-2207', orderNumber: 'SG-2207', serviceDate: '2026-03-22', time: '19:10', orderType: 'online', status: 'paid', tableId: null, customerId: 'cust-6', paxCount: 3, waiterId: PRIMARY_WAITER_ID, paymentMethod: 'wallet', paymentReference: 'Zomato Wallet', transactionId: 'ZOM2207', kotStatus: 'served', items: [{ itemId: 'item-16', quantity: 1 }, { itemId: 'item-15', quantity: 1 }] },
    { id: 'order-2208', orderNumber: 'SG-2208', serviceDate: '2026-03-22', time: '20:05', orderType: 'dine_in', status: 'paid', tableId: 't7', customerId: 'cust-7', paxCount: 4, waiterId: SECONDARY_WAITER_ID, paymentMethod: 'card', paymentReference: 'ICICI', transactionId: 'CARD2208', kotStatus: 'served', items: [{ itemId: 'item-1', quantity: 1 }, { itemId: 'item-6', quantity: 1 }, { itemId: 'item-9', quantity: 4 }, { itemId: 'item-14', quantity: 1 }] },
    { id: 'order-2209', orderNumber: 'SG-2209', serviceDate: '2026-03-22', time: '20:45', orderType: 'dine_in', status: 'active', tableId: 't4', customerId: 'cust-8', paxCount: 2, waiterId: PRIMARY_WAITER_ID, kotStatus: 'ready', items: [{ itemId: 'item-4', quantity: 1 }, { itemId: 'item-10', quantity: 3 }, { itemId: 'item-12', quantity: 1, modifierIds: ['mod-size-regular'] }] },
    { id: 'order-2101', orderNumber: 'SG-2101', serviceDate: '2026-03-21', time: '12:30', orderType: 'dine_in', status: 'paid', tableId: 't1', customerId: 'cust-1', paxCount: 2, waiterId: PRIMARY_WAITER_ID, paymentMethod: 'cash', kotStatus: 'served', items: [{ itemId: 'item-1', quantity: 1 }, { itemId: 'item-5', quantity: 1 }, { itemId: 'item-10', quantity: 2 }] },
    { id: 'order-2102', orderNumber: 'SG-2102', serviceDate: '2026-03-21', time: '13:40', orderType: 'delivery', status: 'paid', tableId: null, customerId: 'cust-3', paxCount: 2, waiterId: PRIMARY_WAITER_ID, paymentMethod: 'upi', paymentReference: 'Google Pay', transactionId: 'UPI2102', kotStatus: 'served', items: [{ itemId: 'item-7', quantity: 1 }, { itemId: 'item-13', quantity: 1 }] },
    { id: 'order-2103', orderNumber: 'SG-2103', serviceDate: '2026-03-21', time: '15:05', orderType: 'dine_in', status: 'paid', tableId: 't5', customerId: null, paxCount: 5, waiterId: SECONDARY_WAITER_ID, paymentMethod: 'cash', kotStatus: 'served', items: [{ itemId: 'item-16', quantity: 1 }, { itemId: 'item-12', quantity: 3, modifierIds: ['mod-size-regular'] }] },
    { id: 'order-2104', orderNumber: 'SG-2104', serviceDate: '2026-03-21', time: '18:15', orderType: 'online', status: 'paid', tableId: null, customerId: 'cust-5', paxCount: 3, waiterId: PRIMARY_WAITER_ID, paymentMethod: 'wallet', paymentReference: 'Swiggy Pay', transactionId: 'SWG2104', kotStatus: 'served', items: [{ itemId: 'item-7', quantity: 1 }, { itemId: 'item-15', quantity: 1 }] },
    { id: 'order-2105', orderNumber: 'SG-2105', serviceDate: '2026-03-21', time: '20:10', orderType: 'dine_in', status: 'paid', tableId: 't7', customerId: 'cust-2', paxCount: 4, waiterId: PRIMARY_WAITER_ID, paymentMethod: 'card', paymentReference: 'Axis', transactionId: 'CARD2105', kotStatus: 'served', items: [{ itemId: 'item-2', quantity: 1 }, { itemId: 'item-4', quantity: 1 }, { itemId: 'item-9', quantity: 3 }] },
    { id: 'order-2106', orderNumber: 'SG-2106', serviceDate: '2026-03-21', time: '21:05', orderType: 'takeaway', status: 'paid', tableId: null, customerId: 'cust-4', paxCount: 1, waiterId: SECONDARY_WAITER_ID, paymentMethod: 'cash', kotStatus: 'served', items: [{ itemId: 'item-6', quantity: 1 }, { itemId: 'item-10', quantity: 2 }] },
    { id: 'order-2001', orderNumber: 'SG-2001', serviceDate: '2026-03-20', time: '12:20', orderType: 'dine_in', status: 'paid', tableId: 't2', customerId: 'cust-1', paxCount: 2, waiterId: PRIMARY_WAITER_ID, paymentMethod: 'cash', kotStatus: 'served', items: [{ itemId: 'item-5', quantity: 1 }, { itemId: 'item-9', quantity: 2 }, { itemId: 'item-14', quantity: 1 }] },
    { id: 'order-2002', orderNumber: 'SG-2002', serviceDate: '2026-03-20', time: '18:45', orderType: 'dine_in', status: 'paid', tableId: 't5', customerId: 'cust-5', paxCount: 3, waiterId: SECONDARY_WAITER_ID, paymentMethod: 'upi', paymentReference: 'PhonePe', transactionId: 'UPI2002', kotStatus: 'served', items: [{ itemId: 'item-7', quantity: 1 }, { itemId: 'item-3', quantity: 1 }, { itemId: 'item-12', quantity: 2 }] },
    { id: 'order-2003', orderNumber: 'SG-2003', serviceDate: '2026-03-20', time: '20:30', orderType: 'delivery', status: 'paid', tableId: null, customerId: 'cust-6', paxCount: 2, waiterId: PRIMARY_WAITER_ID, paymentMethod: 'wallet', paymentReference: 'Zomato Wallet', transactionId: 'ZOM2003', kotStatus: 'served', items: [{ itemId: 'item-4', quantity: 1 }, { itemId: 'item-10', quantity: 3 }] },
    { id: 'order-1901', orderNumber: 'SG-1901', serviceDate: '2026-03-19', time: '13:00', orderType: 'dine_in', status: 'paid', tableId: 't1', customerId: 'cust-3', paxCount: 2, waiterId: PRIMARY_WAITER_ID, paymentMethod: 'cash', kotStatus: 'served', items: [{ itemId: 'item-1', quantity: 1 }, { itemId: 'item-8', quantity: 1 }, { itemId: 'item-13', quantity: 1 }] },
    { id: 'order-1902', orderNumber: 'SG-1902', serviceDate: '2026-03-19', time: '19:25', orderType: 'dine_in', status: 'paid', tableId: 't7', customerId: 'cust-2', paxCount: 4, waiterId: SECONDARY_WAITER_ID, paymentMethod: 'card', paymentReference: 'HDFC', transactionId: 'CARD1902', kotStatus: 'served', items: [{ itemId: 'item-16', quantity: 1 }] },
    { id: 'order-1801', orderNumber: 'SG-1801', serviceDate: '2026-03-18', time: '18:05', orderType: 'online', status: 'paid', tableId: null, customerId: 'cust-6', paxCount: 2, waiterId: PRIMARY_WAITER_ID, paymentMethod: 'wallet', paymentReference: 'Swiggy Pay', transactionId: 'SWG1801', kotStatus: 'served', items: [{ itemId: 'item-7', quantity: 1 }, { itemId: 'item-15', quantity: 1 }] },
    { id: 'order-1701', orderNumber: 'SG-1701', serviceDate: '2026-03-17', time: '20:00', orderType: 'dine_in', status: 'paid', tableId: 't5', customerId: 'cust-5', paxCount: 5, waiterId: PRIMARY_WAITER_ID, paymentMethod: 'cash', kotStatus: 'served', items: [{ itemId: 'item-4', quantity: 1 }, { itemId: 'item-7', quantity: 1 }, { itemId: 'item-9', quantity: 4 }] },
    { id: 'order-1601', orderNumber: 'SG-1601', serviceDate: '2026-03-16', time: '13:15', orderType: 'dine_in', status: 'paid', tableId: 't2', customerId: 'cust-1', paxCount: 2, waiterId: SECONDARY_WAITER_ID, paymentMethod: 'cash', kotStatus: 'served', items: [{ itemId: 'item-5', quantity: 1 }, { itemId: 'item-10', quantity: 2 }, { itemId: 'item-12', quantity: 1 }] },
  ];

  for (const spec of ordersSeed) {
    const createdAt = atIst(spec.serviceDate, spec.time);
    const orderItemsForOrder: Array<{ name: string; quantity: number; revenue: number }> = [];

    let subtotal = 0;

    for (const [index, line] of spec.items.entries()) {
      const menuItem = menuItemMap.get(line.itemId);
      if (!menuItem) {
        throw new Error(`Menu item not found for seed order line: ${line.itemId}`);
      }

      const selectedModifiers = (line.modifierIds ?? []).map((modifierId) => {
        const modifier = modifierMap.get(modifierId);
        if (!modifier) {
          throw new Error(`Modifier not found for seed order line: ${modifierId}`);
        }

        return modifier;
      });

      const unitPrice = line.unitPrice ?? (menuItem.basePrice + selectedModifiers.reduce((sum, modifier) => sum + modifier.priceDelta, 0));
      const itemTotal = roundMoney(unitPrice * line.quantity);
      subtotal += itemTotal;

      const orderItemId = `${spec.id}-item-${index + 1}`;
      const itemModifierSummary = selectedModifiers.map((modifier) => ({
        modifierId: modifier.id,
        modifierName: modifier.name,
        priceDelta: modifier.priceDelta,
      }));

      orderItemsData.push({
        id: orderItemId,
        orderId: spec.id,
        itemId: menuItem.id,
        variantId: null,
        itemName: menuItem.name,
        variantName: null,
        quantity: line.quantity,
        unitPrice,
        modifierSummary: itemModifierSummary,
        itemTotal,
        itemNote: line.itemNote ?? null,
        isVoid: false,
        voidReason: null,
        sentToKitchenAt: shiftMinutes(createdAt, 6),
        servedAt: spec.kotStatus === 'served' ? shiftMinutes(createdAt, 28) : null,
      });

      for (const [modifierIndex, modifier] of selectedModifiers.entries()) {
        orderItemModifiersData.push({
          id: `${orderItemId}-modifier-${modifierIndex + 1}`,
          orderItemId,
          modifierId: modifier.id,
          modifierName: modifier.name,
          priceDelta: modifier.priceDelta,
        });
      }

      orderItemsForOrder.push({
        name: menuItem.name,
        quantity: line.quantity,
        revenue: itemTotal,
      });
    }

    const discountAmount = spec.discountAmount ?? 0;
    const taxAmount = roundMoney(subtotal * 0.05);
    const totalAmount = roundMoney(subtotal + taxAmount - discountAmount);

    ordersData.push({
      id: spec.id,
      outletId: outlet.id,
      tableId: spec.tableId ?? null,
      customerId: spec.customerId ?? null,
      waiterId: spec.waiterId ?? PRIMARY_WAITER_ID,
      cashierId: spec.status === 'paid' ? CASHIER_ID : null,
      orderNumber: spec.orderNumber,
      orderType: spec.orderType,
      status: spec.status,
      paxCount: spec.paxCount ?? 2,
      subtotal,
      discountAmount,
      taxAmount,
      serviceCharge: 0,
      totalAmount,
      specialInstructions: spec.specialInstructions ?? null,
      createdAt,
      billedAt: spec.status === 'paid' ? shiftMinutes(createdAt, 30) : null,
      paidAt: spec.status === 'paid' ? shiftMinutes(createdAt, 36) : null,
      cancelledAt: null,
    });

    const kotStatus = spec.kotStatus ?? (spec.status === 'paid' ? 'served' : 'pending');
    const kotId = `${spec.id}-kot`;
    kotsData.push({
      id: kotId,
      orderId: spec.id,
      kotNumber: `KOT-${spec.orderNumber.split('-')[1]}`,
      status: kotStatus,
      createdAt: shiftMinutes(createdAt, 4),
      startedAt: kotStatus === 'preparing' || kotStatus === 'ready' || kotStatus === 'served' ? shiftMinutes(createdAt, 8) : null,
      readyAt: kotStatus === 'ready' || kotStatus === 'served' ? shiftMinutes(createdAt, 22) : null,
      servedAt: kotStatus === 'served' ? shiftMinutes(createdAt, 30) : null,
    });

    for (const [index, line] of spec.items.entries()) {
      const menuItem = menuItemMap.get(line.itemId);
      if (!menuItem) continue;

      const selectedModifiers = (line.modifierIds ?? []).map((modifierId) => {
        const modifier = modifierMap.get(modifierId);
        return modifier ? modifier.name : modifierId;
      });

      kotItemsData.push({
        id: `${kotId}-item-${index + 1}`,
        kotId,
        orderItemId: `${spec.id}-item-${index + 1}`,
        itemName: menuItem.name,
        quantity: line.quantity,
        modifiers: selectedModifiers,
        itemNote: line.itemNote ?? null,
        status: kotStatus,
      });
    }

    if (spec.status === 'paid') {
      const paymentAttemptId = `${spec.id}-attempt`;
      const paymentId = `${spec.id}-payment`;

      paymentAttemptsData.push({
        id: paymentAttemptId,
        outletId: outlet.id,
        orderId: spec.id,
        cashierId: CASHIER_ID,
        provider: 'manual',
        paymentMethod: spec.paymentMethod ?? 'cash',
        status: 'succeeded',
        amount: totalAmount,
        currency: outlet.currency ?? 'INR',
        reference: spec.paymentReference ?? null,
        transactionId: spec.transactionId ?? null,
        metadata: { seeded: true },
        completedAt: shiftMinutes(createdAt, 36),
        createdAt: shiftMinutes(createdAt, 34),
        updatedAt: shiftMinutes(createdAt, 36),
      });

      paymentsData.push({
        id: paymentId,
        orderId: spec.id,
        cashierId: CASHIER_ID,
        totalAmount,
        changeAmount: 0,
        createdAt: shiftMinutes(createdAt, 36),
      });

      paymentSplitsData.push({
        id: `${paymentId}-split-1`,
        paymentId,
        method: spec.paymentMethod ?? 'cash',
        amount: totalAmount,
        reference: spec.paymentReference ?? null,
        transactionId: spec.transactionId ?? null,
      });

      if (spec.customerId) {
        const pointsDelta = Math.max(3, Math.floor(totalAmount / 120));
        const customer = customersData.find((entry) => entry.id === spec.customerId);
        const existingPoints = customer?.loyaltyPoints ?? 0;

        loyaltyTransactionsData.push({
          id: `${spec.id}-loyalty`,
          customerId: spec.customerId,
          orderId: spec.id,
          pointsDelta,
          balanceAfter: existingPoints + pointsDelta,
          reason: 'Dining points credited',
          createdAt: shiftMinutes(createdAt, 37),
        });
      }
    }

    orderMetrics.push({
      serviceDate: spec.serviceDate,
      status: spec.status,
      totalAmount,
      paymentMethod: spec.paymentMethod,
      items: orderItemsForOrder,
    });
  }

  await db.insert(schema.orders).values(ordersData);
  await db.insert(schema.orderItems).values(orderItemsData);
  await db.insert(schema.orderItemModifiers).values(orderItemModifiersData);
  await db.insert(schema.kots).values(kotsData);
  await db.insert(schema.kotItems).values(kotItemsData);
  await db.insert(schema.paymentAttempts).values(paymentAttemptsData);
  await db.insert(schema.payments).values(paymentsData);
  await db.insert(schema.paymentSplits).values(paymentSplitsData);
  await db.insert(schema.loyaltyTransactions).values(loyaltyTransactionsData);

  await db.insert(schema.onlineOrderSources).values([
    { id: 'source-swiggy', outletId: outlet.id, platform: 'swiggy', isActive: true, webhookSecret: 'swiggy-demo-secret', settings: { prepBufferMinutes: 8 } },
    { id: 'source-zomato', outletId: outlet.id, platform: 'zomato', isActive: true, webhookSecret: 'zomato-demo-secret', settings: { prepBufferMinutes: 10 } },
  ]);

  await db.insert(schema.onlineOrders).values([
    {
      id: 'online-2201',
      outletId: outlet.id,
      sourceId: 'source-zomato',
      externalOrderId: 'ZOM-912341',
      platform: 'zomato',
      customerName: 'Sara Khan',
      customerPhone: '+91 9876500016',
      deliveryAddress: { line1: 'Civil Lines', city: 'Nagpur' },
      items: [{ name: 'Family Feast Combo', qty: 1 }, { name: 'Sizzling Brownie', qty: 1 }],
      subtotal: 1079,
      total: 1079,
      status: 'ready',
      acceptedAt: atIst('2026-03-22', '19:18'),
      readyAt: atIst('2026-03-22', '19:42'),
      dispatchedAt: null,
      createdAt: atIst('2026-03-22', '19:10'),
    },
    {
      id: 'online-2101',
      outletId: outlet.id,
      sourceId: 'source-swiggy',
      externalOrderId: 'SWG-884422',
      platform: 'swiggy',
      customerName: 'Vikram Joshi',
      customerPhone: '+91 9876500015',
      deliveryAddress: { line1: 'Manish Nagar', city: 'Nagpur' },
      items: [{ name: 'Chicken Biryani', qty: 1 }, { name: 'Sizzling Brownie', qty: 1 }],
      subtotal: 530,
      total: 530,
      status: 'dispatched',
      acceptedAt: atIst('2026-03-21', '18:18'),
      readyAt: atIst('2026-03-21', '18:36'),
      dispatchedAt: atIst('2026-03-21', '18:42'),
      createdAt: atIst('2026-03-21', '18:15'),
    },
  ]);

  await db.insert(schema.reservations).values([
    { id: 'res-2201', outletId: outlet.id, tableId: 't6', customerId: 'cust-2', guestName: 'Neha Kulkarni', guestPhone: '+91 9876500012', paxCount: 4, reservationDate: '2026-03-22', reservationTime: '19:30', status: 'confirmed', notes: 'Birthday dinner setup requested.' },
    { id: 'res-2202', outletId: outlet.id, tableId: 't8', customerId: null, guestName: 'Terrace Couple', guestPhone: '+91 9876500099', paxCount: 2, reservationDate: '2026-03-22', reservationTime: '20:15', status: 'pending', notes: 'Outdoor seating if weather holds.' },
    { id: 'res-2301', outletId: outlet.id, tableId: 't7', customerId: 'cust-5', guestName: 'Vikram Joshi', guestPhone: '+91 9876500015', paxCount: 6, reservationDate: '2026-03-23', reservationTime: '13:00', status: 'confirmed', notes: 'Corporate lunch with projector access.' },
  ]);

  const dayEndDates = ['2026-03-16', '2026-03-17', '2026-03-18', '2026-03-19', '2026-03-20', '2026-03-21', '2026-03-22'];
  const dayEndReportsData = dayEndDates.map((reportDate, index) => {
    const dayOrders = orderMetrics.filter((metric) => metric.serviceDate === reportDate);
    const totalRevenue = roundMoney(dayOrders.reduce((sum, order) => sum + order.totalAmount, 0));
    const totalOrders = dayOrders.length;
    const paymentBreakdown = dayOrders
      .filter((order) => order.status === 'paid')
      .reduce<Record<string, number>>((acc, order) => {
        const method = order.paymentMethod ?? 'cash';
        acc[method] = roundMoney((acc[method] ?? 0) + order.totalAmount);
        return acc;
      }, {});
    const topItems = Object.values(dayOrders.reduce<Record<string, { name: string; quantity: number; revenue: number }>>((acc, order) => {
      for (const item of order.items) {
        const existing = acc[item.name] ?? { name: item.name, quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue = roundMoney(existing.revenue + item.revenue);
        acc[item.name] = existing;
      }
      return acc;
    }, {}))
      .sort((left, right) => right.revenue - left.revenue)
      .slice(0, 5);

    return {
      id: `report-${reportDate}`,
      outletId: outlet.id,
      reportDate,
      openingCash: 15000 + index * 250,
      closingCash: 18500 + index * 320,
      totalOrders,
      totalRevenue,
      paymentBreakdown,
      topItems,
      taxesCollected: {
        gst5: roundMoney(totalRevenue * 0.05),
        serviceCharge: 0,
      },
      createdAt: atIst(reportDate, '23:20'),
    };
  });
  await db.insert(schema.dayEndReports).values(dayEndReportsData);

  await db.insert(schema.staffAttendance).values([
    { id: 'attendance-2201', userId: 'user-3', date: '2026-03-22', punchIn: atIst('2026-03-22', '10:58'), punchOut: atIst('2026-03-22', '22:35'), totalHours: 11.6, notes: 'Cash desk + settlement' },
    { id: 'attendance-2202', userId: 'user-4', date: '2026-03-22', punchIn: atIst('2026-03-22', '11:02'), punchOut: atIst('2026-03-22', '22:15'), totalHours: 11.2, notes: 'Ground floor section' },
    { id: 'attendance-2203', userId: 'user-5', date: '2026-03-22', punchIn: atIst('2026-03-22', '10:30'), punchOut: atIst('2026-03-22', '22:40'), totalHours: 12.1, notes: 'Hot kitchen lead' },
    { id: 'attendance-2204', userId: 'user-6', date: '2026-03-22', punchIn: atIst('2026-03-22', '11:15'), punchOut: atIst('2026-03-22', '21:58'), totalHours: 10.7, notes: 'First floor and takeaway' },
  ]);

  await db.insert(schema.auditLogs).values([
    { id: 'audit-2201', outletId: outlet.id, userId: 'user-2', action: 'seed_import', entityType: 'database', entityId: 'bootstrap', oldValue: null, newValue: { snapshot: 'public-demo-ready' }, ipAddress: '127.0.0.1', createdAt: atIst('2026-03-22', '09:00') },
    { id: 'audit-2202', outletId: outlet.id, userId: 'user-2', action: 'inventory_reviewed', entityType: 'inventory', entityId: 'inv-paneer', oldValue: { currentStock: 10 }, newValue: { currentStock: 4.5 }, ipAddress: '127.0.0.1', createdAt: atIst('2026-03-22', '21:35') },
  ]);

  console.log('Database seeded successfully!');
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
