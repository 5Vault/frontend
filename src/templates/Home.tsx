import Logo from "../assets/logow.png";
import Card from "../components/Card";
import HomeTop from "../components/HomeTop";
import useVisualContext from "../hook/useVisualContext";
import homeContent from "../utils/contents/Home";
import Icons from "../utils/Icons";
import liberty from "../assets/liberty.png";
import TBG from "../assets/tbg.png";
import type { TierType } from "../@types/Tier";
import DashButton from "../components/DashButton";
import HomeSteps from "../components/HomeSteps";


const serversPartners = [
  {
    name: "Liberty City",
    logo: liberty,
    width: 120,
  },
  {
    name: "The Best Gaming",
    logo: TBG,
    width: 120,    
  },
]

const Home = () => {
  const { language, tiers } = useVisualContext();
  return (
    <div className="flex flex-col items-center justify-start h-full w-screen bg-gdnt">
      <HomeTop />
      <div className="flex gap-12 items-center justify-evenly w-[80%] px-10 mt-44">
        <div className="text-center w-[50%]">
          <h1 className="text-2xl font-bold">
            {homeContent.one[language] || ""}
          </h1>
          <p className="text-sm mt-6 text-zinc-400">
            {homeContent.two[language] || ""}
          </p>
          <span className="flex gap-2 mt-6">
            <button className="bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)]">
              {homeContent.three[language] || ""}
            </button>
            <DashButton label={homeContent.four[language] || ""} onClick={() => {}} />
            
          </span>
        </div>
        <img src={Logo} alt="Logo" className="h-68" />
      </div>     

      <div className="w-fit px-2 mt-4 py-4">
        {/* Benefícios */}
          <div className="flex justify-center gap-2 mb-16">
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

        {/* Servers */}
        <div className="mb-16">
          <h2 className="text-xl font-bold mb-8">Used By:</h2>
          <div className="flex justify-start gap-2">
            {serversPartners.map((server) => (
              <div key={server.name} className="flex flex-col items-center gap-2 border border-zinc-100/10 px-4 py-2 rounded-lg bg-zinc-900/50 w-50 group hover:scale-102 hover:shadow-lg transition-transform">
                <img src={server.logo} alt={server.name} width={server.width} />
                <h2 className="text-zinc-400 font-bold text-lg group-hover:text-[var(--primary-contrast-light)]">{server.name}</h2>
              </div>
            ))}
          </div>
        </div>

        {/* Como Funciona */}
        <HomeSteps />

        {/* Planos */}
        <div>
          <h2 className="text-xl font-bold mb-8">Planos</h2>
          <div className="flex justify-center gap-4">
            {tiers.map((tier: TierType) => {              
              return (
                <div
                  key={tier.id}
                  className={` shadow-md rounded-lg p-4 flex flex-col items-center justify-between gap-2 h-90 w-80 hover:scale-102 ${
                    tier.id === "pro"
                      ? "border-2 border-[var(--primary-contrast-light)]"
                      : "border border-zinc-100/10"
                  }`}
                >
                  <span className="font-bold text-3xl text-center">
                    {tier.name}
                  </span>
                  <span className="text-zinc-200 text-2xl font-semibold">
                    R$ {tier.cost} / {language === "en" ? "month" : "mês"}
                  </span>
                  <ul className="text-sm text-zinc-500 mt-2 bg-zinc-700 p-2 rounded-lg w-full h-34 flex flex-col justify-start">
                    {tier.included.map((item: { [key: string]: string }) => (
                      <li key={item[language]}>{item[language]}</li>
                    ))}
                  </ul>
                  <span className="text-zinc-500 text-sm">
                    {tier.description[language]}
                  </span>
                  <button
                    className={`w-full border border-zinc-100/10 text-gray-400 py-2 rounded ${
                      tier.id === "pro"
                        ? "bg-[var(--primary-contrast-light)] text-white"
                        : ""
                    } hover:bg-[var(--primary-contrast-dark)] hover:text-white transition-colors`}
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