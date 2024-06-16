"use client";

import React, { ReactNode } from "react";
import NavigationPanel from "./NavigationPanel";
import { UserProvider } from "./UserContext";
import { Order, User } from "@/saleor/api";
import { Messages } from "@/lib/util";

interface ClientAccountLayoutProps {
  children: ReactNode;
  user: User;
  messages: Messages;
  orders: any[];
}

const ClientAccountLayout: React.FC<ClientAccountLayoutProps> = ({
  children,
  user,
  messages,
  orders,
}) => {
  return (
    <UserProvider value={{ user, messages, orders }}>
      <div className="py-10">
        <main className="flex flex-col md:flex-row container px-8">
          <div className="mb-2 flex-initial md:w-[300px] border-r-2 mr-8">
            <NavigationPanel messages={messages} />
          </div>
          <div className="flex flex-initial w-full flex-col overflow-y-auto md:px-4 space-y-4 h-full">
            {children}
          </div>
        </main>
      </div>
    </UserProvider>
  );
};

export default ClientAccountLayout;
