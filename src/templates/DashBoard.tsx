import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import type { DashBoardType, FileType } from "../@types/Storage";
import Box from "../components/Box";
import RecentItems from "../components/RecentItems";
import Icons from "../utils/Icons";
import toast from "react-hot-toast";
import useAxios from "../utils/axiosConfig";
import useAuthContext from "../hook/useAuthContext";
import File from "../components/File";
import { Database, LayoutDashboard } from "lucide-react";
import DashButton from "../components/DashButton";
import { Line } from "react-chartjs-2";
import { saveCardFromIntent } from "../api/payment";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import HeaderTemplate from "../components/Header";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const DashBoardTemplate = () => {
  const { user } = useAuthContext();
  const [dashData, setDashData] = useState<DashBoardType | null>(null);
  const [bucketTotalFiles, setBucketTotalFiles] = useState<number>(0);
  const axiosInstance = useAxios();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    axiosInstance.get("/file/stats").then((r) => setDashData(r.data)).catch(() => {});
    axiosInstance.get("/bucket/stats").then((r) => setBucketTotalFiles(r.data?.total_files ?? 0)).catch(() => {});
  }, []);

  // Handle Stripe redirect after successful payment
  useEffect(() => {
    const payment = searchParams.get("payment");
    const shouldSave = searchParams.get("save_card") === "true";
    const piID = searchParams.get("payment_intent");

    if (payment === "success") {
      toast.success("Pagamento realizado com sucesso!");
      if (shouldSave && piID) {
        saveCardFromIntent(piID)
          .then(() => toast.success("Cartão salvo para transações futuras."))
          .catch(() => toast.error("Não foi possível salvar o cartão."));
      }
      // Clean URL params
      setSearchParams({}, { replace: true });
    }
  }, []);

  const handleFileUploaded = () => {
    axiosInstance.get("/file/stats").then((r) => setDashData(r.data)).catch(() => {});
  };

  const getStoragePercent = () => {
    if (!dashData?.total_size || dashData.total_size === 0) return 0;
    return Math.min(100, Math.round((dashData.used_size / dashData.total_size) * 100));
  };

  const formatGB = (bytes?: number) =>
    bytes ? (bytes / (1024 * 1024 * 1024)).toFixed(2) : "0.00";

  const setBlob = (file: FileType) => {
    setDashData((prev) => {
      if (!prev) return prev;
      return { ...prev, recent_files: prev.recent_files.map((f) => f.file_id === file.file_id ? { ...f, blob: file.blob } : f) };
    });
  };

  const chartData = {
    labels: dashData?.weekly_usage?.map((i) => i.day) || [],
    datasets: [{
      label: "Arquivos Enviados",
      data: dashData?.weekly_usage?.map((i) => i.file_amount) || [],
      borderColor: "#e8073f",
      backgroundColor: "#e8073f20",
      tension: 0.4,
      fill: true,
      pointBackgroundColor: "#e8073f",
      pointBorderColor: "#18181b",
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: "#18181b",
        borderColor: "#27272a",
        borderWidth: 1,
        titleColor: "#fff",
        bodyColor: "#a1a1aa",
        padding: 10,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 5,
        ticks: { color: "#71717a", stepSize: 1, precision: 0, font: { size: 11 } },
        grid: { color: "#27272a" },
        border: { display: false },
      },
      x: {
        ticks: { color: "#71717a", font: { size: 11 } },
        grid: { color: "#27272a40" },
        border: { display: false },
      },
    },
  };

  const storagePercent = getStoragePercent();
  const boxes = [
    {
      label: "Armazenamento",
      footer: `${formatGB(dashData?.total_size)} GB disponíveis`,
      icon: Icons.drive,
      content: (
        <div className="flex flex-col gap-2 justify-center h-[80%]">
          <h2 className="text-2xl font-bold">{formatGB(dashData?.used_size)} GB</h2>
          <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${storagePercent}%`,
                backgroundColor: storagePercent > 80 ? "#ef4444" : "#e8073f",
              }}
            />
          </div>
          <span className="text-xs text-zinc-500">{storagePercent}% utilizado</span>
        </div>
      ),
    },
    {
      label: "Total de Arquivos",
      footer: "Em todos os storages",
      icon: Icons.fileStack,
      content: (
        <h2 className="text-4xl font-bold flex items-center h-full">
          {bucketTotalFiles}
        </h2>
      ),
    },
    {
      label: "Performance",
      footer: "Todos os sistemas operacionais",
      icon: Icons.zap,
      content: (
        <h2 className="text-2xl font-bold flex items-center h-full text-emerald-400">
          ÓTIMO
        </h2>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full gap-4">
      <HeaderTemplate
        icon={<LayoutDashboard size={38} />}
        title={`Olá, ${user?.name || "Usuário"} 👋`}
        description="Gerencie seu armazenamento em nuvem com facilidade"
        content={
          <DashButton
            icon={<Database size={16} />}
            label="Ver todos os storages"
            onClick={() => toast.error("Em breve!")}
          />
        }
      />

      <div className="flex w-full gap-4 items-start min-h-0 flex-1">
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          <div className="w-full flex gap-4">
            {boxes.map((box, i) => (
              <Box key={i} label={box.label} footer={box.footer} icon={box.icon}>
                {box.content}
              </Box>
            ))}
          </div>
          <div className="w-full border border-zinc-800 rounded-xl bg-zinc-900/50 p-6 flex flex-col gap-4 h-96">
            <p className="text-sm font-semibold text-zinc-200">Uploads da Semana</p>
            <div className="flex-1 min-h-0">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="w-80 shrink-0 h-full">
          <RecentItems label="Arquivos Recentes" onFileUploaded={handleFileUploaded}>
            {(dashData?.recent_files ?? []).map((file) => (
              <File key={file.id} file={file} setFile={setBlob} />
            ))}
          </RecentItems>
        </div>
      </div>
    </div>
  );
};

export default DashBoardTemplate;
