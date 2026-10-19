
import api from "./api";

/**
 * Search the authenticated user's documents semantically.
 * Backend endpoint: POST /api/ai/search
 */
export const semanticSearch = async (query) => {
  const trimmedQuery = query?.trim();

  if (!trimmedQuery) {
    return { success: true, count: 0, results: [] };
  }

  const response = await api.post("/ai/search", {
    query: trimmedQuery,
  });

  return response.data;
};
