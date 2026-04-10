"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/pages/signin");
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F1E6]">
      <Loader2 className="h-10 w-10 animate-spin text-zinc-800" />
      <p className="mt-4 font-medium animate-pulse text-zinc-600">Syncing CourseCanvas...</p>
    </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}