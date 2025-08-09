import {
  Activity,
  ArrowRight,
  Database,
  Files,
  FileStack,
  HardDrive,
  House,
  Plus,
  Search,
  Settings,
  Shield,
  Zap,
} from "lucide-react";

const Icons = {
  home: <House size={20} />,
  storage: <Database size={20} />,
  storage2: <Database size={24} />,
  settings: <Settings size={20} />,
  shield: <Shield className="w-8 h-8 text-white" />,
  add: <Plus size={20} />,
  drive: <HardDrive size={20} />,
  activity: <Activity size={20} />,
  fileStack: <FileStack size={20} />,
  zap: <Zap size={20} />,
  goto: <ArrowRight size={20} />,
  files: <Files size={24} />,
  search: <Search size={20} />,
};

export default Icons;
