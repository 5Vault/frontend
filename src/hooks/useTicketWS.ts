import { useCallback, useEffect, useRef, useState } from "react";
import { sessionStore } from "../utils/sessionStore";

export type WsMessage = {
  message_id: string;
  ticket_id: string;
  sender_id: string;
  role: "user" | "admin";
  content: string;
  created_at: string;
};

type Options = {
  ticketId: string;
  enabled?: boolean; // set false when ticket is closed
};

const WS_BASE = (() => {
  const api = import.meta.env.VITE_SERVER_URL || "http://localhost:3000/api";
  // Convert http(s)://host/api → ws(s)://host
  return api.replace(/^http/, "ws").replace(/\/api.*$/, "");
})();

export function useTicketWS({ ticketId, enabled = true }: Options) {
  const [incoming, setIncoming] = useState<WsMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!enabled) return;
    const token = sessionStore.getUserToken();
    if (!token) return;

    const url = `${WS_BASE}/ws/ticket/${ticketId}?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const msg: WsMessage = JSON.parse(e.data);
        setIncoming(msg);
      } catch {
        // ignore malformed frames
      }
    };

    ws.onclose = () => {
      if (!enabled) return;
      // Reconnect after 3 seconds if closed unexpectedly.
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => ws.close();
  }, [ticketId, enabled]);

  useEffect(() => {
    connect();
    return () => {
      enabled && wsRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connect, enabled]);

  const send = useCallback((content: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify({ content }));
    return true;
  }, []);

  return { incoming, send };
}
