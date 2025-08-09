import { useState, type ReactNode } from "react";
import type { AuthContextType } from "../@types/Contexts";
import AuthContext from "../context/AuthContext";

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthContextType["user"]>(null);

    const login = async (email: string, password: string) => {
        // Implement login logic
    };

    const logout = async () => {
        // Implement logout logic
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
