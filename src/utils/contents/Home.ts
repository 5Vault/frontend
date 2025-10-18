import type { ReactElement } from "react";
import Icons from "../Icons";

type HomeContentType = {
  one: {
    pt: string;
    en: string;
  };
  two: {
    pt: string;
    en: string;
  };
  three: {
    pt: string;
    en: string;
  };
  four: {
    pt: string;
    en: string;
  };
  benefits: {
    [key: string]: {
      title: {
        pt: string;
        en: string;
      };
      description: {
        pt: string;
        en: string;
      };
      icon?: ReactElement;
    };
  };
};

const homeContent: HomeContentType = {
  one: {
    pt: "Armazenamento rápido e seguro para o seu servidor de FiveM",
    en: "Fast and secure storage for your FiveM server",
  },
  two: {
    pt: "  Nossa plataforma é otimizada para servidores de FiveM, garantindo que você tenha acesso rápido com alta disponibilidade, baixa latência e confiável aos seus recursos.",
    en: "Our platform is optimized for FiveM servers, ensuring you have fast access with high availability, low latency, and reliable resources.",
  },
  three: {
    pt: "Começar Agora",
    en: "Get Started Now",
  },
  four: {
    pt: "Conhecer Planos",
    en: "View Plans",
  },
  benefits: {
    one: {
      title: { pt: "Alta Velocidade", en: "High Speed" },
      description: {
        pt: "Transferência otimizada para FiveM.",
        en: "Optimized transfer for FiveM.",
      },
      icon: Icons.rocket,
    },
    two: {
      title: { pt: "Segurança Máxima", en: "Maximum Security" },
      description: {
        pt: "Criptografia de ponta a ponta.",
        en: "End-to-end encryption.",
      },
      icon: Icons.lock,
    },
    three: {
      title: { pt: "Backups Automáticos", en: "Automatic Backups" },
      description: {
        pt: "Realize backups automáticos de seus dados.",
        en: "Automatically back up your data.",
      },
      icon: Icons.paper,
    },
    four: {
      title: { pt: "Latência Baixa", en: "Low Latency" },
      description: {
        pt: "Conexões rápidas e responsivas.",
        en: "Fast and responsive connections.",
      },
      icon: Icons.zap32,
    },
  },
};

export default homeContent;
