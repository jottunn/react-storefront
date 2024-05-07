import { Footer } from "../Footer";
import { Navbar } from "../Navbar";

export interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <Navbar />
      <div className="align-middle flex flex-col flex-grow border-b-2 min-h-[700px]">
        {children}
      </div>
      <Footer />
    </>
  );
}

export default Layout;
