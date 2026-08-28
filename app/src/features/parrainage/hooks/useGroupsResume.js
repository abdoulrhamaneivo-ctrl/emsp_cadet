import { useQuery } from "@tanstack/react-query";
import { fetchGroupsResume } from "../api";

/** GET /api/me/groups-resume/ — clé [« groups-resume »] (doc 05 §2 / doc 13). */
export function useGroupsResume() {
  return useQuery({
    queryKey: ["groups-resume"],
    queryFn: fetchGroupsResume,
  });
}
