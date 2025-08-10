import Box from "../components/Box";
import RecentItem from "../components/RecentItem";
import RecentItems from "../components/RecentItems";
import useVisualContext from "../hook/useVisualContext";
import dashboardContent from "../utils/contents/DashBoard";
import Icons from "../utils/Icons";
import toast from "react-hot-toast";

const DashBoardTemplate = () => {
  const { language } = useVisualContext();
  return (
    <div className="flex flex-col h-full items-center px-24 py-10 gap-10">
      <header className="w-full flex justify-between items-center">
        <span className="flex flex-col gap-4">
          <h2 className="text-4xl font-bold">
            {dashboardContent.welcome[language]}
          </h2>
          <h5 className="text-sm text-zinc-400 tracking-wide">
            {dashboardContent.subtitle[language]}
          </h5>
        </span>
        <span className="flex gap-2">
          <button className="h-10 flex justify-start items-center gap-2 border-1 border-zinc-100/15 px-4">
            {Icons.storage}
            {dashboardContent.viewAll[language]}
          </button>
          <button
            className="h-10 flex justify-start items-center gap-2 border-0.5 border-zinc-100 px-4 bg-[#00000039]"
            onClick={() => {
              toast.success("Adicionado com sucesso!");
            }}
          >
            {Icons.add}
            {dashboardContent.addStorage[language]}
          </button>
        </span>
      </header>
      <div className="w-full flex justify-center gap-8">
        <Box label="Total Storage" footer="2357.1 GB used" icon={Icons.drive}>
          <div className="flex items-center flex-col justify-center h-[80%]">
            <h2 className="text-2xl font-bold">3672.0 GB</h2>
            <div className="w-full h-2 bg-zinc-200 rounded-full">
              <div
                className="h-full bg-zinc-500 rounded-full"
                style={{ width: "70%" }}
              />
            </div>
          </div>
        </Box>
        <Box
          label="Active Storage"
          footer="3 total storages"
          icon={Icons.activity}
        >
          <h2 className="text-4xl font-bold flex items-center h-full">3</h2>
        </Box>
        <Box
          label="Total Files"
          footer="Across all storages"
          icon={Icons.fileStack}
        >
          <h2 className="text-4xl font-bold flex items-center h-full">
            70.128
          </h2>
        </Box>
        <Box
          label="Performance"
          footer="All systems operational"
          icon={Icons.zap}
        >
          <h2 className="text-3xl font-bold flex items-center h-full text-green-600">
            OPTIMAL
          </h2>
        </Box>
      </div>
      <div className="w-full flex justify-center gap-10">
        <RecentItems icon={Icons.storage2} label="Recent Storages">
          <RecentItem icon={Icons.storage2} label="Storage 1" subLabel="2 GB">
            <span className="text-sm text-zinc-400">Storage 1</span>
          </RecentItem>
          <RecentItem icon={Icons.storage2} label="Storage 2" subLabel="5 GB">
            <span className="text-sm text-zinc-400">Storage 2</span>
          </RecentItem>
          <RecentItem icon={Icons.storage2} label="Storage 3" subLabel="10 GB">
            <span className="text-sm text-zinc-400">Storage 3</span>
          </RecentItem>
        </RecentItems>
        <RecentItems icon={Icons.files} label="Recent Files">
          <RecentItem icon={Icons.files} label="File 1" subLabel="1 MB">
            <span className="text-sm text-zinc-400">File 1</span>
          </RecentItem>
          <RecentItem icon={Icons.files} label="File 2" subLabel="2 MB">
            <span className="text-sm text-zinc-400">File 2</span>
          </RecentItem>
          <RecentItem icon={Icons.files} label="File 3" subLabel="3 MB">
            <span className="text-sm text-zinc-400">File 3</span>
          </RecentItem>
          <RecentItem icon={Icons.files} label="File 4" subLabel="4 MB">
            <span className="text-sm text-zinc-400">File 4</span>
          </RecentItem>
          <RecentItem icon={Icons.files} label="File 5" subLabel="5 MB">
            <span className="text-sm text-zinc-400">File 5</span>
          </RecentItem>
          <RecentItem icon={Icons.files} label="File 6" subLabel="6 MB">
            <span className="text-sm text-zinc-400">File 6</span>
          </RecentItem>
        </RecentItems>
      </div>
    </div>
  );
};

export default DashBoardTemplate;
