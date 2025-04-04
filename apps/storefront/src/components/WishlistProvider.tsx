"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getCurrentUser } from "src/app/actions";

type WishlistContextType = {
  wishlistItems: string[];
  refreshWishlist: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);

  const refreshWishlist = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        const wishlistMetadata = user.metadata.find((meta) => meta.key === "wishlist");
        const currentWishlist = wishlistMetadata ? JSON.parse(wishlistMetadata.value) : [];
        setWishlistItems(currentWishlist);
      }
    } catch (error) {
      console.error("Error refreshing wishlist:", error);
      setWishlistItems([]);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, []);

  return (
    <WishlistContext.Provider value={{ wishlistItems, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
