"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthVerification() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.replace("/signin");
      return;
    }

    const role = session.user.role;

    if (role === "ADMIN") {
      router.replace("/admin-dashboard");
    } else {
      router.replace("/home");
    }
  }, [session, status, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-lg font-medium">Verifying your account...</p>
    </div>
  );
}
