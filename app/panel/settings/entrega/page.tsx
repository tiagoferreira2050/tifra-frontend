import { headers } from "next/headers";

import StoreAddress from "./components/StoreAddress";
import DeliveryModeToggle from "./components/DeliveryModeToggle";
import RadiusConfig from "./components/RadiusConfig";
import NeighborhoodConfig from "./components/NeighborhoodConfig";

/**
 * Página de Configuração de Entrega
 * - Server Component (SSR)
 * - Seguro em produção
 * - Não quebra se API falhar
 */
export default async function EntregaPage() {
  const headersList = headers();

  let settings: {
    deliveryMode: "RADIUS" | "NEIGHBORHOOD";
  } = {
    deliveryMode: "RADIUS",
  };

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/store/settings`,
      {
        cache: "no-store",
        headers: {
          cookie: headersList.get("cookie") || "",
        },
      }
    );

    if (res.ok) {
      settings = await res.json();
    }
  } catch (error) {
    console.error("Erro ao carregar configurações de entrega", error);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Entrega</h1>
        <p className="text-sm text-muted-foreground">
          Configure endereço, modo de entrega e taxas
        </p>
      </div>

      {/* 📍 Endereço da Loja (ponto central do raio) */}
      <StoreAddress />

      {/* 🔘 Modo de entrega */}
      <DeliveryModeToggle currentMode={settings.deliveryMode} />

      {/* ⚙️ Configurações por modo */}
      {settings.deliveryMode === "RADIUS" && (
        <div className="space-y-6">
          {/* Aqui depois entra o MapPlaceholder se quiser */}
          <RadiusConfig />
        </div>
      )}

      {settings.deliveryMode === "NEIGHBORHOOD" && (
        <div className="space-y-6">
          <NeighborhoodConfig />
        </div>
      )}
    </div>
  );
}
