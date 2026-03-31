"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type UserRole = "student" | "instructor";

type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!error && data.session?.user) {
        const sessionUser = data.session.user;

        setUser({
          id: sessionUser.id,
          email: sessionUser.email ?? "",
          name:
            (sessionUser.user_metadata?.full_name as string) ||
            (sessionUser.email?.split("@")[0] ?? "User"),
          role:
            (sessionUser.user_metadata?.role as UserRole) || "student",
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const sessionUser = session.user;

        setUser({
          id: sessionUser.id,
          email: sessionUser.email ?? "",
          name:
            (sessionUser.user_metadata?.full_name as string) ||
            (sessionUser.email?.split("@")[0] ?? "User"),
          role:
            (sessionUser.user_metadata?.role as UserRole) || "student",
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}