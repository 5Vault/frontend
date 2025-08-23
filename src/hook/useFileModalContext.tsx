import { useContext } from "react";
import FileModalContext from "../context/FileModalContext";

const useFileModalContext = () => {
    const context = useContext(FileModalContext);
    if (!context) {
        throw new Error("useFileModalContext must be used within a FileModalProvider");
    }
    return context;
}

export default useFileModalContext;