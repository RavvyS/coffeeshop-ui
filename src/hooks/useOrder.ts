// src/hooks/useOrder.ts
import { useState, useCallback } from 'react';
import { apiService } from '@/services/api';
import { MenuItem } from './useMenu';
import { toast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  customizations?: {
    size?: 'small' | 'medium' | 'large';
    milk?: 'regular' | 'oat' | 'almond' | 'soy';
    extras?: string[];
    specialInstructions?: string;
  };
}

export interface Order {
  id?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  status: 'draft' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  paymentInfo?: {
    method: 'card' | 'cash' | 'mobile';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    transactionId?: string;
  };
  pickupInfo?: {
    type: 'pickup' | 'delivery';
    time?: Date;
    address?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface UseOrderReturn {
  cart: CartItem[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  addToCart: (menuItem: MenuItem, quantity?: number, customizations?: CartItem['customizations']) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItem: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (customerInfo?: Order['customerInfo'], pickupInfo?: Order['pickupInfo']) => Promise<Order | null>;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;
  getOrder: (orderId: string) => Promise<Order | null>;
  calculateTotals: () => { subtotal: number; tax: number; total: number };
  syncCartWithBackend: () => Promise<void>;
}

const TAX_RATE = 0.08; // 8% tax rate

export const useOrder = (): UseOrderReturn => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToCart = useCallback((
    menuItem: MenuItem, 
    quantity: number = 1, 
    customizations?: CartItem['customizations']
  ) => {
    const cartItemId = `${menuItem.id}_${Date.now()}`;
    const cartItem: CartItem = {
      id: cartItemId,
      menuItemId: menuItem.id,
      quantity,
      price: menuItem.price,
      customizations
    };

    setCart(prev => [...prev, cartItem]);
    
    toast({
      title: "Added to cart",
      description: `${menuItem.name} ${quantity > 1 ? `(${quantity})` : ''} added to your cart`,
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
    
    toast({
      title: "Removed from cart",
      description: "Item removed from your cart",
    });
  }, []);

  const updateCartItem = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    toast({
      title: "Cart cleared",
      description: "All items removed from cart",
    });
  }, []);

  const calculateTotals = useCallback(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    return { subtotal, tax, total };
  }, [cart]);

  const createOrder = useCallback(async (
    customerInfo?: Order['customerInfo'],
    pickupInfo?: Order['pickupInfo']
  ): Promise<Order | null> => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to cart before placing order",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { subtotal, tax, total } = calculateTotals();
      
      const orderData = {
        items: cart,
        subtotal,
        tax,
        tip: 0, // Can be updated later
        total,
        status: 'draft' as const,
        customerInfo,
        pickupInfo
      };

      const response = await apiService.createOrder(cart, customerInfo);
      
      const newOrder: Order = {
        id: response.order_id,
        ...orderData,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setCurrentOrder(newOrder);
      
      toast({
        title: "Order created",
        description: `Order #${response.order_id} created successfully`,
      });

      return newOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      setError(errorMessage);
      toast({
        title: "Order creation failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [cart, calculateTotals]);

  const updateOrder = useCallback(async (orderId: string, updates: Partial<Order>) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiService.updateOrderStatus(orderId, updates.status || 'pending');
      
      if (currentOrder && currentOrder.id === orderId) {
        setCurrentOrder(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
      }

      toast({
        title: "Order updated",
        description: "Order updated successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order';
      setError(errorMessage);
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentOrder]);

  const getOrder = useCallback(async (orderId: string): Promise<Order | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.getOrder(orderId);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order';
      setError(errorMessage);
      toast({
        title: "Failed to load order",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncCartWithBackend = useCallback(async () => {
    // This would sync cart state with backend session storage
    // For now, we'll just validate cart items exist
    try {
      console.log('Syncing cart with backend...', cart.length, 'items');
      // Implementation would depend on backend session management
    } catch (err) {
      console.error('Cart sync failed:', err);
    }
  }, [cart]);

  return {
    cart,
    currentOrder,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    createOrder,
    updateOrder,
    getOrder,
    calculateTotals,
    syncCartWithBackend
  };
};