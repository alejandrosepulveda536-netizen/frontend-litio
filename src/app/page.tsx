"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginPage from "@/components/LoginPage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (session) router.replace("/dashboard");
  }, [router]);

  return <LoginPage />;
}
