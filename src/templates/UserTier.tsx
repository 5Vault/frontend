import { ArchiveRestore, ArrowLeft, ArrowRight, Banknote, CircleAlert, Plane, X } from "lucide-react";
import HeaderTemplate from "../components/Header";
import useVisualContext from "../hook/useVisualContext";
import DashButton from "../components/DashButton";
import useAuthContext from "../hook/useAuthContext";
import Select from "react-select";
import { useState } from "react";
import toast from "react-hot-toast";

const TiersTemplate = () => {
  const { language, tiers } = useVisualContext();
  const {user} = useAuthContext();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("pix");

  return (
    <div className="flex flex-col items-center justify-start h-screen w-screen p-2 gap-4 bg-gdnt">
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
            const free = tier.id === "free";            
            return (
              <div
                key={index}
                onClick={() => {
                  if (userTier) {
                    toast.error(`You are already on the ${tier.name} tier.`);
                    return;
                  }

                  if (free) {
                    toast.error("To become a free tier, just cancel your current plan.");
                    return;
                  }
                  
                  if (!free && !userTier) {
                    setSelectedTier(tier.id);
                  }
                }}
                className={` shadow-md rounded-lg p-4 flex flex-col items-center justify-between gap-2 h-80 w-80 hover:scale-102 ${
                  selectedTier === tier.id
                    ? "border-2 border-[var(--primary-contrast-light)] scale-102"
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
        <div className="rounded-lg p-4 shadow-sm w-full border border-zinc-100/10 bg-zinc-900/50">
          {
            user?.tier !== "free" ? (
              <span className="text-zinc-400">
                You are currently on the Free tier. Upgrade to a paid plan to
                unlock more features and storage.
              </span>
            ) : (
              <span className="flex flex-col gap-2 text-zinc-400">
                <span className="text-white text-center flex justify-start mb-4 gap-4 items-center text-xl">
                  <div className="p-2 bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)] rounded-2xl flex items-center justify-center"><Banknote /></div>
                  Cancel Your Plan
                </span>
                <span className="p-2 bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)] w-full rounded-xl flex items-center justify-start gap-2">
                  <ArchiveRestore />
                  <span className="font-semibold text-zinc-300/90">Don't worry, your data will be preserved.</span>
                </span>
                <span className="flex justify-between items-center w-full mt-4">
                  <h5 className="text-zinc-400 text-xs w-[60%]">You will be not allowed to send more images if your files exceed free tier capacity.</h5>
                  <DashButton
                    icon={<X size={16} />}
                    label="Cancel Plan"
                    onClick={() => {window.location.href = "/downgrade";}}                  
                  />
                </span>
                
              </span>
            )
          }
        </div>

        <div className="rounded-lg p-4 shadow-sm w-full border border-zinc-100/10 bg-zinc-900/50 flex flex-col gap-2 items-start justify-start">
          <span className="text-white text-center flex justify-start mb-4 gap-4 items-center text-xl">
            <div className="p-2 bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)] rounded-2xl flex items-center justify-center"><Banknote /></div>
            Payment Method
          </span>

          {
            selectedTier && (
              <span className="p-2 bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)] w-full rounded-xl flex items-center justify-start gap-2">
                <CircleAlert /> 
                <span className="font-semibold text-zinc-300/90">You have selected the {tiers.find(t => t.id === selectedTier)?.name} tier.</span>
              </span>
            ) 
          }
          
          <div className="flex gap-2 w-full items-center justify-center mt-4">
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
                value={{ value: paymentMethod, label: paymentMethod === "pix" ? "Pix" : "Cartão de Crédito" }}
                onChange={(option) => setPaymentMethod(option?.value || "pix")}
                menuPortalTarget={document.body}
                
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
              label="Checkout"
              onClick={() => {window.location.href = "/checkout";}}
              disabled={!selectedTier}
            />          
          </div>
        </div>
      </div>
    </div>
  );
};

export default TiersTemplate;
