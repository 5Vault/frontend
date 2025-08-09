import useVisualContext from "../hook/useVisualContext";
import Content from "../utils/Content";
import Icons from "../utils/Icons";

const Side = () => {
  const { language } = useVisualContext();

  return (
    <div className="w-80 h-full bg-zinc-800 flex flex-col justify-between border-r border-zinc-700">
      <div>
        <header className="flex w-full h-20 border-b border-zinc-700 items-center justify-start gap-4 p-4">
          {Icons.shield}
          <div className="flex flex-col items-start justify-start">
            <h2 className="text-white font-bold text-xl">5Vault</h2>
            <span className="text-sm text-zinc-400">Secure your data</span>
          </div>
        </header>
        <span>
          {Object.entries(Content.side).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center p-4 hover:bg-zinc-700"
              onClick={() => {
                window.location.href = `/${key}`;
              }}
            >
              <span className="mr-2">{value.icon}</span>
              <span
                className={`${
                  window.location.pathname === `/${key}`
                    ? "text-zinc-50"
                    : "text-zinc-500"
                }`}
              >
                {value.labels[language]}
              </span>
            </div>
          ))}
        </span>
      </div>
      <div className="flex w-full h-20 border-t border-zinc-700 items-center justify-start p-4 gap-4">
        <span className="p-4 bg-blue-300/15 rounded-full w-13 h-13 flex items-center justify-center">
          C
        </span>
        <div className="flex flex-col items-start justify-start">
          <span className="text-white">Caio Reis</span>
          <span className="text-sm text-zinc-400">caiodtn@gmail.com</span>
        </div>
      </div>
    </div>
  );
};

export default Side;
