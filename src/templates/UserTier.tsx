import { ArrowLeft, ArrowRight, Plane } from "lucide-react";
import HeaderTemplate from "../components/Header";
import useVisualContext from "../hook/useVisualContext";
import DashButton from "../components/DashButton";
import useAuthContext from "../hook/useAuthContext";
import Select from "react-select";

const TiersTemplate = () => {
  const { language, tiers } = useVisualContext();
  const {user} = useAuthContext();

  return (
    <div className="flex flex-col items-center justify-start h-screen w-screen p-2 gap-4">
      <HeaderTemplate
        icon={<Plane size={38} />}
        title="Tiers"
        description="Choose the right plan for your needs"
        content={
          <DashButton
            icon={<ArrowLeft size={16} />}
            label="Voltar"
            onClick={() => {window.history.back();}}
          />
        }
      />
      <div className="flex justify-center gap-4">
        {tiers.map(
          (tier, index) => {                        
            const userTier = user?.tier === tier.id;
            return (
              <div
                key={index}
                className={` shadow-md rounded-lg p-4 flex flex-col items-center justify-between gap-2 h-80 w-80 hover:scale-102 ${
                  tier.id === "pro"
                    ? "border-2 border-[var(--primary-contrast-light)]"
                    : "border border-zinc-100/10"
                } ${userTier ? "bg-zinc-700/30" : "bg-zinc-900/50"}`}
              >
                <span className="font-bold text-3xl text-center">
                  {tier.name}
                </span>
                <span className="text-zinc-200 text-2xl font-semibold">
                  R$ {tier.cost}
                </span>
                <ul className="text-sm text-zinc-500 mt-2 bg-zinc-700 p-2 rounded-lg w-full h-34 flex flex-col justify-start">
                  {tier.included.map((item) => (
                    <li key={item[language]}>{item[language]}</li>
                  ))}
                </ul>
                <span className="text-zinc-500 text-sm">
                  {tier.description[language]}
                </span>
              </div>
            );
          }
        )}
      </div>
      <div className="flex gap-4 w-[52%] justify-center">
        <div className="rounded-lg p-8 shadow-sm w-full border border-zinc-100/10 bg-zinc-900/50">
          {
            user?.tier === "free" ? (
              <span className="text-zinc-400">
                You are currently on the Free tier. Upgrade to a paid plan to
                unlock more features and storage.
              </span>
            ) : (
              <span className="text-zinc-400">
                You are currently on the {user?.tier} tier. Enjoy your benefits!
              </span>
            )
          }
        </div>

        <div className="rounded-lg p-8 shadow-sm w-full border border-zinc-100/10 bg-zinc-900/50 flex">
          <Select
              options={[
                {
                  value: "pix",
                  label: "Pix",
                },
                {
                  value: "credit_card",
                  label: "Cartão de Crédito",
                },                
              ]}
              className="w-64"
              value={{ value: "pix", label: "Pix" }}
              
              isSearchable={false}
              styles={{
              control: (provided) => ({
                ...provided,
                backgroundColor: "#3f3f3f",
                borderColor: "#4a5565",
                color: "white",
                minHeight: "40px",
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused ? "#4a5565" : "#3f3f3f",
                color: "white",
              }),
              singleValue: (provided) => ({
                ...provided,
                color: "white",
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: "#3f3f3f",
              }),
              menuPortal: (provided) => ({
                ...provided,
                zIndex: 10000,
              }),
              placeholder: (provided) => ({
                ...provided,
                color: "#adadad",
              }),
            }}
            />
          <DashButton
            icon={<ArrowRight size={16} />}
            label="Proceed to Checkout"
            onClick={() => {window.location.href = "/checkout";}}
          />          
        </div>
      </div>
    </div>
  );
};

export default TiersTemplate;
