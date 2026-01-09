import DeliveryModeToggle from "./components/DeliveryModeToggle";
import RadiusConfig from "./components/RadiusConfig";
import NeighborhoodConfig from "./components/NeighborhoodConfig";

export default async function EntregaPage() {
  const settings = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/store/settings`,
    { cache: "no-store" }
  ).then(res => res.json());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Entrega</h1>

      {/* Modo de entrega */}
      <DeliveryModeToggle currentMode={settings.deliveryMode} />

      {/* Configuração */}
      {settings.deliveryMode === "RADIUS" && <RadiusConfig />}
      {settings.deliveryMode === "NEIGHBORHOOD" && <NeighborhoodConfig />}
    </div>
  );
}
