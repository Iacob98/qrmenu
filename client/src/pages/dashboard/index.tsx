import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to menu management as the default dashboard page
    setLocation("/dashboard/menu");
  }, [setLocation]);

  return null;
}
