"use client";
import { createContext, useContext } from "react";
import { Order, User } from "@/saleor/api";
import { Messages } from "@/lib/util";

interface UserContextType {
  user: User | null;
  messages: Messages;
  orders: any[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = UserContext.Provider;

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
