import toast from "react-hot-toast";
import useVisualContext from "../hook/useVisualContext";
import Content from "../utils/Content";
import Icons from "../utils/Icons";
import InputWithIcon from "../components/InputWithIcon";
import Storage from "../components/Storage";

const StoragesTemplate = () => {
  const { language } = useVisualContext();
  return (
    <div className="flex flex-col items-center justify-start w-full h-full gap-8 px-24 py-10">
      <header className="w-full flex justify-between items-center">
        <span className="flex flex-col gap-4">
          <h2 className="text-4xl font-bold">Store Management</h2>
          <h5 className="text-sm text-zinc-400 tracking-wide">
            Monitor and manage your storage infrastructure.
          </h5>
        </span>
        <span className="flex gap-2">
          {/* Usando o componente InputWithIcon */}
          <InputWithIcon icon={Icons.search} placeholder="Search Storages..." />
          <button
            className="h-10 flex justify-start items-center gap-2 border-0.5 border-zinc-100 px-4 bg-[#00000039]"
            onClick={() => {
              toast.success("Adicionado com sucesso!");
            }}
          >
            {Icons.add}
            {Content.dashboard.top.four.labels[language]}
          </button>
        </span>
      </header>
      <div className="flex flex-wrap overflow-y-auto w-full justify-center gap-10 p-2">
        <Storage
          id="1"
          name="Storage 1"
          size={100}
          used={50}
          totalFiles={10}
          lastAccessed={new Date()}
        />
        <Storage
          id="2"
          name="Storage 2"
          size={200}
          used={100}
          totalFiles={20}
          lastAccessed={new Date()}
        />
        <Storage
          id="3"
          name="Storage 3"
          size={300}
          used={150}
          totalFiles={30}
          lastAccessed={new Date()}
        />
        <Storage
          id="4"
          name="Storage 4"
          size={400}
          used={200}
          totalFiles={40}
          lastAccessed={new Date()}
        />
      </div>
    </div>
  );
};

export default StoragesTemplate;
