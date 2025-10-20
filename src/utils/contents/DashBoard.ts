type dashboardContentType = {
    [key: string]: {
        pt: string;
        en: string;
    };
}

const dashboardContent: dashboardContentType = {
  welcome: {
    pt: "Bem vindo(a) ao Painel de Controle",
    en: "Welcome to the Dashboard",
  },
  subtitle: {
    pt: "Gerenciar armazenamento em nuvem com facilidade",
    en: "Manage your cloud storage infrastructure with ease",
  },
  viewAll: {
    pt: "Ver todos os storages",
    en: "View all storages",
  },
  addStorage: {
    pt: "Adicionar Storage",
    en: "Add Storage",
  },
};

export default dashboardContent;
