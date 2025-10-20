import { useState, type ReactNode } from "react";
import FileModalContext from "../context/FileModalContext";
import type { FileType } from "../@types/Storage";

const FileModalProvider = ({ children }: { children: ReactNode }) => {
  const [fileModal, setFileModal] = useState<FileType | null>(null);

  return (
    <FileModalContext.Provider value={{ fileModal, setFileModal }}>
      {children}
    </FileModalContext.Provider>
  );
};

export default FileModalProvider;