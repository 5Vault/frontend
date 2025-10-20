import type { ReactNode } from "react";
import Icons from "./Icons";

type ContentType = {
  side: {
    [key: string]: {
      labels: {
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
      icon: Icons.home,
    },
    storage: {
      labels: {
        pt: "Armazenamento",
        en: "Storage",
      },
      icon: Icons.storage,
    },
    settings: {
      labels: {
        pt: "Configurações",
        en: "Settings",
      },
      icon: Icons.settings,
    },
  },
  plans: {
    basic: {
      labels: {
        pt: "Básico",
        en: "Basic",
      },
      cost: {
        pt: "R$20/mês",
        en: "R$20/month",
      },
      description: {
        pt: "Ideal para servidores pequenos",
        en: "Ideal for small servers",
      },
      included: {
        pt: ["Armazenamento de 100GB", "Suporte 24/7", "Request Ilimitados"],
        en: ["100GB Storage", "24/7 Support", "Unlimited Requests"],
      },
    },
    pro: {
      labels: {
        pt: "Profissional",
        en: "Professional",
      },
      cost: {
        pt: "R$50/mês",
        en: "R$50/month",
      },
      description: {
        pt: "Para comunidades médias",
        en: "Ideal for medium communities",
      },
      included: {
        pt: [
          "Armazenamento de 250GB",
          "Suporte 24/7",
          "Request Ilimitados",
          "Keys com permissões",
          "Backup Automático",
        ],
        en: [
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
        pt: "Empresarial",
        en: "Enterprise",
      },
      cost: {
        pt: "R$100/mês",
        en: "R$100/month",
      },
      description: {
        pt: "Para grandes empresas",
        en: "Ideal for large enterprises",
      },
      included: {
        pt: [
          "Armazenamento de 1TB",
          "Suporte 24/7",
          "Request Ilimitados",
          "Keys com permissões",
          "Backup Automático",
          "Crie até 6 storages",
        ],
        en: [
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
