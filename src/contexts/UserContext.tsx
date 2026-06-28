import { createContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { UserType } from "../@types/UserTypes";

interface UserContextType {
  user: UserType | null;
  setUser: Dispatch<SetStateAction<UserType | null>>;
  token: string | null;
  setToken: Dispatch<SetStateAction<string | null>>;
  logout: () => void;
  loading: boolean;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  token: null,
  setToken: () => {},
  logout: () => {},
  loading: true,
});
