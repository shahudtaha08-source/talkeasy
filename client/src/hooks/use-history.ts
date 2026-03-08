import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useEmotionalHistory() {
  return useQuery({
    queryKey: [api.history.emotional.path],
    queryFn: async () => {
      const res = await fetch(api.history.emotional.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch emotional history");
      return await res.json();
    },
  });
}
