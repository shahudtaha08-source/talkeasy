import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useMoods() {
  return useQuery({
    queryKey: [api.moods.list.path],
    queryFn: async () => {
      const res = await fetch(api.moods.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch moods");
      return await res.json();
    },
  });
}

export function useCreateMood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { mood: string; notes?: string; date?: string }) => {
      const res = await fetch(api.moods.create.path, {
        method: api.moods.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create mood");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.moods.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.history.emotional.path] });
    },
  });
}
