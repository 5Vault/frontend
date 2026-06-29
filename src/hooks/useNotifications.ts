import { useCallback, useEffect, useRef, useState } from "react";
import useAxios from "../utils/axiosConfig";

export type NotifCounts = Record<string, number>;

// Maps notification types to sidebar route keys.
export const NOTIF_ROUTE_MAP: Record<string, string> = {
  ticket_reply: "suporte",
  system: "dashboard",
  tier_upgrade: "settings/tier",
};

const POLL_MS = 30_000;

export function useNotifications() {
  const axiosInstance = useAxios();
  const [counts, setCounts] = useState<NotifCounts>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetch = useCallback(async () => {
    try {
      const r = await axiosInstance.get<{ counts: NotifCounts }>("/notifications/unread-count");
      setCounts(r.data.counts ?? {});
    } catch {
      // Silently ignore — don't spam errors on poll failures
    }
  }, []);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, POLL_MS);
    timerRef.current = id;
    return () => clearInterval(id);
  }, [fetch]);

  const markEntityRead = useCallback(async (type: string, entityId: string) => {
    try {
      await axiosInstance.post("/notifications/read-entity", { type, entity_id: entityId });
      setCounts(prev => {
        const next = { ...prev };
        if (next[type] > 0) next[type]--;
        return next;
      });
    } catch {
      // ignore
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await axiosInstance.post("/notifications/read-all");
      setCounts({});
    } catch {
      // ignore
    }
  }, []);

  // Total unread across all types.
  const total = Object.values(counts).reduce((s, n) => s + n, 0);

  return { counts, total, markEntityRead, markAllRead, refresh: fetch };
}
