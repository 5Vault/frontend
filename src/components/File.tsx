import { type FileType } from "../@types/Storage";
import useAuthContext from "../hook/useAuthContext";
import useFileModalContext from "../hook/useFileModalContext";
import ToBlob from "../utils/blob";
import Icons from "../utils/Icons";
import { formatDate } from "../utils/dateFormat";
import { useEffect, useState } from "react";

const File = ({file, setFile}: {file: FileType,setFile: (file: FileType) => void}) => {

    const { key } = useAuthContext();
    const [imageUrl, setImageUrl] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const { setFileModal } = useFileModalContext();

    useEffect(() => {
        // If the file already has a public URL, use it directly
        if (file.file_url && file.file_url.startsWith("http")) {
            setImageUrl(file.file_url);
            setFile({ ...file, blob: file.file_url });
            setLoading(false);
            return;
        }

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

        return () => {
            if (imageUrl && imageUrl.startsWith("blob:")) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file.file_id, file.file_url, key]);

    const typeLabel =
        file.file_type?.startsWith("image") ? "Imagem" :
        file.file_type?.startsWith("video") ? "Vídeo" :
        file.file_type?.startsWith("audio") ? "Áudio" : "Arquivo";

    const typeIcon =
        file.file_type?.startsWith("image") ? Icons.image :
        file.file_type?.startsWith("video") ? Icons.video :
        file.file_type?.startsWith("audio") ? Icons.audio : Icons.files;

    const shortId = file.file_id?.slice(-14) ?? "";
    const sizeMB = file.file_size ? (file.file_size / (1024 * 1024)).toFixed(2) : "0.00";

    return (
        <div
            className="bg-zinc-900/50 hover:bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 rounded-xl p-3 flex items-center gap-3 w-full transition-all duration-150 cursor-pointer"
            onClick={() => setFileModal(file)}
        >
            {/* Thumbnail */}
            {loading ? (
                <div className="h-12 w-12 min-w-12 rounded-lg bg-zinc-800 animate-pulse shrink-0" />
            ) : (
                <img
                    src={imageUrl}
                    alt={file.file_id}
                    className="h-12 w-12 min-w-12 rounded-lg object-cover border border-zinc-700 shrink-0"
                />
            )}

            {/* Info */}
            <div className="flex flex-col gap-1 flex-1 min-w-0">
                <p className="text-xs font-medium text-white font-mono truncate">…{shortId}</p>
                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1">{typeIcon} {typeLabel}</span>
                    <span className="text-zinc-700">·</span>
                    <span>{sizeMB} MB</span>
                    <span className="text-zinc-700">·</span>
                    <span>{formatDate(file.uploaded_at)}</span>
                </div>
            </div>
        </div>
    );
}

export default File;