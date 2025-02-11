import { useEffect, useState } from "react";
import { User } from "@/saleor/api";
import { getCurrentUser } from "src/app/actions";

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        // Only update the state if the fetched user is different from the current state
        if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      }
    };

    // Initialize user state on first render
    if (!initialized) {
      fetchCurrentUser();
      setInitialized(true);
    }

    const handleUserChange = () => {
      fetchCurrentUser();
    };

    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener("user-login", handleUserChange);
    window.addEventListener("user-logout", handleLogout);

    return () => {
      window.removeEventListener("user-login", handleUserChange);
      window.removeEventListener("user-logout", handleLogout);
    };
  }, [initialized, user]);

  return user;
};
