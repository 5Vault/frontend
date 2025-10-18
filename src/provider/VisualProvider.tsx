import { useEffect, useState, type ReactNode } from "react";
import VisualContext from "../context/VisualContext";
import type { TierType } from "../@types/Tier";
import axios from "axios";

const VisualProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<"en" | "pt">("en");
  const [theme, setTheme] = useState<"light" | "dark">("light");
    const [tiers, setTiers] = useState<TierType[]>([]);

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/tier/`);
        const data = await response.data;
        setTiers(data);
      } catch (error) {
        console.error("Error fetching tiers:", error);
      }
    };

    fetchTiers();
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "pt" : "en"));
    localStorage.setItem("language", language === "en" ? "pt" : "en");
  };

  return (
    <VisualContext.Provider
      value={{ language, theme, setTheme, toggleLanguage, setLanguage, tiers, setTiers }}
    >
      {children}
    </VisualContext.Provider>
  );
};

export default VisualProvider;
