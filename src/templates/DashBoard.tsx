import { useEffect, useState } from "react";
import type { DashBoardType, FileType } from "../@types/Storage";
import Box from "../components/Display/Box";
import RecentItems from "../components/RecentItems";
import useVisualContext from "../hook/useVisualContext";
import dashboardContent from "../utils/contents/DashBoard";
import Icons from "../utils/Icons";
import toast from "react-hot-toast";
import useAxios from "../utils/axiosConfig";
import useAuthContext from "../hook/useAuthContext";
import File from "../components/File/File";
import { Database, LayoutDashboard } from "lucide-react";
import DashButton from "../components/DashButton";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import HeaderTemplate from "../components/Header";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashBoardTemplate = () => {
  const { language } = useVisualContext();
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
  }, []);

  const handleFileUploaded = async () => {
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

  const setBlob = (file: FileType) => {
    setDashData((prevData) => {
      if (!prevData) return prevData;
      const updatedRecentFiles = prevData.recent_files.map((f) =>
        f.file_id === file.file_id ? { ...f, blob: file.blob } : f
      );
      return { ...prevData, recent_files: updatedRecentFiles };
    });
  };

  const chartData = {
    labels: dashData?.weekly_usage?.map(item => item.day) || [],
    datasets: [
      {
        label: 'Arquivos Enviados',
        data: dashData?.weekly_usage?.map(item => item.file_amount) || [],
        borderColor: '#e8073f',
        backgroundColor: '#e8073f36',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ec4899',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#ec4899',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Uploads da Semana',
        color: '#e4e4e7',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: {
          bottom: 20
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#a1a1aa',
          stepSize: 1,
          font: {
            size: 12
          }
        },
        grid: {
          color: '#3f3f46',
          drawBorder: false,
        },
        border: {
          display: false
        }
      },
      x: {
        ticks: {
          color: '#a1a1aa',
          font: {
            size: 12
          }
        },
        grid: {
          color: '#3f3f46',
          drawBorder: false,
        },
        border: {
          display: false
        }
      },
    },
  };

  const boxes = [{
    label: "Total Storage",
    footer: ` ${formatGB(dashData?.total_size)} GB used`,
    icon: Icons.drive,
    content: (
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
    ),
  }, {
    label: "Total Files",
    footer: "Across all storages",
    icon: Icons.fileStack,
    content: (
      <h2 className="text-4xl font-bold flex items-center h-full">
        {dashData?.total_files}
      </h2>
    ),
  }, {
    label: "Performance",
    footer: "All systems operational",
    icon: Icons.zap,
    content: (
      <h2 className="text-3xl font-bold flex items-center h-full text-green-600">
        OPTIMAL
      </h2>
    ),
  },]


  return (
    <div className="flex flex-col h-full items-center gap-4">
      <HeaderTemplate
        icon={<LayoutDashboard size={38} />}
        title={`${dashboardContent.welcome[language]}, ${user?.name || "User"}`}
        description={dashboardContent.subtitle[language]}
        content={          
          <DashButton 
            icon={<Database 
            size={16} />} 
            label={dashboardContent.viewAll[language]} 
            onClick={soon} />            
        }
      />
      
      <span className="flex w-full gap-4 items-start justify-center">
        <div className="flex flex-col justify-center items-center gap-4 flex-1">
          <div className="w-full flex justify-center gap-4">
            {boxes.map((box, index) => (
              <Box
                key={index}
                label={box.label}
                footer={box.footer}
                icon={box.icon}
              >
                {box.content}
              </Box>
            ))}            
          </div>
          <div className="w-full border border-zinc-800 rounded-xl bg-zinc-900/50 p-6 h-110.5">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>        
        <RecentItems             
          label="Recent Files"                      
          onFileUploaded={handleFileUploaded}
        >
          {dashData?.recent_files.map((file) => (
            <File key={file.id} file={file} setFile={setBlob}/>
          ))}
        </RecentItems>
        
      </span>
    </div>
  );
};

export default DashBoardTemplate;