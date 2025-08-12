// src/hooks/useAdvancedFeatures.ts
import { useState, useCallback, useEffect } from 'react';
import { apiService } from '@/services/api';
import { toast } from '@/hooks/use-toast';

// Emotional Support Hook
export interface EmotionalState {
  emotion: string;
  confidence: number;
  recommendations: string[];
  breathingExercise?: {
    instruction: string;
    duration: number;
  };
  affirmation?: string;
}

export const useEmotionalSupport = () => {
  const [currentEmotion, setCurrentEmotion] = useState<EmotionalState | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeEmotion = useCallback(async (text: string): Promise<EmotionalState | null> => {
    setIsAnalyzing(true);
    try {
      // This would be integrated with the backend emotional analysis
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/emotional-support/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (response.ok) {
        const emotionalState = await response.json();
        setCurrentEmotion(emotionalState);
        return emotionalState;
      }
    } catch (error) {
      console.error('Emotion analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
    return null;
  }, []);

  const getTherapeuticRecommendations = useCallback(async (emotion: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/emotional-support/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotion })
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to get therapeutic recommendations:', error);
    }
    return null;
  }, []);

  return {
    currentEmotion,
    isAnalyzing,
    analyzeEmotion,
    getTherapeuticRecommendations
  };
};

// Virtual Queue Hook
export interface QueueStatus {
  position: number;
  estimatedWaitTime: number;
  totalInQueue: number;
  orderType: 'pickup' | 'delivery';
  status: 'waiting' | 'preparing' | 'ready' | 'completed';
}

export const useVirtualQueue = () => {
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [isInQueue, setIsInQueue] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const joinQueue = useCallback(async (customerId: string, orderType: 'pickup' | 'delivery' = 'pickup') => {
    setIsLoading(true);
    try {
      const response = await apiService.joinQueue(customerId, orderType);
      setQueueStatus(response);
      setIsInQueue(true);
      
      toast({
        title: "Joined Queue",
        description: `You're #${response.position} in line. Estimated wait: ${response.estimatedWaitTime} minutes`,
      });
    } catch (error) {
      toast({
        title: "Queue Join Failed",
        description: "Unable to join queue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateQueueStatus = useCallback(async () => {
    if (!isInQueue) return;
    
    try {
      const response = await apiService.getQueueStatus();
      setQueueStatus(response);
    } catch (error) {
      console.error('Failed to update queue status:', error);
    }
  }, [isInQueue]);

  const leaveQueue = useCallback(() => {
    setQueueStatus(null);
    setIsInQueue(false);
    toast({
      title: "Left Queue",
      description: "You have been removed from the queue",
    });
  }, []);

  // Poll queue status every 30 seconds
  useEffect(() => {
    if (!isInQueue) return;
    
    const interval = setInterval(updateQueueStatus, 30000);
    return () => clearInterval(interval);
  }, [isInQueue, updateQueueStatus]);

  return {
    queueStatus,
    isInQueue,
    isLoading,
    joinQueue,
    updateQueueStatus,
    leaveQueue
  };
};

// Weather Recommendations Hook
export interface WeatherRecommendation {
  weather: {
    condition: string;
    temperature: number;
    humidity: number;
  };
  recommendations: {
    drinks: string[];
    food: string[];
    mood: string;
    suggestion: string;
  };
}

export const useWeatherRecommendations = () => {
  const [recommendations, setRecommendations] = useState<WeatherRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<string>('');

  const getRecommendations = useCallback(async (userLocation?: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.getWeatherRecommendations(userLocation);
      setRecommendations(response);
      
      if (response.recommendations.suggestion) {
        toast({
          title: "Weather Recommendation",
          description: response.recommendations.suggestion,
        });
      }
    } catch (error) {
      console.error('Failed to get weather recommendations:', error);
      toast({
        title: "Weather Service Unavailable",
        description: "Unable to get weather-based recommendations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude},${position.coords.longitude}`;
          setLocation(coords);
          getRecommendations(coords);
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: "Location Access Denied",
            description: "Using default weather recommendations",
            variant: "destructive",
          });
          getRecommendations(); // Get default recommendations
        }
      );
    } else {
      getRecommendations(); // Fallback to default
    }
  }, [getRecommendations]);

  return {
    recommendations,
    isLoading,
    location,
    getRecommendations,
    requestLocation
  };
};

// Analytics Hook
export interface AnalyticsData {
  totalConversations: number;
  totalOrders: number;
  conversionRate: number;
  customerSatisfaction: number;
  popularItems: Array<{
    id: string;
    name: string;
    orderCount: number;
  }>;
  emotionalInsights: {
    topEmotions: string[];
    supportSessionsCount: number;
  };
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('7d');

  const fetchAnalytics = useCallback(async (period: string = '7d') => {
    setIsLoading(true);
    try {
      const response = await apiService.getAnalytics(period);
      setAnalytics(response.data);
      setTimeframe(period);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast({
        title: "Analytics Unavailable",
        description: "Unable to load analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    timeframe,
    fetchAnalytics
  };
};