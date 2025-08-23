import type { FileType } from "./Storage";

export type FileModal = {
    file: FileType | null,
    setFile: (file: FileType | null) => void
}