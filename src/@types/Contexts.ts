import type { TierType } from "./Tier";

export type VisualContextType = {
  language: "en" | "pt";
  toggleLanguage: () => void;
  setLanguage: (language: "en" | "pt") => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  tiers: TierType[];
  setTiers: (tiers: TierType[]) => void;
};

export type User = {
  user_id: string;
  email: string;
  name: string;
  username: string;
  phone: string;
  tier: string | null;
  tier_name?: string;
  tier_update_at?: string;
  created_at: string;
  updated_at?: string;
};

export type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  fetchUserData: (token: string) => Promise<User | null>;
  loading: boolean;
  key: string | null;
  refreshAccessToken: () => Promise<string | null>;
};

export type SharedStorageContextType = {
  total_files: number;
  setTotalFiles: (total: number) => void;
  used_storage: number;
  setUsedStorage: (used: number) => void;
  total_storage: number;
  setTotalStorage: (total: number) => void;  
};