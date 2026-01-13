"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuth } from "@/src/lib/auth-check";
import { getMyStore } from "@/src/lib/store";

export default function PanelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<any>(null);

  useEffect(() => {
    async function init() {
      const ok = await checkAuth();

      if (!ok) {
        router.replace("/login");
        return;
      }

      const storeData = await getMyStore();
      setStore(storeData);
      setLoading(false);
    }

    init();
  }, [router]);

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <div>
      <h1>Painel</h1>
      <p>Loja: {store?.name}</p>
    </div>
  );
}
