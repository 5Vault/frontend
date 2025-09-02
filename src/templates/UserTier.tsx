import useVisualContext from "../hook/useVisualContext";
import Content from "../utils/Content";

const UserTierTemplate = () => {
  const { language } = useVisualContext();
  return (
    <div className="flex justify-center gap-4">
      {(Object.keys(Content.plans) as Array<keyof typeof Content.plans>).map(
        (key) => {
          const plan = Content.plans[key];
          return (
            <div
              key={key}
              className={` shadow-md rounded-lg p-4 flex flex-col items-center justify-between gap-2 h-90 w-80 hover:scale-102 ${
                key === "pro"
                  ? "border-2 border-[var(--primary-contrast-light)]"
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
                  key === "pro"
                    ? "bg-[var(--primary-contrast-light)] text-white"
                    : ""
                } hover:bg-[var(--primary-contrast-dark)] hover:text-white transition-colors`}
              >
                Escolher
              </button>
            </div>
          );
        }
      )}
    </div>
  );
};

export default UserTierTemplate;
