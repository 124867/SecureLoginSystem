import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser, loginSchema } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type AuthContextType = {
  user: Omit<SelectUser, "password"> | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<any, Error, z.infer<typeof loginSchema>>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<any, Error, InsertUser>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<Omit<SelectUser, "password"> | null>({
    queryKey: ["/api/user"],
    queryFn: async ({ queryKey }) => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem("auth_token");
        
        if (!token) {
          return null;
        }
        
        const res = await fetch(queryKey[0] as string, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        
        if (res.status === 401) {
          return null;
        }
        
        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        
        return await res.json();
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: z.infer<typeof loginSchema>) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (data) => {
      // Store token in localStorage
      localStorage.setItem("auth_token", data.token);
      
      // Update the user in react-query cache
      queryClient.setQueryData(["/api/user"], data.user);
      
      toast({
        title: "Login successful",
        description: "You have been successfully logged in.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: (data) => {
      // Store token in localStorage
      localStorage.setItem("auth_token", data.token);
      
      // Update the user in react-query cache
      queryClient.setQueryData(["/api/user"], data.user);
      
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
      // Remove token from localStorage
      localStorage.removeItem("auth_token");
    },
    onSuccess: () => {
      // Clear user from react-query cache
      queryClient.setQueryData(["/api/user"], null);
      
      toast({
        title: "Logout successful",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
