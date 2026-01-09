import { headers } from "next/headers";
import DeliveryModeToggle from "./components/DeliveryModeToggle";
import RadiusConfig from "./components/RadiusConfig";
import NeighborhoodConfig from "./components/NeighborhoodConfig";

export default async function EntregaPage() {
  const headersList = headers();

  let settings = { deliveryMode: "RADIUS" };

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
  } catch (err) {
    console.error("Erro ao carregar delivery settings", err);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Entrega</h1>

      <DeliveryModeToggle currentMode={settings.deliveryMode} />

      {settings.deliveryMode === "RADIUS" && <RadiusConfig />}
      {settings.deliveryMode === "NEIGHBORHOOD" && <NeighborhoodConfig />}
    </div>
  );
}
