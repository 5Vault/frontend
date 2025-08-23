import { createContext } from "react";
import type { FileModal } from "../@types/FileModal";

const FileModalContext = createContext<FileModal | null>(null);

export default FileModalContext;
