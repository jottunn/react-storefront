import { DEFAULT_LOCALE } from "@/lib/regions";
import { getMessages } from "@/lib/util";
import { ReactNode } from "react";
import NavigationPanel from "./NavigationPanel";

export type AccountLayoutProps = { children: ReactNode };
const AccountLayout = async ({ children }: AccountLayoutProps) => {
  const messages = getMessages(DEFAULT_LOCALE);
  return (
    <div className="md:py-10 min-h-[400px]">
      <main className="flex flex-col md:flex-row md:container md:px-8">
        <div className="mb-2 flex-initial md:w-[300px] md:mr-8 md:border-r-2">
          <NavigationPanel messages={messages} />
        </div>
        <div className="flex flex-initial w-full flex-col overflow-y-auto md:px-4 space-y-4 h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AccountLayout;
