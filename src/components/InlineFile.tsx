import { type FileType } from "../@types/Storage";
import useAuthContext from "../hook/useAuthContext";
import useFileModalContext from "../hook/useFileModalContext";
import ToBlob from "../utils/blob";
import Icons from "../utils/Icons";
import { formatDate } from "../utils/dateFormat";
import { useEffect, useState } from "react";

const InlineFile = ({file, setFile}: {file: FileType,setFile: (file: FileType) => void}) => {

    const { key } = useAuthContext();
    const [imageUrl, setImageUrl] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const { setFileModal } = useFileModalContext();

    useEffect(() => {
        const fetchURL = async () => {
            try {
                setLoading(true);
                const url = await ToBlob(file.file_id, key || "");
                setImageUrl(url);
                setFile({ ...file, blob: url });                
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file.file_id, key]); // Removed imageUrl from dependencies

    return (
        <div className={` bg-[#00000036] hover:border-1 hover:border-zinc-100/10 rounded-lg p-2 flex items-center gap-4 justify-between w-full hover:scale-102 transition-transform duration-200 cursor-pointer`} onClick={() => setFileModal(file)}>
            {loading ? (
                <div className="h-22 w-22 rounded bg-zinc-800 animate-pulse" />
            ) : (
                <img
                    src={imageUrl}
                    alt={file.file_id}
                    className="h-12 w-12 rounded object-cover object-center"
                />
            )}
            <span className="flex gap-1 p-2 w-full ">
                <h2 className="text-lg font-semibold w-full">{file.file_id}</h2>
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
                            {formatDate(file.uploaded_at)}
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

export default InlineFile;