export type VisualContextType = {
  language: "enUS" | "ptBR";
  toggleLanguage: () => void;
  setLanguage: (language: "enUS" | "ptBR") => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
};

export type User = {
  user_id: string;
  email: string;
  name: string;
  username: string;
  phone: string;
};

export type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  fetchUserData: (token: string) => Promise<User | null>;
  loading: boolean;
  refreshAccessToken: () => Promise<string | null>;
};
