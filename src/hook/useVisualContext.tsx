import { useContext } from "react";
import VisualContext from "../context/VisualContext";

const useVisualContext = () => {
  const context = useContext(VisualContext);
  if (!context) {
    throw new Error("useVisualContext must be used within a VisualProvider");
  }
  return context;
};

export default useVisualContext;
