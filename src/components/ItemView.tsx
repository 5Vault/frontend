import { useEffect, useRef } from "react";
import type { FileType } from "../@types/Storage";

const ItemView = ({file, setFile}: {file: FileType, setFile: (file: FileType | null) => void}) => {

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setFile(null);
      }
    };
    const handleClose = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFile(null);
      }
    };
    window.addEventListener("keydown", handleClose);
    window.addEventListener("click", clickOutside);
    return () => {
      window.removeEventListener("keydown", handleClose);
      window.removeEventListener("click", clickOutside);
    };
  }, [setFile]);

  return (
    <div ref={ref} className="absolute w-screen h-screen top-0 left-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-start pt-20">      
      <h1 className="text-4xl font-bold">{file.file_id}</h1>
      <p className="text-sm text-zinc-400">{file.file_type}</p>
      <div className="mt-4">
        <img src={file.file_url} alt={file.file_id} className="max-w-full max-h-96 object-contain" />
      </div>      
    </div>
  );
};

export default ItemView;