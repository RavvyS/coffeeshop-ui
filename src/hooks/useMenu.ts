// src/hooks/useMenu.ts
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';
import { toast } from '@/hooks/use-toast';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'coffee' | 'non-coffee' | 'food' | 'sri-lankan-coffee' | 'sri-lankan-non-coffee' | 'sri-lankan-food';
  description?: string;
  isHot?: boolean;
  image?: string;
  ingredients?: string[];
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  availability?: {
    isAvailable: boolean;
    estimatedTime?: number; // in minutes
  };
}

interface UseMenuReturn {
  items: MenuItem[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  refreshMenu: () => Promise<void>;
  getItemById: (id: string) => MenuItem | undefined;
  getItemsByCategory: (category: string) => MenuItem[];
  searchItems: (query: string) => MenuItem[];
}

export const useMenu = (): UseMenuReturn => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshMenu = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.getMenu();
      setItems(response.items || []);
      setCategories(response.categories || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load menu';
      setError(errorMessage);
      toast({
        title: "Menu Load Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Fallback to local menu data if available
      // You can keep some basic items as fallback
      const fallbackItems: MenuItem[] = [
        {
          id: '1',
          name: 'Americano',
          price: 3.50,
          category: 'coffee',
          description: 'A simple, classic choice made by diluting espresso with hot water.',
          isHot: true,
          availability: { isAvailable: true, estimatedTime: 5 }
        },
        {
          id: '2',
          name: 'Cappuccino',
          price: 4.00,
          category: 'coffee',
          description: 'Equal parts espresso, steamed milk, and frothed milk.',
          isHot: true,
          availability: { isAvailable: true, estimatedTime: 7 }
        }
      ];
      setItems(fallbackItems);
      setCategories(['coffee', 'non-coffee', 'food']);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMenu();
  }, [refreshMenu]);

  const getItemById = useCallback((id: string): MenuItem | undefined => {
    return items.find(item => item.id === id);
  }, [items]);

  const getItemsByCategory = useCallback((category: string): MenuItem[] => {
    return items.filter(item => item.category === category);
  }, [items]);

  const searchItems = useCallback((query: string): MenuItem[] => {
    if (!query.trim()) return items;
    
    const searchTerm = query.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm)
    );
  }, [items]);

  return {
    items,
    categories,
    isLoading,
    error,
    refreshMenu,
    getItemById,
    getItemsByCategory,
    searchItems
  };
};