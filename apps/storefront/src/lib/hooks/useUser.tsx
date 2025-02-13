import { useEffect, useState } from "react";
import { User } from "@/saleor/api";
import { getCurrentUser } from "src/app/actions";

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        console.log("Fetched user:", currentUser); // Log the fetched user
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      }
    };

    fetchCurrentUser();

    const handleUserChange = () => {
      console.log("User change event detected");
      setTimeout(fetchCurrentUser, 2000);
    };

    window.addEventListener("user-login", handleUserChange);
    window.addEventListener("user-logout", handleUserChange);

    return () => {
      window.removeEventListener("user-login", handleUserChange);
      window.removeEventListener("user-logout", handleUserChange);
    };
  }, []);

  return user;
};
