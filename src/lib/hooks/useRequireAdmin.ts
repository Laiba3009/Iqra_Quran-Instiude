"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabaseClient";

export default function useRequireAdmin() {
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data, error } = await supabase.auth.getUser();

      const role =
        document.cookie
          .split("; ")
          .find((r) => r.startsWith("portal_role="))
          ?.split("=")[1] || localStorage.getItem("userRole");

      if (!data.user || role !== "admin") {
        router.replace("/admin/signin");
      }
    };

    checkAdmin();
  }, [router]);
}
