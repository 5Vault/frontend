import type { ReactNode } from "react";
import Icons from "./Icons";

type ContentType = {
  side: {
    [key: string]: {
      labels: {
        ptBR: string;
        enUS: string;
      };
      icon: ReactNode;
    };
  };
  plans: {
    [key: string]: {
      labels: {
        ptBR: string;
        enUS: string;
      };
      cost: {
        ptBR: string;
        enUS: string;
      };
      description: {
        ptBR: string;
        enUS: string;
      };
      included: {
        ptBR: string[];
        enUS: string[];
      };
    };
  };
};

const Content: ContentType = {
  side: {
    dashboard: {
      labels: {
        ptBR: "Painel de Controle",
        enUS: "Dashboard",
      },
      icon: Icons.home,
    },
    storages: {
      labels: {
        ptBR: "Armazenamento",
        enUS: "Storage",
      },
      icon: Icons.storage,
    },
    settings: {
      labels: {
        ptBR: "Configurações",
        enUS: "Settings",
      },
      icon: Icons.settings,
    },
  },
  plans: {
    basic: {
      labels: {
        ptBR: "Básico",
        enUS: "Basic",
      },
      cost: {
        ptBR: "R$20/mês",
        enUS: "R$20/month",
      },
      description: {
        ptBR: "Ideal para servidores pequenos",
        enUS: "Ideal for small servers",
      },
      included: {
        ptBR: ["Armazenamento de 100GB", "Suporte 24/7", "Request Ilimitados"],
        enUS: ["100GB Storage", "24/7 Support", "Unlimited Requests"],
      },
    },
    pro: {
      labels: {
        ptBR: "Profissional",
        enUS: "Professional",
      },
      cost: {
        ptBR: "R$50/mês",
        enUS: "R$50/month",
      },
      description: {
        ptBR: "Para comunidades médias",
        enUS: "Ideal for medium communities",
      },
      included: {
        ptBR: [
          "Armazenamento de 250GB",
          "Suporte 24/7",
          "Request Ilimitados",
          "Keys com permissões",
          "Backup Automático",
        ],
        enUS: [
          "250GB Storage",
          "24/7 Support",
          "Unlimited Requests",
          "Keys with permissions",
          "Automatic Backup",
        ],
      },
    },
    enterprise: {
      labels: {
        ptBR: "Empresarial",
        enUS: "Enterprise",
      },
      cost: {
        ptBR: "R$100/mês",
        enUS: "R$100/month",
      },
      description: {
        ptBR: "Para grandes empresas",
        enUS: "Ideal for large enterprises",
      },
      included: {
        ptBR: [
          "Armazenamento de 1TB",
          "Suporte 24/7",
          "Request Ilimitados",
          "Keys com permissões",
          "Backup Automático",
          "Crie até 6 storages",
        ],
        enUS: [
          "1TB Storage",
          "24/7 Support",
          "Unlimited Requests",
          "Keys with permissions",
          "Automatic Backup",
          "Create up to 6 storages",
        ],
      },
    },
  },
};

export default Content;
