// src/hooks/useProjectKnowledge.ts
import { useState, useCallback } from 'react';
import { apiService, ProjectKnowledgeResponse } from '@/services/api';

interface UseProjectKnowledgeReturn {
  search: (query: string) => Promise<ProjectKnowledgeResponse>;
  isLoading: boolean;
  error: string | null;
  lastResponse: ProjectKnowledgeResponse | null;
}

export const useProjectKnowledge = (): UseProjectKnowledgeReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<ProjectKnowledgeResponse | null>(null);

  const search = useCallback(async (query: string): Promise<ProjectKnowledgeResponse> => {
    if (!query.trim()) {
      throw new Error('Query cannot be empty');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.searchProjectKnowledge(query);
      setLastResponse(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search project knowledge';
      setError(errorMessage);
      
      // Return fallback response for graceful degradation
      const fallbackResponse: ProjectKnowledgeResponse = {
        response: "I'm having trouble accessing the knowledge base right now. Please try again in a moment, or feel free to ask me about our coffee menu, ordering process, or general coffee questions!",
        confidence: 0,
        sources: []
      };
      setLastResponse(fallbackResponse);
      return fallbackResponse;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    search,
    isLoading,
    error,
    lastResponse
  };
};