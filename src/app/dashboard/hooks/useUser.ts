// app/dashboard/hooks/useUser.ts
"use client";

import { useState, useEffect } from "react";
import { User } from "../types";
import { useRouter } from "next/navigation";

export default function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Fetch user data from API
        const response = await fetch('/api/user/profile');
        
        if (!response.ok) {
          // If not authenticated, redirect to login
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        setUser(data.user);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [router]);
  
  return { user, loading, error };
}