import { useState, type ReactNode } from "react";
import FileModalContext from "../context/FileModalContext";
import type { FileType } from "../@types/Storage";

const FileModalProvider = ({ children }: { children: ReactNode }) => {
  const [file, setFile] = useState<FileType | null>(null);

  return (
    <FileModalContext.Provider value={{ file, setFile }}>
      {children}
    </FileModalContext.Provider>
  );
};

export default FileModalProvider;