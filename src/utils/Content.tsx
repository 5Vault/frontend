import type { ReactNode } from "react";
import Icons from "./Icons";

type ContentType = {
  side: {
    [key: string]: {
      labels: {
        pt: string;
        en: string;
      };
      sublabels?: {
        pt: string;
        en: string;
      };
      icon: ReactNode;
    };
  };
  plans: {
    [key: string]: {
      labels: {
        pt: string;
        en: string;
      };
      cost: {
        pt: string;
        en: string;
      };
      description: {
        pt: string;
        en: string;
      };
      included: {
        pt: string[];
        en: string[];
      };
    };
  };
};

const Content: ContentType = {
  side: {
    dashboard: {
      labels: {
        pt: "Painel de Controle",
        en: "Dashboard",
      },
      sublabels: {
        pt: "Visão geral da sua conta",
        en: "Overview of your account",
      },      
      icon: Icons.home,
    },
    storage: {
      labels: {
        pt: "Armazenamento",
        en: "Storage",
      },
      sublabels: {
        pt: "Gerencie seu armazenamento",
        en: "Manage your storage",
      },
      icon: Icons.storage,
    },
    "api-keys": {
      labels: {
        pt: "Chaves de API",
        en: "API Keys",
      },
      sublabels: {
        pt: "Acesso programático",
        en: "Programmatic access",
      },
      icon: Icons.key,
    },
    sdk: {
      labels: { pt: "SDKs", en: "SDKs" },
      sublabels: { pt: "Scripts para FiveM e Roblox", en: "Scripts for FiveM & Roblox" },
      icon: Icons.sdk,
    },
    "settings/tier": {
      labels: {
        pt: "Tier",
        en: "Tier",
      },
      sublabels: {
        pt: "Gerencie seu plano",
        en: "Manage your plan",
      },
      icon: Icons.flag,
    },
    settings: {
      labels: {
        pt: "Configurações",
        en: "Settings",
      },
      sublabels: {
        pt: "Ajuste suas preferências",
        en: "Adjust your preferences",
      },
      icon: Icons.settings,
    },
  },
  plans: {
    free: {
      labels: { pt: "Gratuito", en: "Free" },
      cost: { pt: "R$0/mês", en: "R$0/month" },
      description: { pt: "Para testar a plataforma. Sem cartão de crédito.", en: "To test the platform. No credit card required." },
      included: {
        pt: ["10GB de Armazenamento", "1 Chave de API", "500 Requisições/semana", "Subdomínio compartilhado"],
        en: ["10GB Storage", "1 API Key", "500 Requests/week", "Shared subdomain"],
      },
    },
    starter: {
      labels: { pt: "Iniciante", en: "Starter" },
      cost: { pt: "R$9,90/mês", en: "R$9.90/month" },
      description: { pt: "Ideal para comunidades pequenas. Mais storage que a concorrência pela metade do preço.", en: "Ideal for small communities." },
      included: {
        pt: ["60GB de Armazenamento", "3 Chaves de API", "Requisições Ilimitadas", "Subdomínio compartilhado", "Suporte por e-mail"],
        en: ["60GB Storage", "3 API Keys", "Unlimited Requests", "Shared subdomain", "Email support"],
      },
    },
    pro: {
      labels: { pt: "Profissional", en: "Professional" },
      cost: { pt: "R$19,90/mês", en: "R$19.90/month" },
      description: { pt: "Para comunidades em crescimento. Domínio próprio e backup automático.", en: "For growing communities." },
      included: {
        pt: ["200GB de Armazenamento", "10 Chaves de API com permissões", "Requisições Ilimitadas", "Domínio próprio", "Backup automático diário", "Suporte prioritário 24/7"],
        en: ["200GB Storage", "10 API Keys with permissions", "Unlimited Requests", "Custom domain", "Daily automatic backup", "Priority 24/7 support"],
      },
    },
    enterprise: {
      labels: { pt: "Empresarial", en: "Enterprise" },
      cost: { pt: "R$39,90/mês", en: "R$39.90/month" },
      description: { pt: "Para grandes operações. 1TB de storage e SLA garantido.", en: "For large operations. Guaranteed SLA." },
      included: {
        pt: ["1TB de Armazenamento", "Chaves de API ilimitadas", "Requisições Ilimitadas", "Domínio próprio", "Backup automático diário", "Até 5 Storages", "SLA 99,9% de uptime", "Suporte dedicado"],
        en: ["1TB Storage", "Unlimited API Keys", "Unlimited Requests", "Custom domain", "Daily backup", "Up to 5 Storages", "99.9% uptime SLA", "Dedicated support"],
      },
    },
  },
};

export default Content;
