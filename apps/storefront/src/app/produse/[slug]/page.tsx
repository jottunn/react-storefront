"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { redirects } from "../../redirectProducts";
import { notFound } from "next/navigation";
import Spinner from "@/components/Spinner";

const ProdusePage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    const redirect = redirects.find((r) => r.source === pathname);

    if (redirect) {
      router.replace(redirect.destination);
    } else {
      notFound();
    }
  }, [pathname, router]);

  return <Spinner />;
};

export default ProdusePage;
