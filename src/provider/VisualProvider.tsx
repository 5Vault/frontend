import { useState, type ReactNode } from "react";
import VisualContext from "../context/VisualContext";

const VisualProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<"enUS" | "ptBR">("enUS");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "enUS" ? "ptBR" : "enUS"));
    localStorage.setItem("language", language === "enUS" ? "ptBR" : "enUS");
  };

  return (
    <VisualContext.Provider
      value={{ language, theme, setTheme, toggleLanguage }}
    >
      {children}
    </VisualContext.Provider>
  );
};

export default VisualProvider;
