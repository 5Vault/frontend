export type VisualContextType = {
  language: "enUS" | "ptBR";
  toggleLanguage: () => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
};

export type AuthContextType = {
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};
