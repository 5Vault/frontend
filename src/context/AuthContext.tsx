import { createContext } from "react";
import { type AuthContextType } from "../@types/Contexts";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
