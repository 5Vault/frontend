type dashboardContentType = {
    [key: string]: {
        ptBR: string;
        enUS: string;
    };
}

const dashboardContent: dashboardContentType = {
  welcome: {
    ptBR: "Bem vindo(a) ao Painel de Controle",
    enUS: "Welcome to the Dashboard",
  },
  subtitle: {
    ptBR: "Gerenciar armazenamento em nuvem com facilidade",
    enUS: "Manage your cloud storage infrastructure with ease",
  },
  viewAll: {
    ptBR: "Ver todos os storages",
    enUS: "View all storages",
  },
  addStorage: {
    ptBR: "Adicionar Storage",
    enUS: "Add Storage",
  },
};

export default dashboardContent;
