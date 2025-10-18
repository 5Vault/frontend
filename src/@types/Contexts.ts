import type { TierType, UserTier } from "./Tier";

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
  tier: UserTier | null;
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
