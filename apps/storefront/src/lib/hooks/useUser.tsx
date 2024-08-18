import { useEffect, useState } from "react";
import { User } from "@/saleor/api";
import { getCurrentUser } from "src/app/actions";

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      }
    };

    fetchCurrentUser();

    const handleLogout = () => {
      setUser(null);
    };

    const handleUserChange = async () => {
      fetchCurrentUser();
    };
    window.addEventListener("user-login", handleUserChange);
    window.addEventListener("user-logout", handleLogout);

    return () => {
      window.removeEventListener("user-login", handleUserChange);
      window.removeEventListener("user-logout", handleLogout);
    };
  }, []);

  return user;
};
