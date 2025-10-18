import { type FileType } from "../@types/Storage";
import useAuthContext from "../hook/useAuthContext";
import Icons from "../utils/Icons";
import { useEffect, useState } from "react";

const File = ({file, setFile, wFull}: {file: FileType, setFile: (file: FileType | null) => void, wFull?: boolean}) => {

    const { key } = useAuthContext();
    const [imageUrl, setImageUrl] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchURL = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `${import.meta.env.VITE_SERVER_URL}/file/${file.file_id}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Api-Key": key || "",
                        },
                    }
                );
                
                if (!response.ok) {
                    throw new Error("Failed to fetch file");
                }

                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setImageUrl(url);
            } catch (error) {
                console.error("Error fetching file:", error);
            } finally {
                setLoading(false);
            }
        };

        if (key && file.file_id) {
            fetchURL();
        }

        // Cleanup: revogar URL do blob quando o componente desmontar
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [file.file_id, key, imageUrl]);

    return (
        <div className={` bg-[#00000036] hover:border-1 hover:border-zinc-100/10 rounded-lg p-2 flex items-center gap-4 justify-between ${wFull ? "w-full" : "w-160"} hover:scale-102 transition-transform duration-200 cursor-pointer`} onClick={() => setFile(file)}>
            {loading ? (
                <div className="h-22 w-22 rounded bg-zinc-800 animate-pulse" />
            ) : (
                <img
                    src={imageUrl}
                    alt={file.file_id}
                    className="h-22 w-22 rounded object-cover"
                />
            )}
            <span className="flex flex-col gap-2 p-2 ">
                <h2 className="text-xl font-semibold">{file.file_id}</h2>
                <div className="flex w-full justify-between">
                    {file.file_type === "image/jpeg" ||
                    file.file_type === "image/png" ? (
                        <p className="flex items-center gap-2">
                            {Icons.image} <span className="text-zinc-400">Imagem</span>
                        </p>
                    ) : file.file_type === "video/mp4" ? (
                        <p className="flex items-center gap-2">
                            {Icons.video} <span className="text-zinc-400">Vídeo</span>
                        </p>
                    ) : file.file_type === "audio/mpeg" ? (
                        <p className="flex items-center gap-2">
                            {Icons.audio} <span className="text-zinc-400">Áudio</span>
                        </p>
                    ) : (
                        <p className="flex items-center gap-2">
                            {Icons.files} <span className="text-zinc-400">Arquivo</span>
                        </p>
                    )}
                    <p className="flex items-center gap-2">
                        {Icons.date}
                        <span className="text-zinc-400">
                            {new Date(file.uploaded_at).toLocaleString()}
                        </span>
                    </p>
                    <p className="text-sm flex items-center gap-2">
                        {Icons.storage}
                        <span className="text-zinc-400">
                            {(file.file_size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                    </p>
                </div>
            </span>
        </div>
    );
}

export default File;