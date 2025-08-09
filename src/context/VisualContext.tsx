import { createContext } from "react";
import { type VisualContextType } from "../@types/Contexts";

const VisualContext = createContext<VisualContextType | undefined>(undefined);

export default VisualContext;
