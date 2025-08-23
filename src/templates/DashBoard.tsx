import { useEffect, useState } from "react";
import type { DashBoardType } from "../@types/Storage";
import Box from "../components/Box";
// import RecentItem from "../components/RecentItem";
import RecentItems from "../components/RecentItems";
import useVisualContext from "../hook/useVisualContext";
import dashboardContent from "../utils/contents/DashBoard";
import Icons from "../utils/Icons";
import toast from "react-hot-toast";
import useAxios from "../utils/axiosConfig";
import useAuthContext from "../hook/useAuthContext";
import File from "../components/File";
import useFileModalContext from "../hook/useFileModalContext";

const DashBoardTemplate = () => {
  const { language } = useVisualContext();
  const {setFile} = useFileModalContext();
  const { user } = useAuthContext();
  const [dashData, setDashData] = useState<DashBoardType | null>(null);

  const axiosInstance = useAxios();

  const soon = () => {
    toast.error("Em breve!");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("/file/stats");
        setDashData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only on mount

  const handleFileUploaded = async () => {
    // Refresh dashboard data when a new file is uploaded
    try {
      const response = await axiosInstance.get("/file/stats");
      setDashData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const getStoragePercent = () => {
    if (!dashData || !dashData.total_size || !dashData.used_size) return 0;
    if (dashData.total_size === 0) return 0;
    return Math.min(
      100,
      Math.round((dashData.used_size / dashData.total_size) * 100)
    );
  };

  const formatGB = (bytes?: number) =>
    bytes ? (bytes / (1024 * 1024 * 1024)).toFixed(2) : "0.00";

  return (
    <div className="flex flex-col h-full items-center px-24 py-10 gap-10">
      <header className="w-full flex justify-between items-center">
        <span className="flex flex-col gap-4">
          <h2 className="text-4xl font-bold">
            {dashboardContent.welcome[language]}, {user?.name}
          </h2>
          <h5 className="text-sm text-zinc-400 tracking-wide">
            {dashboardContent.subtitle[language]}
          </h5>
        </span>
        <span className="flex gap-2">
          <button
            className="h-10 flex justify-start items-center gap-2 border-1 border-zinc-100/15 px-4"
            onClick={soon}
          >
            {Icons.storage}
            {dashboardContent.viewAll[language]}
          </button>
          <button
            className="h-10 flex justify-start items-center gap-2 bg-[var(--primary-contrast-opacity)] border border-[var(--primary-contrast-light)] px-4"
            onClick={soon}
          >
            {Icons.add}
            {dashboardContent.addStorage[language]}
          </button>
        </span>
      </header>
      <div className="w-full flex justify-center gap-8">
        <Box
          label="Total Storage"
          footer={` ${formatGB(dashData?.total_size)} GB used`}
          icon={Icons.drive}
        >
          <div className="flex items-center flex-col justify-center h-[80%]">
            <h2 className="text-2xl font-bold">
              {formatGB(dashData?.used_size)} GB
            </h2>
            <div className="w-full h-2 bg-zinc-200 rounded-full">
              <div
                className="h-full bg-[var(--primary-contrast-light)] rounded-full"
                style={{ width: `${getStoragePercent()}%` }}
              />
            </div>
          </div>
        </Box>
        <Box
          label="Total Files"
          footer="Across all storages"
          icon={Icons.fileStack}
        >
          <h2 className="text-4xl font-bold flex items-center h-full">
            {dashData?.total_files}
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
        <RecentItems 
          icon={Icons.files} 
          label="Recent Files" 
          width="w-176"
          onFileUploaded={handleFileUploaded}
        >
          {dashData?.recent_files.map((file) => (
            <File key={file.id} file={file} setFile={setFile} wFull/>
            // <RecentItem
            //   key={file.id}
            //   icon={
            //     file.file_type === "image/jpeg" ||
            //     file.file_type === "image/png"
            //       ? Icons.image
            //       : file.file_type === "video/mp4"
            //       ? Icons.video
            //       : file.file_type === "audio/mpeg"
            //       ? Icons.audio
            //       : Icons.files
            //   }
            //   label={file.file_id}
            //   subLabel={(file.file_size / (1024 * 1024)).toFixed(2) + " MB"}
            // >
            //   <img
            //     src={file.file_url}
            //     alt={file.file_id}
            //     className="w-18 h-18 rounded"
            //   />
            // </RecentItem>
          ))}
        </RecentItems>
      </div>
    </div>
  );
};

export default DashBoardTemplate;

{
  /* <RecentItems icon={Icons.storage2} label="Recent Storages">
<RecentItem icon={Icons.storage2} label="Storage 1" subLabel="2 GB">
<span className="text-sm text-zinc-400">Storage 1</span>
</RecentItem>
<RecentItem icon={Icons.storage2} label="Storage 2" subLabel="5 GB">
<span className="text-sm text-zinc-400">Storage 2</span>
</RecentItem>
<RecentItem icon={Icons.storage2} label="Storage 3" subLabel="10 GB">
<span className="text-sm text-zinc-400">Storage 3</span>
</RecentItem>
</RecentItems> */
}

{
  /* <Box
label="Active Storage"
footer="3 total storages"
icon={Icons.activity}
>
<h2 className="text-4xl font-bold flex items-center h-full">3</h2>
</Box> */
}
