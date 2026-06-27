import { create } from 'zustand';
import { Customer, MenuItem, OrderItem } from '@/types';

interface PosState {
  cart: OrderItem[];
  selectedTableId: string | null;
  selectedCustomer: Customer | null;
  orderType: 'dine_in' | 'takeaway' | 'delivery' | 'online';
  paxCount: number;
  discountAmount: number;
  
  addToCart: (item: MenuItem, quantity?: number, modifiers?: any[], note?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setTable: (tableId: string | null) => void;
  setCustomer: (customer: Customer | null) => void;
  setOrderType: (type: 'dine_in' | 'takeaway' | 'delivery' | 'online') => void;
  setPaxCount: (count: number) => void;
}

export const usePosStore = create<PosState>((set) => ({
  cart: [],
  selectedTableId: null,
  selectedCustomer: null,
  orderType: 'dine_in',
  paxCount: 1,
  discountAmount: 0,

  addToCart: (item, quantity = 1, modifiers = [], note = '') => set((state) => {
    const existingItemIndex = state.cart.findIndex(i => i.itemId === item.id && JSON.stringify(i.modifiers) === JSON.stringify(modifiers));
    
    if (existingItemIndex >= 0) {
      const newCart = [...state.cart];
      newCart[existingItemIndex].quantity += quantity;
      newCart[existingItemIndex].itemTotal = newCart[existingItemIndex].quantity * newCart[existingItemIndex].unitPrice;
      return { cart: newCart };
    }

    const modifierTotal = modifiers.reduce((sum, mod) => sum + mod.priceDelta, 0);
    const unitPrice = item.basePrice + modifierTotal;

    const newItem: OrderItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      itemId: item.id,
      itemName: item.name,
      quantity,
      unitPrice,
      itemTotal: unitPrice * quantity,
      modifiers,
      itemNote: note,
      isVoid: false,
    };

    return { cart: [...state.cart, newItem] };
  }),

  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter(item => item.id !== id)
  })),

  updateQuantity: (id, quantity) => set((state) => ({
    cart: state.cart.map(item => {
      if (item.id === id) {
        return { ...item, quantity, itemTotal: quantity * item.unitPrice };
      }
      return item;
    })
  })),

  clearCart: () => set({
    cart: [],
    selectedTableId: null,
    selectedCustomer: null,
    paxCount: 1,
    discountAmount: 0,
  }),
  setTable: (tableId) => set({ selectedTableId: tableId, orderType: tableId ? 'dine_in' : 'takeaway' }),
  setCustomer: (selectedCustomer) => set({ selectedCustomer }),
  setOrderType: (orderType) => set({ orderType }),
  setPaxCount: (paxCount) => set({ paxCount }),
}));
