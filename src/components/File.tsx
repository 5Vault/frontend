import { type FileType } from "../@types/Storage";
import Icons from "../utils/Icons";

const File = ({file}: {file: FileType}) => {
    return (
        <div className="border border-zinc-100/10 rounded-lg p-2 flex items-center gap-4 justify-start w-fit hover:scale-105 transition-all duration-200 cursor-pointer">
            <img
                src={file.file_url}
                alt={file.file_id}
                className="h-36 w-36 rounded"
            />
            <span className="flex flex-col gap-2 p-2">
                <h2 className="text-xl font-semibold">{file.file_id}</h2>
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
            </span>
        </div>
    );
}

export default File;