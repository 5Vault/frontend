import type { FileType } from "./Storage";

export type FileModal = {
    fileModal: FileType | null,
    setFileModal: (file: FileType | null) => void
}