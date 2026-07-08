import { useEffect, useState, type ReactNode } from "react";
import VisualContext from "../context/VisualContext";
import type { TierType } from "../@types/Tier";
import axios from "axios";

const defaultTiers: TierType[] = [
  {
    id: "free",
    name: "Gratuito",
    cost: 0,
    description: { pt: "Para testar a plataforma. Sem cartão de crédito.", en: "To test the platform. No credit card required." },
    included: [
      { pt: "1GB de Armazenamento", en: "1GB Storage" },
      { pt: "1 Chave de API", en: "1 API Key" },
      { pt: "5000 Requisições/semana", en: "5000 Requests/week" },
      { pt: "Subdomínio compartilhado", en: "Shared subdomain" },
    ],
  },
  {
    id: "starter",
    name: "Iniciante",
    cost: 19.9,
    description: { pt: "Ideal para comunidades pequenas.", en: "Ideal for small communities." },
    included: [
      { pt: "60GB de Armazenamento", en: "60GB Storage" },
      { pt: "3 Chaves de API", en: "3 API Keys" },
      { pt: "Requisições Ilimitadas", en: "Unlimited Requests" },
      { pt: "Subdomínio compartilhado", en: "Shared subdomain" },
      { pt: "Suporte por e-mail", en: "Email support" },
    ],
  },
  {
    id: "pro",
    name: "Profissional",
    cost: 39.9,
    description: { pt: "Para comunidades em crescimento. Configuração de outros domínios e backup automático.", en: "For growing communities." },
    included: [
      { pt: "150GB de Armazenamento", en: "150GB Storage" },
      { pt: "10 Chaves de API com permissões", en: "10 API Keys with permissions" },
      { pt: "Requisições Ilimitadas", en: "Unlimited Requests" },
      { pt: "Configuração de outros domínios", en: "Configuration of other domains" },
      { pt: "Backup automático diário", en: "Daily automatic backup" },
      { pt: "Suporte prioritário 24/7", en: "Priority 24/7 support" },
    ],
  },
  {
    id: "enterprise",
    name: "Empresarial",
    cost: 79.9,
    description: { pt: "Para grandes operações. SLA garantido.", en: "For large operations. Guaranteed SLA." },
    included: [
      { pt: "250GB de Armazenamento", en: "250GB Storage" },
      { pt: "Chaves de API ilimitadas", en: "Unlimited API Keys" },
      { pt: "Requisições Ilimitadas", en: "Unlimited Requests" },
      { pt: "Configuração de outros domínios", en: "Configuration of other domains" },
      { pt: "Backup automático diário", en: "Daily backup" },
      { pt: "Até 5 Storages", en: "Up to 5 Storages" },
      { pt: "SLA 99,9% de uptime", en: "99.9% uptime SLA" },
      { pt: "Suporte dedicado", en: "Dedicated support" },
    ],
  },
];

const VisualProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<"en" | "pt">("pt");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [tiers, setTiers] = useState<TierType[]>(defaultTiers);

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/tier/`);
        if (Array.isArray(response.data) && response.data.length > 0) {
          setTiers(response.data);
        }
      } catch {
        // Usa os planos padrão já definidos no estado inicial
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
