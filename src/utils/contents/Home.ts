import type { ReactElement } from "react";
import Icons from "../Icons";

type HomeContentType = {
  one: {
    ptBR: string;
    enUS: string;
  };
  two: {
    ptBR: string;
    enUS: string;
  };
  three: {
    ptBR: string;
    enUS: string;
  };
  four: {
    ptBR: string;
    enUS: string;
  };
  benefits: {
    [key: string]: {
      title: {
        ptBR: string;
        enUS: string;
      };
      description: {
        ptBR: string;
        enUS: string;
      };
      icon?: ReactElement;
    };
  };
};

const homeContent: HomeContentType = {
  one: {
    ptBR: "Armazenamento rápido e seguro para o seu servidor de FiveM",
    enUS: "Fast and secure storage for your FiveM server",
  },
  two: {
    ptBR: "  Nossa plataforma é otimizada para servidores de FiveM, garantindo que você tenha acesso rápido com alta disponibilidade, baixa latência e confiável aos seus recursos.",
    enUS: "Our platform is optimized for FiveM servers, ensuring you have fast access with high availability, low latency, and reliable resources.",
  },
  three: {
    ptBR: "Começar Agora",
    enUS: "Get Started Now",
  },
  four: {
    ptBR: "Conhecer Planos",
    enUS: "View Plans",
  },
  benefits: {
    one: {
      title: { ptBR: "Alta Velocidade", enUS: "High Speed" },
      description: {
        ptBR: "Transferência otimizada para FiveM.",
        enUS: "Optimized transfer for FiveM.",
      },
      icon: Icons.rocket,
    },
    two: {
      title: { ptBR: "Segurança Máxima", enUS: "Maximum Security" },
      description: {
        ptBR: "Criptografia de ponta a ponta.",
        enUS: "End-to-end encryption.",
      },
      icon: Icons.lock,
    },
    three: {
      title: { ptBR: "Backups Automáticos", enUS: "Automatic Backups" },
      description: {
        ptBR: "Realize backups automáticos de seus dados.",
        enUS: "Automatically back up your data.",
      },
      icon: Icons.paper,
    },
    four: {
      title: { ptBR: "Latência Baixa", enUS: "Low Latency" },
      description: {
        ptBR: "Conexões rápidas e responsivas.",
        enUS: "Fast and responsive connections.",
      },
      icon: Icons.zap32,
    },
  },
};

export default homeContent;
