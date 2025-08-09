export type VisualContextType = {
  language: "enUS" | "ptBR";
  toggleLanguage: () => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
};
