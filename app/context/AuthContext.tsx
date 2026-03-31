"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";

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
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      setLoading(true);

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !user) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser({
        id: user.id,
        email: user.email ?? "",
        name:
          (user.user_metadata?.full_name as string) ||
          (user.email?.split("@")[0] ?? "User"),
        role: (user.user_metadata?.role as UserRole) || "student",
      });

      setLoading(false);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      if (!session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      const sessionUser = session.user;

      setUser({
        id: sessionUser.id,
        email: sessionUser.email ?? "",
        name:
          (sessionUser.user_metadata?.full_name as string) ||
          (sessionUser.email?.split("@")[0] ?? "User"),
        role: (sessionUser.user_metadata?.role as UserRole) || "student",
      });

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

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