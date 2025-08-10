import Logo from "../assets/logo.png";
import Card from "../components/Card";
import useVisualContext from "../hook/useVisualContext";
import Content from "../utils/Content";
import homeContent from "../utils/contents/Home";
import Icons from "../utils/Icons";

const Home = () => {
  const { language } = useVisualContext();

  return (
    <div className="flex flex-col items-center justify-start h-screen w-screen">
      <header className="w-full h-24 flex justify-between p-4">
        <span className="flex items-center gap-2">
          <img src={Logo} alt="Logo" className="h-12" />
          <span className="text-3xl font-bold">5Vault</span>
        </span>
        <span className="flex items-center gap-2">
          <button
            className="border border-zinc-100/10 text-white py-2 px-4 rounded"
            onClick={() => {
              window.location.href = "/account/?mode=login";
            }}
          >
            Login
          </button>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded"
            onClick={() => {
              window.location.href = "/account/?mode=register";
            }}
          >
            Register
          </button>
        </span>
      </header>
      <div className="flex gap-12 items-center justify-evenly w-[80%] px-10 mt-44">
        <div className="text-center w-[50%]">
          <h1 className="text-2xl font-bold">
            {homeContent.one[language] || ""}
          </h1>
          <p className="text-sm mt-6 text-zinc-400">
            {homeContent.two[language] || ""}
          </p>
          <span className="flex gap-2 mt-6">
            <button className="bg-blue-500">
              {homeContent.three[language] || ""}
            </button>
            <button className="border border-zinc-100/10">
              {homeContent.four[language] || ""}
            </button>
          </span>
        </div>
        <img src={Logo} alt="Logo" className="h-68" />
      </div>

      <div className="w-fit px-10 mt-16 py-4">
        {/* Benefícios */}
        <div className="mb-16">
          <h2 className="text-xl font-bold mb-8">Benefícios</h2>
          <div className="flex justify-center gap-2">
            {Object.keys(homeContent.benefits).map((key) => {
              const benefit = homeContent.benefits[key];
              if (
                typeof benefit === "object" &&
                benefit !== null &&
                "title" in benefit &&
                "description" in benefit
              ) {
                return (
                  <Card
                    key={key}
                    icon={
                      benefit.icon
                        ? benefit.icon
                        : Icons[key as keyof typeof Icons]
                    }
                    title={benefit.title[language]}
                    description={benefit.description[language]}
                  />
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* Como Funciona */}
        <div className="mb-16">
          <h2 className="text-xl font-bold mb-8">Como Funciona</h2>
          <div className="flex justify-center gap-2">
            <Card
              icon={Icons.account}
              title="Crie sua conta"
              description="1º Passo"
            />
            <Card
              icon={Icons.conigure}
              title="Configure seu servidor"
              description="2º Passo"
            />
            <Card
              icon={Icons.folder}
              title="Armazene seus arquivos"
              description="3º Passo"
            />
          </div>
        </div>

        {/* Planos */}
        <div>
          <h2 className="text-xl font-bold mb-8">Planos</h2>
          <div className="flex justify-center gap-4">
            {(
              Object.keys(Content.plans) as Array<keyof typeof Content.plans>
            ).map((key) => {
              const plan = Content.plans[key];
              return (
                <div
                  key={key}
                  className={` shadow-md rounded-lg p-4 flex flex-col items-center justify-between gap-2 h-90 w-80 ${
                    key === "pro"
                      ? "border-2 border-blue-500"
                      : "border border-zinc-100/10"
                  }`}
                >
                  <span className="font-bold text-3xl text-center">
                    {plan.labels[language]}
                  </span>
                  <span className="text-zinc-200 text-2xl font-semibold">
                    {plan.cost[language]}
                  </span>
                  <ul className="text-sm text-zinc-500 mt-2 bg-zinc-700 p-2 rounded-lg w-full h-34 flex flex-col justify-start">
                    {plan.included[language].map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <span className="text-zinc-500 text-sm">
                    {plan.description[language]}
                  </span>
                  <button
                    className={`w-full border border-zinc-100/10 text-gray-400 py-2 rounded ${
                      key === "pro" ? "bg-blue-500 text-white" : ""
                    } hover:bg-blue-400 hover:text-white transition-colors`}
                  >
                    Escolher
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
